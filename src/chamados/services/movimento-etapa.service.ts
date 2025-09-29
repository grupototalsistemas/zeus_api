import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMovimentoEtapaDto } from '../dto/movimento-etapa.dto';
import { UpdateMovimentoEtapaDto } from '../dto/update-movimento-etapa.dto';

@Injectable()
export class ChamadoMovimentoEtapaService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMovimentoEtapaDto) {
    try {
      // Verifica se a empresa existe
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: data.empresaId },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa não encontrada');
      }

      // Verifica se já existe uma etapa com a mesma descrição para a empresa
      const existingEtapa = await this.prisma.chamadoMovimentoEtapa.findFirst({
        where: {
          empresaId: data.empresaId,
          descricao: data.descricao.trim(),
          ativo: StatusRegistro.ATIVO,
        },
      });

      if (existingEtapa) {
        throw new ConflictException(
          'Já existe uma etapa ativa com esta descrição para esta empresa',
        );
      }

      return await this.prisma.chamadoMovimentoEtapa.create({
        data: {
          empresaId: data.empresaId,
          descricao: data.descricao.trim(),
          ativo: data.ativo,
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
      console.error('Erro ao criar Etapa:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao criar etapa',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.chamadoMovimentoEtapa.findMany({
        include: {
          empresa: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
        },
        orderBy: [{ empresa: { nomeFantasia: 'asc' } }, { descricao: 'asc' }],
      });
    } catch (error) {
      console.error('Erro em findAll Etapa:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar etapas',
      );
    }
  }

  async findOne(id: bigint) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('ID inválido');
      }

      const etapa = await this.prisma.chamadoMovimentoEtapa.findUnique({
        where: { id },
        include: {
          empresa: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
          movimentos: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!etapa) {
        throw new NotFoundException('Etapa não encontrada');
      }

      return etapa;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro em findOne Etapa:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar etapa',
      );
    }
  }

  async update(id: bigint, data: UpdateMovimentoEtapaDto) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('ID inválido');
      }

      // Verifica se o registro existe
      const existing = await this.prisma.chamadoMovimentoEtapa.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Etapa não encontrada');
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

      // Se está alterando a descrição, verifica duplicata
      if (data.descricao && data.descricao.trim() !== existing.descricao) {
        const duplicateDescription =
          await this.prisma.chamadoMovimentoEtapa.findFirst({
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
            'Já existe outra etapa ativa com esta descrição para esta empresa',
          );
        }
      }

      return await this.prisma.chamadoMovimentoEtapa.update({
        where: { id },
        data: {
          ...(data.empresaId && { empresaId: data.empresaId }),
          ...(data.descricao && { descricao: data.descricao.trim() }),
          ...(data.ativo && { ativo: data.ativo }),
          ...(data.motivo !== undefined && { motivo: data.motivo?.trim() }),
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
      console.error('Erro ao atualizar Etapa:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao atualizar etapa',
      );
    }
  }

  async remove(id: bigint) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('ID inválido');
      }

      // Verifica se o registro existe
      const existing = await this.prisma.chamadoMovimentoEtapa.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Etapa não encontrada');
      }

      // Verifica se existem movimentos vinculados a esta etapa
      const movimentosVinculados = await this.prisma.chamadoMovimento.findFirst(
        {
          where: {
            etapaId: id,
          },
        },
      );

      if (movimentosVinculados) {
        // Se existem movimentos vinculados, fazer soft delete
        return await this.prisma.chamadoMovimentoEtapa.update({
          where: { id },
          data: {
            ativo: StatusRegistro.INATIVO,
            motivo: 'Inativado por possuir movimentos vinculados',
          },
        });
      } else {
        // Se não existem movimentos vinculados, pode deletar fisicamente
        await this.prisma.chamadoMovimentoEtapa.update({
          where: { id },
          data: {
            ativo: StatusRegistro.INATIVO,
          },
        });

        return { message: 'Etapa removida com sucesso' };
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro ao remover Etapa:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao remover etapa',
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

      return await this.prisma.chamadoMovimentoEtapa.findMany({
        where: {
          empresaId,
          ativo: StatusRegistro.ATIVO,
        },
        orderBy: { descricao: 'asc' },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro em findByEmpresa Etapa:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar etapas por empresa',
      );
    }
  }
}
