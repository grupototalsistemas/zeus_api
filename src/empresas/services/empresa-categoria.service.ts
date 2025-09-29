// empresas/empresa-categoria.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEmpresaCategoriaDto,
  EmpresaCategoriaResponseDto,
  UpdateEmpresaCategoriaDto,
} from '../dto/create-empresa-categoria.dto';

interface FindAllFilters {
  ativo?: StatusRegistro;
  empresaId?: number;
  descricao?: string;
}

@Injectable()
export class EmpresaCategoriaService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: CreateEmpresaCategoriaDto,
  ): Promise<EmpresaCategoriaResponseDto> {
    await this.validateEmpresaExists(data.empresaId);
    await this.validateDescricaoUnique(data.descricao, data.empresaId);

    try {
      const categoria = await this.prisma.empresaCategoria.create({
        data: {
          ...data,
          empresaId: BigInt(data.empresaId),
        },
      });

      return this.mapToResponseDto(categoria);
    } catch (error) {
      throw new BadRequestException(
        'Erro ao criar categoria: ' + error.message,
      );
    }
  }

  async findAll(
    filters: FindAllFilters = {},
  ): Promise<EmpresaCategoriaResponseDto[]> {
    const where: any = {};

    if (filters.ativo) where.ativo = filters.ativo;
    if (filters.empresaId) where.empresaId = BigInt(filters.empresaId);
    if (filters.descricao) {
      where.descricao = { contains: filters.descricao, mode: 'insensitive' };
    }

    const categorias = await this.prisma.empresaCategoria.findMany({
      where,
      orderBy: { descricao: 'asc' },
    });

    return categorias.map((cat) => this.mapToResponseDto(cat));
  }

  async findOne(id: bigint): Promise<EmpresaCategoriaResponseDto> {
    const categoria = await this.prisma.empresaCategoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }

    return this.mapToResponseDto(categoria);
  }

  async findByEmpresa(
    empresaId: bigint,
  ): Promise<EmpresaCategoriaResponseDto[]> {
    await this.validateEmpresaExists(Number(empresaId));

    const categorias = await this.prisma.empresaCategoria.findMany({
      where: {
        empresaId,
        ativo: StatusRegistro.ATIVO,
      },
      orderBy: { descricao: 'asc' },
    });

    return categorias.map((cat) => this.mapToResponseDto(cat));
  }

  async update(
    id: bigint,
    data: UpdateEmpresaCategoriaDto,
  ): Promise<EmpresaCategoriaResponseDto> {
    await this.findOne(id);

    if (data.empresaId) {
      await this.validateEmpresaExists(data.empresaId);
    }

    if (data.descricao) {
      const current = await this.prisma.empresaCategoria.findUnique({
        where: { id },
        select: { empresaId: true },
      });

      const empresaIdToCheck = data.empresaId
        ? BigInt(data.empresaId)
        : current?.empresaId;

      await this.validateDescricaoUnique(
        data.descricao,
        Number(empresaIdToCheck),
        id,
      );
    }

    try {
      const updateData: any = { ...data };
      if (data.empresaId) {
        updateData.empresaId = BigInt(data.empresaId);
      }
      updateData.updatedAt = new Date();

      const categoria = await this.prisma.empresaCategoria.update({
        where: { id },
        data: updateData,
      });

      return this.mapToResponseDto(categoria);
    } catch (error) {
      throw new BadRequestException(
        'Erro ao atualizar categoria: ' + error.message,
      );
    }
  }

  async remove(id: bigint): Promise<void> {
    await this.findOne(id);
    await this.validateCanDelete(id);

    try {
      await this.prisma.empresaCategoria.update({
        where: { id },
        data: { ativo: StatusRegistro.INATIVO },
      });
    } catch (error) {
      throw new ConflictException('Não foi possível excluir a categoria.');
    }
  }

  async activate(id: bigint): Promise<EmpresaCategoriaResponseDto> {
    const categoria = await this.prisma.empresaCategoria.update({
      where: { id },
      data: {
        ativo: StatusRegistro.ATIVO,
        updatedAt: new Date(),
      },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }

    return this.mapToResponseDto(categoria);
  }

  async deactivate(id: bigint): Promise<EmpresaCategoriaResponseDto> {
    const categoria = await this.prisma.empresaCategoria.update({
      where: { id },
      data: {
        ativo: StatusRegistro.INATIVO,
        updatedAt: new Date(),
      },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
    }

    return this.mapToResponseDto(categoria);
  }

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

  private async validateDescricaoUnique(
    descricao: string,
    empresaId: number,
    excludeId?: bigint,
  ): Promise<void> {
    const where: any = {
      descricao: { equals: descricao, mode: 'insensitive' },
      empresaId: BigInt(empresaId),
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existing = await this.prisma.empresaCategoria.findFirst({ where });

    if (existing) {
      throw new ConflictException(
        'Categoria com esta descrição já existe para esta empresa',
      );
    }
  }

  private async validateCanDelete(id: bigint): Promise<void> {
    const empresasUsing = await this.prisma.empresa.count({
      where: { categoriaId: id },
    });

    if (empresasUsing > 0) {
      throw new ConflictException(
        'Não é possível excluir categoria que está sendo utilizada por empresas',
      );
    }
  }

  private mapToResponseDto(categoria: any): EmpresaCategoriaResponseDto {
    return {
      id: Number(categoria.id),
      empresaId: Number(categoria.empresaId),
      descricao: categoria.descricao,
      ativo: categoria.ativo,
      createdAt: categoria.createdAt,
      updatedAt: categoria.updatedAt,
    };
  }
}
