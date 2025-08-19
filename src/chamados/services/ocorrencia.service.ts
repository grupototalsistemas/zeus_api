import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChamadoOcorrenciaDto } from '../dto/ocorrencia.dto';

@Injectable()
export class ChamadoOcorrenciaService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateChamadoOcorrenciaDto) {
    try {
      // Validação de entrada
      if (!data.empresaId || !data.tipoId || !data.descricao) {
        throw new BadRequestException(
          'EmpresaId, tipoId e descrição são obrigatórios',
        );
      }

      // Verifica se a empresa existe
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: data.empresaId },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa não encontrada');
      }

      // Verifica se o tipo de ocorrência existe e está ativo
      const tipo = await this.prisma.ocorrenciaTipo.findFirst({
        where: {
          id: data.tipoId,
          empresaId: data.empresaId,
          ativo: StatusRegistro.ATIVO,
        },
      });

      if (!tipo) {
        throw new NotFoundException(
          'Tipo de ocorrência não encontrado ou inativo para esta empresa',
        );
      }

      // Verifica se já existe uma ocorrência com os mesmos critérios
      const existing = await this.prisma.ocorrencia.findFirst({
        where: {
          descricao: data.descricao.trim(),
          tipoId: data.tipoId,
          empresaId: data.empresaId,
          ativo: StatusRegistro.ATIVO,
        },
      });

      if (existing) {
        throw new ConflictException(
          'Já existe uma ocorrência ativa com esta descrição para este tipo',
        );
      }

      return await this.prisma.ocorrencia.create({
        data: {
          empresaId: data.empresaId,
          tipoId: data.tipoId,
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
          tipo: {
            select: {
              id: true,
              descricao: true,
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
      console.error('Erro ao criar Ocorrencia:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao criar ocorrência',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.ocorrencia.findMany({
        include: {
          empresa: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
          tipo: {
            select: {
              id: true,
              descricao: true,
            },
          },
        },
        orderBy: [
          { empresa: { nomeFantasia: 'asc' } },
          { tipo: { descricao: 'asc' } },
          { descricao: 'asc' },
        ],
      });
    } catch (error) {
      console.error('Erro em findAll Ocorrencia:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar ocorrências',
      );
    }
  }

  async findOne(id: bigint) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('ID inválido');
      }

      const ocorrencia = await this.prisma.ocorrencia.findUnique({
        where: { id },
        include: {
          empresa: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
          tipo: {
            select: {
              id: true,
              descricao: true,
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

      if (!ocorrencia) {
        throw new NotFoundException('Ocorrência não encontrada');
      }

      return ocorrencia;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro em findOne Ocorrencia:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar ocorrência',
      );
    }
  }

  async update(id: bigint, data: Partial<CreateChamadoOcorrenciaDto>) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('ID inválido');
      }

      // Verifica se o registro existe
      const existing = await this.prisma.ocorrencia.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Ocorrência não encontrada');
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

      // Se está alterando o tipo de ocorrência, verifica se ele existe e é válido para a empresa
      if (data.tipoId && data.tipoId !== Number(existing.tipoId)) {
        const tipo = await this.prisma.ocorrenciaTipo.findFirst({
          where: {
            id: data.tipoId,
            empresaId: data.empresaId || existing.empresaId,
            ativo: StatusRegistro.ATIVO,
          },
        });

        if (!tipo) {
          throw new NotFoundException(
            'Tipo de ocorrência não encontrado ou inativo para esta empresa',
          );
        }
      }

      // Se está alterando a descrição, verifica duplicata
      if (data.descricao && data.descricao.trim() !== existing.descricao) {
        const duplicate = await this.prisma.ocorrencia.findFirst({
          where: {
            descricao: data.descricao.trim(),
            tipoId: data.tipoId || existing.tipoId,
            empresaId: data.empresaId || existing.empresaId,
            ativo: StatusRegistro.ATIVO,
            id: {
              not: id,
            },
          },
        });

        if (duplicate) {
          throw new ConflictException(
            'Já existe outra ocorrência ativa com esta descrição para este tipo',
          );
        }
      }

      const updateData = {
        ...(data.empresaId && { empresaId: data.empresaId }),
        ...(data.tipoId && { tipoId: data.tipoId }),
        ...(data.ativo && { ativo: data.ativo }),
        ...(data.descricao && { descricao: data.descricao.trim() }),
        ...(data.motivo !== undefined && { motivo: data.motivo?.trim() }),
      };

      return await this.prisma.ocorrencia.update({
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
          tipo: {
            select: {
              id: true,
              descricao: true,
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
      console.error('Erro ao atualizar Ocorrencia:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao atualizar ocorrência',
      );
    }
  }

  async remove(id: bigint) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('ID inválido');
      }

      // Verifica se o registro existe
      const existing = await this.prisma.ocorrencia.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Ocorrência não encontrada');
      }

      // Verifica se existem chamados vinculados a esta ocorrência
      const chamadosVinculados = await this.prisma.chamado.findFirst({
        where: {
          ocorrenciaId: id,
        },
      });

      if (chamadosVinculados) {
        // Se existem chamados vinculados, fazer soft delete
        return await this.prisma.ocorrencia.update({
          where: { id },
          data: {
            ativo: StatusRegistro.INATIVO,
            motivo: 'Inativado por possuir chamados vinculados',
          },
        });
      } else {
        // Se não existem chamados vinculados, pode deletar fisicamente
        await this.prisma.ocorrencia.delete({
          where: { id },
        });

        return { message: 'Ocorrência removida com sucesso' };
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro ao remover Ocorrencia:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao remover ocorrência',
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

      return await this.prisma.ocorrencia.findMany({
        where: {
          empresaId,
          ativo: StatusRegistro.ATIVO,
        },
        include: {
          tipo: {
            select: {
              id: true,
              descricao: true,
            },
          },
        },
        orderBy: [{ tipo: { descricao: 'asc' } }, { descricao: 'asc' }],
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro em findByEmpresa Ocorrencia:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar ocorrências por empresa',
      );
    }
  }

  async findByTipo(tipoId: number) {
    try {
      if (!tipoId || tipoId <= 0) {
        throw new BadRequestException('ID do tipo inválido');
      }

      // Verifica se o tipo de ocorrência existe
      const tipo = await this.prisma.ocorrenciaTipo.findUnique({
        where: { id: tipoId },
      });

      if (!tipo) {
        throw new NotFoundException('Tipo de ocorrência não encontrado');
      }

      return await this.prisma.ocorrencia.findMany({
        where: {
          tipoId: tipoId,
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
        orderBy: {
          descricao: 'asc',
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro em findByTipo Ocorrencia:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar ocorrências por tipo',
      );
    }
  }
}
