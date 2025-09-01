// sistemas/sistemas.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSistemaDto,
  SistemaResponseDto,
  UpdateSistemaDto,
} from '../dto/create-sistema.dto';

interface FindAllFilters {
  ativo?: StatusRegistro;
  empresaId?: number;
  nome?: string;
}

@Injectable()
export class SistemasService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSistemaDto): Promise<SistemaResponseDto> {
    // Validar se empresa existe
    await this.validateEmpresaExists(data.empresaId);

    // Validar se nome do sistema é único para esta empresa
    await this.validateNomeUnique(data.nome, data.empresaId);

    try {
      const sistema = await this.prisma.sistema.create({
        data: {
          ...data,
          empresaId: BigInt(data.empresaId),
        },
        include: {
          empresa: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
            },
          },
        },
      });

      return this.mapToResponseDto(sistema);
    } catch (error) {
      throw new BadRequestException('Erro ao criar sistema: ' + error.message);
    }
  }

  async findAll(filters: FindAllFilters = {}): Promise<SistemaResponseDto[]> {
    const where: any = {};

    if (filters.ativo) {
      where.ativo = filters.ativo;
    }

    if (filters.empresaId) {
      where.empresaId = BigInt(filters.empresaId);
    }

    if (filters.nome) {
      where.nome = { contains: filters.nome, mode: 'insensitive' };
    }

    const sistemas = await this.prisma.sistema.findMany({
      where,
      include: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
      },
      orderBy: [{ empresa: { razaoSocial: 'asc' } }, { nome: 'asc' }],
    });

    return sistemas.map((sistema) => this.mapToResponseDto(sistema));
  }

  async findOne(id: bigint): Promise<SistemaResponseDto> {
    const sistema = await this.prisma.sistema.findUnique({
      where: { id },
      include: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
        empresasSistemas: {
          where: { ativo: StatusRegistro.ATIVO },
          include: {
            empresa: {
              select: {
                id: true,
                razaoSocial: true,
                nomeFantasia: true,
              },
            },
          },
        },
      },
    });

    if (!sistema) {
      throw new NotFoundException(`Sistema com ID ${id} não encontrado`);
    }

    return this.mapToResponseDto(sistema);
  }

  async findByEmpresa(empresaId: bigint): Promise<SistemaResponseDto[]> {
    // Validar se empresa existe
    await this.validateEmpresaExists(Number(empresaId));

    const sistemas = await this.prisma.sistema.findMany({
      where: {
        empresaId,
        ativo: StatusRegistro.ATIVO,
      },
      include: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    return sistemas.map((sistema) => this.mapToResponseDto(sistema));
  }

  async update(
    id: bigint,
    data: UpdateSistemaDto,
  ): Promise<SistemaResponseDto> {
    // Verificar se sistema existe
    await this.findOne(id);

    // Validar empresa se foi alterada
    if (data.empresaId) {
      await this.validateEmpresaExists(data.empresaId);
    }

    // Validar nome se foi alterado
    if (data.nome) {
      const currentSistema = await this.prisma.sistema.findUnique({
        where: { id },
        select: { empresaId: true },
      });

      const empresaIdToCheck = data.empresaId
        ? BigInt(data.empresaId)
        : currentSistema?.empresaId;

      await this.validateNomeUnique(data.nome, Number(empresaIdToCheck), id);
    }

    try {
      const updateData: any = { ...data };

      if (data.empresaId) {
        updateData.empresaId = BigInt(data.empresaId);
      }

      updateData.updatedAt = new Date();

      const sistema = await this.prisma.sistema.update({
        where: { id },
        data: updateData,
        include: {
          empresa: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
            },
          },
        },
      });

      return this.mapToResponseDto(sistema);
    } catch (error) {
      throw new BadRequestException(
        'Erro ao atualizar sistema: ' + error.message,
      );
    }
  }

  async remove(id: bigint): Promise<void> {
    // Verificar se sistema existe
    await this.findOne(id);

    // Verificar se possui relacionamentos que impedem exclusão
    await this.validateCanDelete(id);

    try {
      await this.prisma.sistema.delete({
        where: { id },
      });
    } catch (error) {
      throw new ConflictException(
        'Não foi possível excluir o sistema. Verifique se não há relacionamentos pendentes.',
      );
    }
  }

  async activate(id: bigint): Promise<SistemaResponseDto> {
    const sistema = await this.prisma.sistema.update({
      where: { id },
      data: {
        ativo: StatusRegistro.ATIVO,
        motivo: null,
        updatedAt: new Date(),
      },
      include: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
      },
    });

    if (!sistema) {
      throw new NotFoundException(`Sistema com ID ${id} não encontrado`);
    }

    return this.mapToResponseDto(sistema);
  }

  async deactivate(id: bigint, motivo: string): Promise<SistemaResponseDto> {
    if (!motivo || motivo.trim().length === 0) {
      throw new BadRequestException('Motivo da desativação é obrigatório');
    }

    const sistema = await this.prisma.sistema.update({
      where: { id },
      data: {
        ativo: StatusRegistro.INATIVO,
        motivo: motivo.trim(),
        updatedAt: new Date(),
      },
      include: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
      },
    });

    if (!sistema) {
      throw new NotFoundException(`Sistema com ID ${id} não encontrado`);
    }

    return this.mapToResponseDto(sistema);
  }

  // Métodos de validação privados
  private async validateEmpresaExists(empresaId: number): Promise<void> {
    const empresa = await this.prisma.empresa.findFirst({
      where: {
        id: BigInt(empresaId),
        ativo: StatusRegistro.ATIVO,
      },
    });

    if (!empresa) {
      throw new NotFoundException(
        `Empresa com ID ${empresaId} não encontrada ou inativa`,
      );
    }
  }

  private async validateNomeUnique(
    nome: string,
    empresaId: number,
    excludeId?: bigint,
  ): Promise<void> {
    const where: any = {
      nome: { equals: nome, mode: 'insensitive' },
      empresaId: BigInt(empresaId),
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingSistema = await this.prisma.sistema.findFirst({ where });

    if (existingSistema) {
      throw new ConflictException(
        'Sistema com este nome já existe para esta empresa',
      );
    }
  }

  private async validateCanDelete(id: bigint): Promise<void> {
    // Verificar se tem chamados vinculados
    const chamadosCount = await this.prisma.chamado.count({
      where: { sistemaId: id },
    });

    if (chamadosCount > 0) {
      throw new ConflictException(
        'Não é possível excluir sistema que possui chamados vinculados',
      );
    }

    // Verificar se tem empresas vinculadas
    const empresaSistemasCount = await this.prisma.empresaSistema.count({
      where: { sistemaId: id },
    });

    if (empresaSistemasCount > 0) {
      throw new ConflictException(
        'Não é possível excluir sistema que possui empresas vinculadas',
      );
    }
  }

  private mapToResponseDto(sistema: any): SistemaResponseDto {
    return {
      id: Number(sistema.id),
      empresaId: Number(sistema.empresaId),
      nome: sistema.nome,
      descricao: sistema.descricao,
      ativo: sistema.ativo,
      motivo: sistema.motivo,
      createdAt: sistema.createdAt,
      updatedAt: sistema.updatedAt,
    };
  }
}
