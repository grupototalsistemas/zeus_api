import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { StatusRegistro } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateEmpresaTipoDto, EmpresaTipoResponseDto, UpdateEmpresaTipoDto } from "../dto/create-empresa-tipo.dto";


@Injectable()
export class EmpresaTipoService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEmpresaTipoDto): Promise<EmpresaTipoResponseDto> {
    await this.validateEmpresaExists(data.empresaId);
    await this.validateDescricaoUnique(data.descricao, data.empresaId);

    try {
      const tipo = await this.prisma.empresaTipo.create({
        data: {
          ...data,
          empresaId: BigInt(data.empresaId),
        },
      });

      return this.mapToResponseDto(tipo);
    } catch (error) {
      throw new BadRequestException('Erro ao criar tipo: ' + error.message);
    }
  }

  async findAll(filters: any = {}): Promise<EmpresaTipoResponseDto[]> {
    const where: any = {};

    if (filters.ativo) where.ativo = filters.ativo;
    if (filters.empresaId) where.empresaId = BigInt(filters.empresaId);
    if (filters.descricao) {
      where.descricao = { contains: filters.descricao, mode: 'insensitive' };
    }

    const tipos = await this.prisma.empresaTipo.findMany({
      where,
      orderBy: { descricao: 'asc' },
    });

    return tipos.map(tipo => this.mapToResponseDto(tipo));
  }

  async findOne(id: bigint): Promise<EmpresaTipoResponseDto> {
    const tipo = await this.prisma.empresaTipo.findUnique({
      where: { id },
    });

    if (!tipo) {
      throw new NotFoundException(`Tipo com ID ${id} não encontrado`);
    }

    return this.mapToResponseDto(tipo);
  }

  async findByEmpresa(empresaId: bigint): Promise<EmpresaTipoResponseDto[]> {
    await this.validateEmpresaExists(Number(empresaId));

    const tipos = await this.prisma.empresaTipo.findMany({
      where: { 
        empresaId,
        ativo: StatusRegistro.ATIVO,
      },
      orderBy: { descricao: 'asc' },
    });

    return tipos.map(tipo => this.mapToResponseDto(tipo));
  }

  async update(id: bigint, data: UpdateEmpresaTipoDto): Promise<EmpresaTipoResponseDto> {
    await this.findOne(id);

    if (data.empresaId) {
      await this.validateEmpresaExists(data.empresaId);
    }

    if (data.descricao) {
      const current = await this.prisma.empresaTipo.findUnique({
        where: { id },
        select: { empresaId: true },
      });
      
      const empresaIdToCheck = data.empresaId 
        ? BigInt(data.empresaId) 
        : current?.empresaId;
        
      await this.validateDescricaoUnique(
        data.descricao, 
        Number(empresaIdToCheck), 
        id
      );
    }

    try {
      const updateData: any = { ...data };
      if (data.empresaId) {
        updateData.empresaId = BigInt(data.empresaId);
      }
      updateData.updatedAt = new Date();

      const tipo = await this.prisma.empresaTipo.update({
        where: { id },
        data: updateData,
      });

      return this.mapToResponseDto(tipo);
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar tipo: ' + error.message);
    }
  }

  async remove(id: bigint): Promise<void> {
    await this.findOne(id);
    await this.validateCanDelete(id);

    try {
      await this.prisma.empresaTipo.delete({ where: { id } });
    } catch (error) {
      throw new ConflictException('Não foi possível excluir o tipo.');
    }
  }

  async activate(id: bigint): Promise<EmpresaTipoResponseDto> {
    const tipo = await this.prisma.empresaTipo.update({
      where: { id },
      data: {
        ativo: StatusRegistro.ATIVO,
        updatedAt: new Date(),
      },
    });

    if (!tipo) {
      throw new NotFoundException(`Tipo com ID ${id} não encontrado`);
    }

    return this.mapToResponseDto(tipo);
  }

  async deactivate(id: bigint): Promise<EmpresaTipoResponseDto> {
    const tipo = await this.prisma.empresaTipo.update({
      where: { id },
      data: {
        ativo: StatusRegistro.INATIVO,
        updatedAt: new Date(),
      },
    });

    if (!tipo) {
      throw new NotFoundException(`Tipo com ID ${id} não encontrado`);
    }

    return this.mapToResponseDto(tipo);
  }

  private async validateEmpresaExists(empresaId: number): Promise<void> {
    const empresa = await this.prisma.empresa.findFirst({
      where: {
        id: BigInt(empresaId),
        ativo: StatusRegistro.ATIVO,
      },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa com ID ${empresaId} não encontrada ou inativa`);
    }
  }

  private async validateDescricaoUnique(
    descricao: string,
    empresaId: number,
    excludeId?: bigint
  ): Promise<void> {
    const where: any = { 
      descricao: { equals: descricao, mode: 'insensitive' },
      empresaId: BigInt(empresaId),
    };
    
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existing = await this.prisma.empresaTipo.findFirst({ where });
    
    if (existing) {
      throw new ConflictException('Tipo com esta descrição já existe para esta empresa');
    }
  }

  private async validateCanDelete(id: bigint): Promise<void> {
    const empresasUsing = await this.prisma.empresa.count({
      where: { tipoId: id },
    });

    if (empresasUsing > 0) {
      throw new ConflictException(
        'Não é possível excluir tipo que está sendo utilizado por empresas'
      );
    }
  }

  private mapToResponseDto(tipo: any): EmpresaTipoResponseDto {
    return {
      id: Number(tipo.id),
      empresaId: Number(tipo.empresaId),
      descricao: tipo.descricao,
      ativo: tipo.ativo,
      createdAt: tipo.createdAt,
      updatedAt: tipo.updatedAt,
    };
  }
}