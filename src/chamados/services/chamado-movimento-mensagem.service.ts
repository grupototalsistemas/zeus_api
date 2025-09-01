import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { StatusRegistro } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ChamadoMovimentoMensagemQueryDto,
  CreateChamadoMovimentoMensagemDto,
  UpdateChamadoMovimentoMensagemDto,
} from '../dto/chamado-movimento-mensagem.dto';

@Injectable()
export class ChamadoMovimentoMensagemService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateChamadoMovimentoMensagemDto) {
    try {
      // Verificar se o movimento existe
      const movimento = await this.prisma.chamadoMovimento.findUnique({
        where: { id: createDto.movimentoId },
      });

      if (!movimento) {
        throw new NotFoundException('Movimento do chamado não encontrado');
      }

      if (movimento.ativo !== StatusRegistro.ATIVO) {
        throw new BadRequestException('Movimento do chamado não está ativo');
      }

      // Definir ordem automática se não fornecida
      let ordem = createDto.ordem;
      if (!ordem) {
        const lastMessage =
          await this.prisma.chamadoMovimentoMensagem.findFirst({
            where: { movimentoId: createDto.movimentoId },
            orderBy: { ordem: 'desc' },
          });
        ordem = lastMessage ? (lastMessage.ordem || 0) + 1 : 1;
      }

      // Definir data de envio se não fornecida
      const envio = createDto.envio || new Date();

      const mensagem = await this.prisma.chamadoMovimentoMensagem.create({
        data: {
          movimentoId: createDto.movimentoId,
          usuarioEnvioId: createDto.usuarioEnvioId,
          usuarioLeituraId: createDto.usuarioLeituraId,
          ordem,
          descricao: createDto.descricao,
          envio,
          leitura: createDto.leitura,
          ativo: createDto.ativo || StatusRegistro.ATIVO,
          motivo: createDto.motivo,
        },
        include: {
          movimento: {
            select: {
              id: true,
              chamadoId: true,
              descricaoAcao: true,
            },
          },
        },
      });

      return mensagem;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(`Erro ao criar mensagem: ${error.message}`);
    }
  }

  async findAll(query?: ChamadoMovimentoMensagemQueryDto) {
    const { page = 1, limit = 10, ...filters } = query || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.movimentoId) {
      where.movimentoId = filters.movimentoId;
    }

    if (filters.usuarioEnvioId) {
      where.usuarioEnvioId = filters.usuarioEnvioId;
    }

    if (filters.usuarioLeituraId) {
      where.usuarioLeituraId = filters.usuarioLeituraId;
    }

    if (filters.ativo) {
      where.ativo = filters.ativo;
    }

    const [mensagens, total] = await Promise.all([
      this.prisma.chamadoMovimentoMensagem.findMany({
        where,
        include: {
          movimento: {
            select: {
              id: true,
              chamadoId: true,
              descricaoAcao: true,
              etapa: {
                select: {
                  id: true,
                  descricao: true,
                },
              },
              chamado: {
                select: {
                  id: true,
                  protocolo: true,
                  titulo: true,
                },
              },
            },
          },
        },
        orderBy: [{ movimentoId: 'desc' }, { ordem: 'asc' }, { envio: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.chamadoMovimentoMensagem.count({ where }),
    ]);

    return {
      data: mensagens,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: bigint) {
    const mensagem = await this.prisma.chamadoMovimentoMensagem.findUnique({
      where: { id },
      include: {
        movimento: {
          select: {
            id: true,
            chamadoId: true,
            descricaoAcao: true,
            etapa: {
              select: {
                id: true,
                descricao: true,
              },
            },
            chamado: {
              select: {
                id: true,
                protocolo: true,
                titulo: true,
                empresa: {
                  select: {
                    id: true,
                    razaoSocial: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!mensagem) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    return mensagem;
  }

  async update(id: bigint, updateDto: UpdateChamadoMovimentoMensagemDto) {
    try {
      // Verificar se a mensagem existe
      const existingMensagem =
        await this.prisma.chamadoMovimentoMensagem.findUnique({
          where: { id },
        });

      if (!existingMensagem) {
        throw new NotFoundException('Mensagem não encontrada');
      }

      // Se estiver alterando o movimento, verificar se existe
      if (
        updateDto.movimentoId &&
        updateDto.movimentoId !== existingMensagem.movimentoId
      ) {
        const movimento = await this.prisma.chamadoMovimento.findUnique({
          where: { id: updateDto.movimentoId },
        });

        if (!movimento) {
          throw new NotFoundException('Movimento do chamado não encontrado');
        }

        if (movimento.ativo !== StatusRegistro.ATIVO) {
          throw new BadRequestException('Movimento do chamado não está ativo');
        }
      }

      const mensagem = await this.prisma.chamadoMovimentoMensagem.update({
        where: { id },
        data: {
          ...updateDto,
          updatedAt: new Date(),
        },
        include: {
          movimento: {
            select: {
              id: true,
              chamadoId: true,
              descricaoAcao: true,
            },
          },
        },
      });

      return mensagem;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Erro ao atualizar mensagem: ${error.message}`,
      );
    }
  }

  async remove(id: bigint, motivo?: string) {
    try {
      const existingMensagem =
        await this.prisma.chamadoMovimentoMensagem.findUnique({
          where: { id },
        });

      if (!existingMensagem) {
        throw new NotFoundException('Mensagem não encontrada');
      }

      if (existingMensagem.ativo === StatusRegistro.EXCLUIDO) {
        throw new ConflictException('Mensagem já foi excluída');
      }

      const mensagem = await this.prisma.chamadoMovimentoMensagem.update({
        where: { id },
        data: {
          ativo: StatusRegistro.EXCLUIDO,
          motivo: motivo || 'Mensagem excluída',
          updatedAt: new Date(),
        },
      });

      return mensagem;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Erro ao excluir mensagem: ${error.message}`,
      );
    }
  }

  async findByMovimento(movimentoId: bigint) {
    const movimento = await this.prisma.chamadoMovimento.findUnique({
      where: { id: movimentoId },
    });

    if (!movimento) {
      throw new NotFoundException('Movimento do chamado não encontrado');
    }

    const mensagens = await this.prisma.chamadoMovimentoMensagem.findMany({
      where: {
        movimentoId,
        ativo: {
          not: StatusRegistro.EXCLUIDO,
        },
      },
      orderBy: [{ ordem: 'asc' }, { envio: 'asc' }],
      include: {
        movimento: {
          select: {
            id: true,
            chamadoId: true,
            descricaoAcao: true,
          },
        },
      },
    });

    return mensagens;
  }

  async markAsRead(id: bigint, usuarioLeituraId: bigint) {
    try {
      const mensagem = await this.prisma.chamadoMovimentoMensagem.findUnique({
        where: { id },
      });

      if (!mensagem) {
        throw new NotFoundException('Mensagem não encontrada');
      }

      if (mensagem.ativo !== StatusRegistro.ATIVO) {
        throw new BadRequestException('Mensagem não está ativa');
      }

      if (mensagem.leitura) {
        throw new ConflictException('Mensagem já foi marcada como lida');
      }

      const updatedMensagem = await this.prisma.chamadoMovimentoMensagem.update(
        {
          where: { id },
          data: {
            usuarioLeituraId,
            leitura: new Date(),
            updatedAt: new Date(),
          },
        },
      );

      return updatedMensagem;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Erro ao marcar mensagem como lida: ${error.message}`,
      );
    }
  }

  async getUnreadMessages(usuarioId: bigint) {
    const mensagens = await this.prisma.chamadoMovimentoMensagem.findMany({
      where: {
        usuarioLeituraId: usuarioId,
        leitura: null,
        ativo: StatusRegistro.ATIVO,
      },
      include: {
        movimento: {
          select: {
            id: true,
            chamadoId: true,
            descricaoAcao: true,
            chamado: {
              select: {
                id: true,
                protocolo: true,
                titulo: true,
              },
            },
          },
        },
      },
      orderBy: [{ envio: 'desc' }],
    });

    return mensagens;
  }
}
