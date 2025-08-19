import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChamadoPrioridadeDto } from '../dto/prioridade.dto';

@Injectable()
export class ChamadoPrioridadeService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateChamadoPrioridadeDto) {
    try {
      // Validação de entrada
      if (!data.empresaId || !data.descricao || !data.cor || !data.tempo) {
        throw new BadRequestException(
          'EmpresaId, descrição, cor e tempo são obrigatórios',
        );
      }

      // Verifica se a empresa existe
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: data.empresaId },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa não encontrada');
      }

      // Valida formato de cor (hex)
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(data.cor)) {
        throw new BadRequestException(
          'Formato de cor inválido. Use formato hexadecimal (#FFFFFF)',
        );
      }

      // Valida se o tempo é futuro
      if (new Date(data.tempo) <= new Date()) {
        throw new BadRequestException('O tempo deve ser uma data/hora futura');
      }

      // Verifica se já existe uma prioridade com a mesma descrição para a empresa
      const existingByDescription = await this.prisma.prioridade.findFirst({
        where: {
          descricao: data.descricao.trim(),
          empresaId: data.empresaId,
          ativo: StatusRegistro.ATIVO,
        },
      });

      if (existingByDescription) {
        throw new ConflictException(
          'Já existe uma prioridade ativa com esta descrição para esta empresa',
        );
      }

      // Verifica se já existe uma prioridade com a mesma cor para a empresa
      const existingByColor = await this.prisma.prioridade.findFirst({
        where: {
          cor: data.cor.toUpperCase(),
          empresaId: data.empresaId,
          ativo: StatusRegistro.ATIVO,
        },
      });

      if (existingByColor) {
        throw new ConflictException(
          'Já existe uma prioridade ativa com esta cor para esta empresa',
        );
      }

      return await this.prisma.prioridade.create({
        data: {
          empresaId: data.empresaId,
          cor: data.cor.toUpperCase(),
          tempo: data.tempo,
          ativo: data.ativo,
          descricao: data.descricao.trim(),
          motivo: data.motivo?.trim(),
        },
        include: {
          empresa: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro ao criar Prioridade:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao criar prioridade',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.prioridade.findMany({
        include: {
          empresa: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
        },
        orderBy: [
          { empresa: { nomeFantasia: 'asc' } },
          { tempo: 'asc' },
          { descricao: 'asc' },
        ],
      });
    } catch (error) {
      console.error('Erro em findAll Prioridade:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar prioridades',
      );
    }
  }

  async findOne(id: bigint) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('ID inválido');
      }

      const prioridade = await this.prisma.prioridade.findUnique({
        where: { id },
        include: {
          empresa: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
          chamados: {
            select: {
              id: true,

              titulo: true,
              descricao: true,
              createdAt: true,
            },
            take: 10,
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!prioridade) {
        throw new NotFoundException('Prioridade não encontrada');
      }

      return prioridade;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro em findOne Prioridade:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar prioridade',
      );
    }
  }

  async update(id: bigint, data: Partial<CreateChamadoPrioridadeDto>) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('ID inválido');
      }

      // Verifica se o registro existe
      const existing = await this.prisma.prioridade.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Prioridade não encontrada');
      }

      // Se está alterando a empresa, verifica se ela existe
      if (data.empresaId && data.empresaId !== Number(existing.empresaId)) {
        const empresa = await this.prisma.empresa.findUnique({
          where: { id: data.empresaId },
        });

        if (!empresa) {
          throw new NotFoundException('Empresa não encontrada');
        }
      }

      // Valida formato de cor se fornecida
      if (data.cor) {
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexColorRegex.test(data.cor)) {
          throw new BadRequestException(
            'Formato de cor inválido. Use formato hexadecimal (#FFFFFF)',
          );
        }
      }

      // Valida tempo se fornecido
      if (data.tempo && new Date(data.tempo) <= new Date()) {
        throw new BadRequestException('O tempo deve ser uma data/hora futura');
      }

      // Se está alterando a descrição, verifica duplicata
      if (data.descricao && data.descricao.trim() !== existing.descricao) {
        const duplicateDescription = await this.prisma.prioridade.findFirst({
          where: {
            descricao: data.descricao.trim(),
            empresaId: data.empresaId || existing.empresaId,
            ativo: StatusRegistro.ATIVO,
            id: {
              not: id,
            },
          },
        });

        if (duplicateDescription) {
          throw new ConflictException(
            'Já existe outra prioridade ativa com esta descrição para esta empresa',
          );
        }
      }

      // Se está alterando a cor, verifica duplicata
      if (data.cor && data.cor.toUpperCase() !== existing.cor) {
        const duplicateColor = await this.prisma.prioridade.findFirst({
          where: {
            cor: data.cor.toUpperCase(),
            empresaId: data.empresaId || existing.empresaId,
            ativo: StatusRegistro.ATIVO,
            id: {
              not: id,
            },
          },
        });

        if (duplicateColor) {
          throw new ConflictException(
            'Já existe outra prioridade ativa com esta cor para esta empresa',
          );
        }
      }

      const updateData = {
        ...(data.empresaId && { empresaId: data.empresaId }),
        ...(data.cor && { cor: data.cor.toUpperCase() }),
        ...(data.tempo && { tempo: data.tempo }),
        ...(data.ativo && { ativo: data.ativo }),
        ...(data.descricao && { descricao: data.descricao.trim() }),
        ...(data.motivo !== undefined && { motivo: data.motivo?.trim() }),
      };

      return await this.prisma.prioridade.update({
        where: { id },
        data: updateData,
        include: {
          empresa: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro ao atualizar Prioridade:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao atualizar prioridade',
      );
    }
  }

  async remove(id: bigint) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('ID inválido');
      }

      // Verifica se o registro existe
      const existing = await this.prisma.prioridade.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Prioridade não encontrada');
      }

      // Verifica se existem chamados vinculados a esta prioridade
      const chamadosVinculados = await this.prisma.chamado.findFirst({
        where: {
          prioridadeId: id,
        },
      });

      if (chamadosVinculados) {
        // Se existem chamados vinculados, fazer soft delete
        return await this.prisma.prioridade.update({
          where: { id },
          data: {
            ativo: StatusRegistro.INATIVO,
            motivo: 'Inativado por possuir chamados vinculados',
          },
        });
      } else {
        // Se não existem chamados vinculados, pode deletar fisicamente
        await this.prisma.prioridade.delete({
          where: { id },
        });

        return { message: 'Prioridade removida com sucesso' };
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro ao remover Prioridade:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao remover prioridade',
      );
    }
  }

  async findByEmpresa(empresaId: number) {
    try {
      if (!empresaId || empresaId <= 0) {
        throw new BadRequestException('ID da empresa inválido');
      }

      // Verifica se a empresa existe
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: empresaId },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa não encontrada');
      }

      return await this.prisma.prioridade.findMany({
        where: {
          empresaId,
          ativo: StatusRegistro.ATIVO,
        },
        orderBy: [{ tempo: 'asc' }, { descricao: 'asc' }],
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro em findByEmpresa Prioridade:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar prioridades por empresa',
      );
    }
  }

  async findByTempoLimite(tempoLimite: Date) {
    try {
      if (!tempoLimite) {
        throw new BadRequestException('Tempo limite é obrigatório');
      }

      return await this.prisma.prioridade.findMany({
        where: {
          tempo: {
            lte: tempoLimite,
          },
          ativo: StatusRegistro.ATIVO,
        },
        include: {
          empresa: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
        },
        orderBy: [{ tempo: 'asc' }, { empresa: { nomeFantasia: 'asc' } }],
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Erro em findByTempoLimite Prioridade:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar prioridades por tempo limite',
      );
    }
  }

  async findUrgentes() {
    try {
      const agora = new Date();
      const proximaHora = new Date(agora.getTime() + 60 * 60 * 1000); // + 1 hora

      return await this.prisma.prioridade.findMany({
        where: {
          tempo: {
            lte: proximaHora,
          },
          ativo: StatusRegistro.ATIVO,
        },
        include: {
          empresa: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
          chamados: {
            where: {
              ativo: {
                not: 'INATIVO',
              },
            },
            select: {
              id: true,

              titulo: true,
              descricao: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          tempo: 'asc',
        },
      });
    } catch (error) {
      console.error('Erro em findUrgentes Prioridade:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar prioridades urgentes',
      );
    }
  }
}
