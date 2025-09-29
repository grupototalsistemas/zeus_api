// empresas/empresas.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmpresaDto, UpdateEmpresaDto } from '../dto/empresa.dto';

interface FindAllFilters {
  ativo?: StatusRegistro;
  cnpj?: string;
  razaoSocial?: string;
}

@Injectable()
export class EmpresasService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEmpresaDto): Promise<CreateEmpresaDto> {
    // Validar se CNPJ já existe
    await this.validateCnpjUnique(data.cnpj);

    // Validar se tipo existe
    await this.validateEmpresaTipoExists(data.tipoId);

    // Validar se categoria existe
    await this.validateEmpresaCategoriaExists(data.categoriaId);

    // Validar CNPJ format (básico)
    this.validateCnpjFormat(data.cnpj);

    try {
      const empresa = await this.prisma.empresa.create({
        data: {
          ...data,
          tipoId: BigInt(data.tipoId),
          categoriaId: BigInt(data.categoriaId),
        },
        include: {
          categorias: true,
        },
      });

      return this.mapToResponseDto(empresa);
    } catch (error) {
      throw new BadRequestException('Erro ao criar empresa: ' + error.message);
    }
  }

  async findByName(nome: string): Promise<CreateEmpresaDto[]> {
    // Buscar empresas com o nome contendo o termo
    const empresas = await this.prisma.empresa.findMany({
      where: {
        razaoSocial: {
          contains: nome,
          mode: 'insensitive',
        },
        nomeFantasia: {
          contains: nome,
          mode: 'insensitive',
        },
        ativo: StatusRegistro.ATIVO,
      },
      include: {
        categorias: true,
      },
    });

    return empresas.map((empresa) => this.mapToResponseDto(empresa));
  }

  async findAll(filters: FindAllFilters = {}): Promise<CreateEmpresaDto[]> {
    const where: any = {};

    if (filters.ativo) {
      where.ativo = filters.ativo;
    }

    if (filters.cnpj) {
      where.cnpj = { contains: filters.cnpj };
    }

    if (filters.razaoSocial) {
      where.razaoSocial = {
        contains: filters.razaoSocial,
        mode: 'insensitive',
      };
    }

    const empresas = await this.prisma.empresa.findMany({
      where,
      include: {
        categorias: true,
      },
      orderBy: {
        razaoSocial: 'asc',
      },
    });

    return empresas.map((empresa) => this.mapToResponseDto(empresa));
  }

  async findOne(id: bigint): Promise<CreateEmpresaDto> {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: {
        categorias: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }

    return this.mapToResponseDto(empresa);
  }

  async findOneComplete(id: bigint) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: {
        categorias: {
          where: { ativo: StatusRegistro.ATIVO },
        },
        sistemas: {
          where: { ativo: StatusRegistro.ATIVO },
        },
        empresaSistemas: {
          where: { ativo: StatusRegistro.ATIVO },
          include: {
            sistema: true,
          },
        },
        pessoas: {
          where: { ativo: StatusRegistro.ATIVO },
          take: 10, // Limit for performance
        },
        chamados: {
          take: 10, // Recent chamados
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }

    return empresa;
  }

  async update(id: bigint, data: UpdateEmpresaDto): Promise<CreateEmpresaDto> {
    // Verificar se empresa existe
    await this.findOne(id);

    // Validar CNPJ se foi alterado
    if (data.cnpj) {
      await this.validateCnpjUnique(data.cnpj, id);
      this.validateCnpjFormat(data.cnpj);
    }

    // Validar tipo se foi alterado
    if (data.tipoId) {
      await this.validateEmpresaTipoExists(data.tipoId);
    }

    // Validar categoria se foi alterado
    if (data.categoriaId) {
      await this.validateEmpresaCategoriaExists(data.categoriaId);
    }

    try {
      const updateData: any = { ...data };

      if (data.tipoId) {
        updateData.tipoId = BigInt(data.tipoId);
      }

      if (data.categoriaId) {
        updateData.categoriaId = BigInt(data.categoriaId);
      }

      updateData.updatedAt = new Date();
      console.log('Update Data:', updateData); // Log para depuração
      const empresa = await this.prisma.empresa.update({
        where: { id },
        data: updateData,
        include: {
          categorias: true,
        },
      });
      console.log('Empresa Atualizada:', empresa); // Log para depuração
      return this.mapToResponseDto(empresa);
    } catch (error) {
      throw new BadRequestException(
        'Erro ao atualizar empresa: ' + error.message,
      );
    }
  }

  // service
  async remove(id: bigint): Promise<{ message: string }> {
    await this.findOne(id);
    await this.validateCanDelete(id);

    try {
      await this.prisma.empresa.update({
        where: { id },
        data: { ativo: StatusRegistro.INATIVO },
      });
      return { message: 'Empresa excluída com sucesso' };
    } catch (error) {
      throw new ConflictException(
        'Não foi possível excluir a empresa. Verifique se não há relacionamentos pendentes.',
      );
    }
  }

  async activate(id: bigint): Promise<CreateEmpresaDto> {
    const empresa = await this.prisma.empresa.update({
      where: { id },
      data: {
        ativo: StatusRegistro.ATIVO,
        motivo: null,
        updatedAt: new Date(),
      },
      include: {
        categorias: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }

    return this.mapToResponseDto(empresa);
  }

  async deactivate(id: bigint, motivo: string): Promise<CreateEmpresaDto> {
    if (!motivo || motivo.trim().length === 0) {
      throw new BadRequestException('Motivo da desativação é obrigatório');
    }

    const empresa = await this.prisma.empresa.update({
      where: { id },
      data: {
        ativo: StatusRegistro.INATIVO,
        motivo: motivo.trim(),
        updatedAt: new Date(),
      },
      include: {
        categorias: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }

    return this.mapToResponseDto(empresa);
  }

  // Métodos de validação privados
  private async validateCnpjUnique(
    cnpj: string,
    excludeId?: bigint,
  ): Promise<void> {
    const where: any = { cnpj };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingEmpresa = await this.prisma.empresa.findFirst({ where });

    if (existingEmpresa) {
      throw new ConflictException('CNPJ já cadastrado para outra empresa');
    }
  }

  private async validateEmpresaTipoExists(tipoId: number): Promise<void> {
    const tipo = await this.prisma.empresaTipo.findFirst({
      where: {
        id: BigInt(tipoId),
        ativo: StatusRegistro.ATIVO,
      },
    });

    if (!tipo) {
      throw new NotFoundException(
        `Tipo de empresa com ID ${tipoId} não encontrado ou inativo`,
      );
    }
  }

  private async validateEmpresaCategoriaExists(
    categoriaId: number,
  ): Promise<void> {
    const categoria = await this.prisma.empresaCategoria.findFirst({
      where: {
        id: BigInt(categoriaId),
        ativo: StatusRegistro.ATIVO,
      },
    });

    if (!categoria) {
      throw new NotFoundException(
        `Categoria de empresa com ID ${categoriaId} não encontrada ou inativa`,
      );
    }
  }

  private validateCnpjFormat(cnpj: string): void {
    // Remove caracteres não numéricos
    const cnpjNumbers = cnpj.replace(/\D/g, '');

    if (cnpjNumbers.length !== 14) {
      throw new BadRequestException('CNPJ deve conter 14 dígitos');
    }

    // Verifica se não são todos os dígitos iguais
    if (/^(\d)\1+$/.test(cnpjNumbers)) {
      throw new BadRequestException('CNPJ inválido');
    }
  }

  private async validateCanDelete(id: bigint): Promise<void> {
    // Verificar se tem pessoas vinculadas
    const pessoasCount = await this.prisma.pessoa.count({
      where: { empresaId: id },
    });

    if (pessoasCount > 0) {
      throw new ConflictException(
        'Não é possível excluir empresa que possui pessoas vinculadas',
      );
    }

    // Verificar se tem chamados
    const chamadosCount = await this.prisma.chamado.count({
      where: { empresaId: id },
    });

    if (chamadosCount > 0) {
      throw new ConflictException(
        'Não é possível excluir empresa que possui chamados',
      );
    }

    // Verificar se tem sistemas vinculados
    const sistemasCount = await this.prisma.empresaSistema.count({
      where: { empresaId: id },
    });

    if (sistemasCount > 0) {
      throw new ConflictException(
        'Não é possível excluir empresa que possui sistemas vinculados',
      );
    }
  }

  private mapToResponseDto(empresa: any): CreateEmpresaDto {
    return {
      id: Number(empresa.id),
      parentId: Number(empresa.parentId),
      tipoId: Number(empresa.tipoId),
      categoriaId: Number(empresa.categoriaId),
      cnpj: empresa.cnpj,
      codigo: empresa.codigo,
      razaoSocial: empresa.razaoSocial,
      nomeFantasia: empresa.nomeFantasia,
      logradouro: empresa.logradouro,
      endereco: empresa.endereco,
      numero: empresa.numero,
      complemento: empresa.complemento,
      bairro: empresa.bairro,
      cidade: empresa.cidade,
      estado: empresa.estado,
      cep: empresa.cep,
      contato: empresa.contato,
      email: empresa.email,
      observacao: empresa.observacao,
      ativo: empresa.ativo,
      motivo: empresa.motivo,
      createdAt: empresa.createdAt,
      updatedAt: empresa.updatedAt,
    };
  }
}
