// empresas/empresa-sistema.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EmpresaSistemaResponseDto,
  UpdateEmpresaSistemaDto,
} from '../dto/empresa-sistema.dto';

interface FindAllFilters {
  ativo?: StatusRegistro;
  empresaId?: number;
  sistemaId?: number;
  versao?: string;
}

@Injectable()
export class EmpresaSistemaService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: UpdateEmpresaSistemaDto,
  ): Promise<EmpresaSistemaResponseDto> {
    // Validar se empresa e sistema existem
    await this.validateEmpresaExists(Number(data.empresaId));
    await this.validateSistemaExists(Number(data.sistemaId));

    // Validar se o vínculo já existe
    await this.validateVinculoUnique(
      Number(data.empresaId),
      Number(data.sistemaId),
    );

    try {
      const empresaSistema = await this.prisma.empresaSistema.create({
        data: {
          empresaId: data.empresaId || 0,
          sistemaId: data.sistemaId || 0,
          versao: data.versao || '1.0.0',
          ativo: data.ativo || StatusRegistro.ATIVO,
          motivo: data.motivo,
        },
        include: {
          empresa: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
            },
          },
          sistema: {
            select: {
              id: true,
              nome: true,
              descricao: true,
            },
          },
        },
      });

      return this.mapToResponseDto(empresaSistema);
    } catch (error) {
      throw new BadRequestException(
        'Erro ao criar vínculo empresa-sistema: ' + error.message,
      );
    }
  }

  async findAll(
    filters: FindAllFilters = {},
  ): Promise<EmpresaSistemaResponseDto[]> {
    const where: any = {};

    if (filters.ativo) where.ativo = filters.ativo;
    if (filters.empresaId) where.empresaId = BigInt(filters.empresaId);
    if (filters.sistemaId) where.sistemaId = BigInt(filters.sistemaId);
    if (filters.versao) {
      where.versao = { contains: filters.versao, mode: 'insensitive' };
    }

    const vinculos = await this.prisma.empresaSistema.findMany({
      where,
      include: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
        sistema: {
          select: {
            id: true,
            nome: true,
            descricao: true,
          },
        },
      },
      orderBy: [
        { empresa: { razaoSocial: 'asc' } },
        { sistema: { nome: 'asc' } },
      ],
    });

    return vinculos.map((vinculo) => this.mapToResponseDto(vinculo));
  }

  async findOne(id: bigint): Promise<EmpresaSistemaResponseDto> {
    const vinculo = await this.prisma.empresaSistema.findUnique({
      where: { id },
      include: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
          },
        },
        sistema: {
          select: {
            id: true,
            nome: true,
            descricao: true,
          },
        },
      },
    });

    if (!vinculo) {
      throw new NotFoundException(
        `Vínculo empresa-sistema com ID ${id} não encontrado`,
      );
    }

    return this.mapToResponseDto(vinculo);
  }

  async findByEmpresa(empresaId: bigint, ativo?: StatusRegistro) {
    console.log('empresaId', empresaId);
    await this.validateEmpresaExists(Number(empresaId));

    const where: any = { empresaId };
    if (ativo) where.ativo = ativo;

    const vinculos = await this.prisma.empresaSistema.findMany({
      where,
      include: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
        sistema: {
          select: {
            id: true,
            nome: true,
            descricao: true,
          },
        },
      },
      orderBy: { sistema: { nome: 'asc' } },
    });

    // return vinculos.map((vinculo) => this.mapToResponseDto(vinculo));
    return vinculos;
  }

  async findBySistema(
    sistemaId: bigint,
    ativo?: StatusRegistro,
  ): Promise<EmpresaSistemaResponseDto[]> {
    await this.validateSistemaExists(Number(sistemaId));

    const where: any = { sistemaId };
    if (ativo) where.ativo = ativo;

    const vinculos = await this.prisma.empresaSistema.findMany({
      where,
      include: {
        empresa: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
        sistema: {
          select: {
            id: true,
            nome: true,
            descricao: true,
          },
        },
      },
      orderBy: { empresa: { razaoSocial: 'asc' } },
    });

    return vinculos.map((vinculo) => this.mapToResponseDto(vinculo));
  }

  async update(
    id: bigint,
    data: UpdateEmpresaSistemaDto,
  ): Promise<EmpresaSistemaResponseDto> {
    // Verificar se o vínculo existe
    await this.findOne(id);

    // Validar empresa se foi alterada
    if (data.empresaId) {
      await this.validateEmpresaExists(Number(data.empresaId));
    }

    // Validar sistema se foi alterado
    if (data.sistemaId) {
      await this.validateSistemaExists(Number(data.sistemaId));
    }

    // Verificar se não criará duplicata
    if (data.empresaId || data.sistemaId) {
      const current = await this.prisma.empresaSistema.findUnique({
        where: { id },
        select: { empresaId: true, sistemaId: true },
      });

      const empresaIdToCheck = data.empresaId
        ? BigInt(data.empresaId)
        : current?.empresaId;

      const sistemaIdToCheck = data.sistemaId
        ? BigInt(data.sistemaId)
        : current?.sistemaId;

      await this.validateVinculoUnique(
        Number(empresaIdToCheck),
        Number(sistemaIdToCheck),
        id,
      );
    }

    try {
      const updateData: any = { ...data };

      if (data.empresaId) {
        updateData.empresaId = BigInt(data.empresaId);
      }

      if (data.sistemaId) {
        updateData.sistemaId = BigInt(data.sistemaId);
      }

      updateData.updatedAt = new Date();

      const vinculo = await this.prisma.empresaSistema.update({
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
          sistema: {
            select: {
              id: true,
              nome: true,
              descricao: true,
            },
          },
        },
      });

      return this.mapToResponseDto(vinculo);
    } catch (error) {
      throw new BadRequestException(
        'Erro ao atualizar vínculo: ' + error.message,
      );
    }
  }

  async remove(id: bigint): Promise<void> {
    // Verificar se o vínculo existe
    await this.findOne(id);

    // Verificar se possui relacionamentos que impedem exclusão
    await this.validateCanDelete(id);

    try {
      await this.prisma.empresaSistema.update({
        where: { id },
        data: {
          ativo: StatusRegistro.INATIVO,
        },
      });
    } catch (error) {
      throw new ConflictException(
        'Não foi possível excluir o vínculo. Verifique se não há relacionamentos pendentes.',
      );
    }
  }

  async activate(id: bigint): Promise<EmpresaSistemaResponseDto> {
    const vinculo = await this.prisma.empresaSistema.update({
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
        sistema: {
          select: {
            id: true,
            nome: true,
            descricao: true,
          },
        },
      },
    });

    if (!vinculo) {
      throw new NotFoundException(`Vínculo com ID ${id} não encontrado`);
    }

    return this.mapToResponseDto(vinculo);
  }

  async deactivate(
    id: bigint,
    motivo: string,
  ): Promise<EmpresaSistemaResponseDto> {
    if (!motivo || motivo.trim().length === 0) {
      throw new BadRequestException('Motivo da desativação é obrigatório');
    }

    const vinculo = await this.prisma.empresaSistema.update({
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
        sistema: {
          select: {
            id: true,
            nome: true,
            descricao: true,
          },
        },
      },
    });

    if (!vinculo) {
      throw new NotFoundException(`Vínculo com ID ${id} não encontrado`);
    }

    return this.mapToResponseDto(vinculo);
  }

  async updateVersion(
    id: bigint,
    versao: string,
  ): Promise<EmpresaSistemaResponseDto> {
    if (!versao || versao.trim().length === 0) {
      throw new BadRequestException('Versão é obrigatória');
    }

    const vinculo = await this.prisma.empresaSistema.update({
      where: { id },
      data: {
        versao: versao.trim(),
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
        sistema: {
          select: {
            id: true,
            nome: true,
            descricao: true,
          },
        },
      },
    });

    if (!vinculo) {
      throw new NotFoundException(`Vínculo com ID ${id} não encontrado`);
    }

    return this.mapToResponseDto(vinculo);
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

  private async validateSistemaExists(sistemaId: number): Promise<void> {
    const sistema = await this.prisma.sistema.findFirst({
      where: {
        id: BigInt(sistemaId),
        ativo: StatusRegistro.ATIVO,
      },
    });

    if (!sistema) {
      throw new NotFoundException(
        `Sistema com ID ${sistemaId} não encontrado ou inativo`,
      );
    }
  }

  private async validateVinculoUnique(
    empresaId: number,
    sistemaId: number,
    excludeId?: bigint,
  ): Promise<void> {
    const where: any = {
      empresaId: BigInt(empresaId),
      sistemaId: BigInt(sistemaId),
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingVinculo = await this.prisma.empresaSistema.findFirst({
      where,
    });

    if (existingVinculo) {
      throw new ConflictException(
        'Vínculo entre esta empresa e sistema já existe',
      );
    }
  }

  private async validateCanDelete(id: bigint): Promise<void> {
    // Aqui você pode adicionar validações específicas
    // Por exemplo, verificar se existem chamados que dependem deste vínculo
    // ou outros relacionamentos críticos
    // Exemplo de validação (ajuste conforme sua regra de negócio):
    /*
    const chamadosCount = await this.prisma.chamado.count({
      where: { 
        empresaId: vinculo.empresaId,
        sistemaId: vinculo.sistemaId
      },
    });

    if (chamadosCount > 0) {
      throw new ConflictException(
        'Não é possível excluir vínculo que possui chamados relacionados'
      );
    }
    */
  }

  private mapToResponseDto(vinculo: any): EmpresaSistemaResponseDto {
    return {
      id: vinculo.id,
      empresaId: vinculo.empresaId,
      sistemaId: vinculo.sistemaId,
      versao: vinculo.versao,
      ativo: vinculo.ativo,
      motivo: vinculo.motivo,
      createdAt: vinculo.createdAt,
      updatedAt: vinculo.updatedAt,
    };
  }
}
