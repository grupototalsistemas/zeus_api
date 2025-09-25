import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChamadoOcorrenciaTipoDto } from '../dto/ocorrencia-tipo.dto';

@Injectable()
export class ChamadoOcorrenciaTipoService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateChamadoOcorrenciaTipoDto) {
    try {
      // Validação de entrada
      if (!data.empresaId || !data.descricao) {
        throw new BadRequestException('EmpresaId e descrição são obrigatórios');
      }

      // Verifica se a empresa existe
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: data.empresaId },
      });

      if (!empresa) {
        throw new NotFoundException('Empresa não encontrada');
      }

      // Verifica se já existe um registro com os mesmos critérios
      const existing = await this.prisma.ocorrenciaTipo.findFirst({
        where: {
          descricao: data.descricao.trim(),
          empresaId: data.empresaId,
          ativo: StatusRegistro.ATIVO,
        },
      });

      if (existing) {
        throw new ConflictException(
          'Já existe um tipo de ocorrência ativo com esta descrição para esta empresa',
        );
      }

      return await this.prisma.ocorrenciaTipo.create({
        data: {
          ...data,
          descricao: data.descricao.trim(),
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
      console.error('Erro ao criar OcorrenciaTipo:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao criar tipo de ocorrência',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.ocorrenciaTipo.findMany({
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
      console.error('Erro em findAll OcorrenciaTipo:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar tipos de ocorrência',
      );
    }
  }

  async findOne(id: bigint) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('ID inválido');
      }

      const ocorrenciaTipo = await this.prisma.ocorrenciaTipo.findUnique({
        where: { id },
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

      if (!ocorrenciaTipo) {
        throw new NotFoundException('Tipo de ocorrência não encontrado');
      }

      return ocorrenciaTipo;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro em findOne OcorrenciaTipo:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar tipo de ocorrência',
      );
    }
  }

  async update(id: bigint, data: Partial<CreateChamadoOcorrenciaTipoDto>) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('ID inválido');
      }

      // Verifica se o registro existe
      const existing = await this.prisma.ocorrenciaTipo.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Tipo de ocorrência não encontrado');
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
        const duplicate = await this.prisma.ocorrenciaTipo.findFirst({
          where: {
            descricao: data.descricao.trim(),
            empresaId: data.empresaId || existing.empresaId,
            ativo: StatusRegistro.ATIVO,
            id: {
              not: id,
            },
          },
        });

        if (duplicate) {
          throw new ConflictException(
            'Já existe outro tipo de ocorrência ativo com esta descrição para esta empresa',
          );
        }
      }

      const updateData = {
        ...data,
        ...(data.descricao && { descricao: data.descricao.trim() }),
      };

      return await this.prisma.ocorrenciaTipo.update({
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
      console.error('Erro ao atualizar OcorrenciaTipo:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao atualizar tipo de ocorrência',
      );
    }
  }

  async remove(id: bigint) {
    try {
      if (!id || id <= 0) {
        throw new BadRequestException('ID inválido');
      }

      // Verifica se o registro existe
      const existing = await this.prisma.ocorrenciaTipo.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Tipo de ocorrência não encontrado');
      }

      // Verifica se existem ocorrências vinculadas a este tipo
      const ocorrenciasVinculadas = await this.prisma.ocorrencia.findFirst({
        where: {
          tipoId: id,
        },
      });

      if (ocorrenciasVinculadas) {
        // Se existem ocorrências vinculadas, fazer soft delete
        return await this.prisma.ocorrenciaTipo.update({
          where: { id },
          data: {
            ativo: StatusRegistro.INATIVO,
            motivo: 'Inativado por possuir ocorrências vinculadas',
          },
        });
      } else {
        // Se não existem ocorrências vinculadas, pode deletar fisicamente
        await this.prisma.ocorrenciaTipo.update({
          where: { id },
          data: {
            ativo: StatusRegistro.INATIVO,
          },
        });

        return { message: 'Tipo de ocorrência removido com sucesso' };
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro ao remover OcorrenciaTipo:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao remover tipo de ocorrência',
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

      return await this.prisma.ocorrenciaTipo.findMany({
        where: {
          empresaId,
          ativo: StatusRegistro.ATIVO,
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
      console.error('Erro em findByEmpresa OcorrenciaTipo:', error);
      throw new ServiceUnavailableException(
        'Erro interno do servidor ao buscar tipos de ocorrência por empresa',
      );
    }
  }
}
