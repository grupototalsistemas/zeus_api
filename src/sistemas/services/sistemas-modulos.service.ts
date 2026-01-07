import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateSistemasModulosDto,
  DeleteSistemaModuloDto,
  UpdateSistemaModuloDto,
} from '../dto/sistemas-modulos.dto';

@Injectable()
export class SistemasModulosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Criar múltiplos vínculos de módulos com sistemas (array)
   */
  async create(dto: CreateSistemasModulosDto) {
    const resultados: any[] = [];
    const erros: any[] = [];

    for (const modulo of dto.modulos) {
      try {
        // Verifica se o sistema existe
        const sistemaExists = await this.prisma.sistemas.findUnique({
          where: { id: BigInt(modulo.id_sistema) },
        });

        if (!sistemaExists) {
          erros.push({
            modulo,
            erro: `Sistema com ID ${modulo.id_sistema} não encontrado`,
          });
          continue;
        }

        // Verifica se o módulo existe
        const moduloExists = await this.prisma.modulos.findUnique({
          where: { id: BigInt(modulo.id_modulo_principal) },
        });

        if (!moduloExists) {
          erros.push({
            modulo,
            erro: `Módulo com ID ${modulo.id_modulo_principal} não encontrado`,
          });
          continue;
        }

        // Verifica se já existe um vínculo ativo
        const vinculoExistente = await this.prisma.sistemasModulos.findFirst({
          where: {
            id_sistema: BigInt(modulo.id_sistema),
            id_modulo_principal: BigInt(modulo.id_modulo_principal),
            situacao: 1,
          },
        });

        if (vinculoExistente) {
          erros.push({
            modulo,
            erro: `Vínculo entre sistema ${modulo.id_sistema} e módulo ${modulo.id_modulo_principal} já existe`,
          });
          continue;
        }

        // Cria o vínculo
        const novoVinculo = await this.prisma.sistemasModulos.create({
          data: {
            id_sistema: BigInt(modulo.id_sistema),
            id_modulo_principal: BigInt(modulo.id_modulo_principal),
            situacao: 1,
            motivo: null,
          },
          include: {
            sistema: {
              select: {
                id: true,
                sistema: true,
                descricao: true,
              },
            },
            moduloPrincipal: {
              select: {
                id: true,
                component_name: true,
                component_text: true,
              },
            },
          },
        });

        resultados.push({
          id: Number(novoVinculo.id),
          id_sistema: Number(novoVinculo.id_sistema),
          id_modulo_principal: Number(novoVinculo.id_modulo_principal),
          situacao: novoVinculo.situacao,
          motivo: novoVinculo.motivo,
          created_at: novoVinculo.createdAt,
          sistema: {
            id: Number(novoVinculo.sistema.id),
            sistema: novoVinculo.sistema.sistema,
            descricao: novoVinculo.sistema.descricao,
          },
          modulo: {
            id: Number(novoVinculo.moduloPrincipal.id),
            component_name: novoVinculo.moduloPrincipal.component_name,
            component_text: novoVinculo.moduloPrincipal.component_text,
          },
        });
      } catch (error) {
        erros.push({
          modulo,
          erro: `Erro ao criar vínculo: ${error.message}`,
        });
      }
    }

    if (erros.length > 0 && resultados.length === 0) {
      throw new BadRequestException({
        message: 'Nenhum vínculo foi criado',
        erros,
      });
    }

    return {
      message: `${resultados.length} vínculo(s) criado(s) com sucesso`,
      sucessos: resultados.length,
      falhas: erros.length,
      data: resultados,
      erros: erros.length > 0 ? erros : undefined,
    };
  }

  /**
   * Buscar todos os vínculos de sistemas e módulos
   */
  async findAll() {
    const vinculos = await this.prisma.sistemasModulos.findMany({
      include: {
        sistema: {
          select: {
            id: true,
            sistema: true,
            descricao: true,
            status_web: true,
          },
        },
        moduloPrincipal: {
          select: {
            id: true,
            component_name: true,
            component_text: true,
            component_index: true,
          },
        },
      },
      orderBy: [{ id_sistema: 'asc' }, { id_modulo_principal: 'asc' }],
    });

    return vinculos.map((vinculo) => ({
      id: Number(vinculo.id),
      id_sistema: Number(vinculo.id_sistema),
      id_modulo_principal: Number(vinculo.id_modulo_principal),
      situacao: vinculo.situacao,
      motivo: vinculo.motivo,
      created_at: vinculo.createdAt,
      updated_at: vinculo.updatedAt,
      sistema: {
        id: Number(vinculo.sistema.id),
        sistema: vinculo.sistema.sistema,
        descricao: vinculo.sistema.descricao,
        status_web: vinculo.sistema.status_web,
      },
      modulo: {
        id: Number(vinculo.moduloPrincipal.id),
        component_name: vinculo.moduloPrincipal.component_name,
        component_text: vinculo.moduloPrincipal.component_text,
        component_index: vinculo.moduloPrincipal.component_index,
      },
    }));
  }

  /**
   * Buscar vínculo por ID
   */
  async findOne(id: number) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('ID do vínculo é obrigatório');
    }

    const vinculo = await this.prisma.sistemasModulos.findUnique({
      where: { id: BigInt(id) },
      include: {
        sistema: {
          select: {
            id: true,
            sistema: true,
            descricao: true,
            status_web: true,
          },
        },
        moduloPrincipal: {
          select: {
            id: true,
            component_name: true,
            component_text: true,
            component_index: true,
          },
        },
      },
    });

    if (!vinculo) {
      throw new NotFoundException(`Vínculo com ID ${id} não encontrado`);
    }

    return {
      id: Number(vinculo.id),
      id_sistema: Number(vinculo.id_sistema),
      id_modulo_principal: Number(vinculo.id_modulo_principal),
      situacao: vinculo.situacao,
      motivo: vinculo.motivo,
      created_at: vinculo.createdAt,
      updated_at: vinculo.updatedAt,
      sistema: {
        id: Number(vinculo.sistema.id),
        sistema: vinculo.sistema.sistema,
        descricao: vinculo.sistema.descricao,
        status_web: vinculo.sistema.status_web,
      },
      modulo: {
        id: Number(vinculo.moduloPrincipal.id),
        component_name: vinculo.moduloPrincipal.component_name,
        component_text: vinculo.moduloPrincipal.component_text,
        component_index: vinculo.moduloPrincipal.component_index,
      },
    };
  }

  /**
   * Buscar módulos por sistema
   */
  async findBySistema(id_sistema: number) {
    if (!id_sistema || isNaN(id_sistema)) {
      throw new BadRequestException('ID do sistema é obrigatório');
    }

    const vinculos = await this.prisma.sistemasModulos.findMany({
      where: {
        id_sistema: BigInt(id_sistema),
        situacao: 1,
      },
      include: {
        moduloPrincipal: {
          select: {
            id: true,
            component_name: true,
            component_text: true,
            component_index: true,
          },
        },
      },
      orderBy: { id_modulo_principal: 'asc' },
    });

    if (!vinculos.length) {
      throw new NotFoundException(
        `Nenhum módulo encontrado para o sistema ID: ${id_sistema}`,
      );
    }

    return vinculos.map((vinculo) => ({
      id: Number(vinculo.id),
      id_sistema: Number(vinculo.id_sistema),
      id_modulo_principal: Number(vinculo.id_modulo_principal),
      situacao: vinculo.situacao,
      motivo: vinculo.motivo,
      created_at: vinculo.createdAt,
      updated_at: vinculo.updatedAt,
      modulo: {
        id: Number(vinculo.moduloPrincipal.id),
        component_name: vinculo.moduloPrincipal.component_name,
        component_text: vinculo.moduloPrincipal.component_text,
        component_index: vinculo.moduloPrincipal.component_index,
      },
    }));
  }

  /**
   * Atualizar vínculo
   */
  async update(id: number, dto: UpdateSistemaModuloDto) {
    await this.findOne(id); // Valida existência

    const vinculoAtualizado = await this.prisma.sistemasModulos.update({
      where: { id: BigInt(id) },
      data: {
        id_modulo_principal: dto.id_modulo_principal
          ? BigInt(dto.id_modulo_principal)
          : undefined,
        situacao: dto.situacao,
        motivo: dto.motivo,
        updatedAt: new Date(),
      },
      include: {
        sistema: {
          select: {
            id: true,
            sistema: true,
            descricao: true,
          },
        },
        moduloPrincipal: {
          select: {
            id: true,
            component_name: true,
            component_text: true,
          },
        },
      },
    });

    return {
      message: 'Vínculo atualizado com sucesso',
      data: {
        id: Number(vinculoAtualizado.id),
        id_sistema: Number(vinculoAtualizado.id_sistema),
        id_modulo_principal: Number(vinculoAtualizado.id_modulo_principal),
        situacao: vinculoAtualizado.situacao,
        motivo: vinculoAtualizado.motivo,
        updated_at: vinculoAtualizado.updatedAt,
        sistema: {
          id: Number(vinculoAtualizado.sistema.id),
          sistema: vinculoAtualizado.sistema.sistema,
          descricao: vinculoAtualizado.sistema.descricao,
        },
        modulo: {
          id: Number(vinculoAtualizado.moduloPrincipal.id),
          component_name: vinculoAtualizado.moduloPrincipal.component_name,
          component_text: vinculoAtualizado.moduloPrincipal.component_text,
        },
      },
    };
  }

  /**
   * Remover vínculo (exclusão lógica)
   */
  async remove(id: number, deleteData: DeleteSistemaModuloDto) {
    const vinculo = await this.prisma.sistemasModulos.findUnique({
      where: { id: BigInt(id) },
    });

    if (!vinculo) {
      throw new NotFoundException(`Vínculo com ID ${id} não encontrado`);
    }

    // Verifica se está ativo (situacao = 1)
    if (vinculo.situacao !== 1) {
      throw new BadRequestException('Vínculo já está desativado');
    }

    // Verifica se não é registro global (id_sistema = -1)
    if (Number(vinculo.id_sistema) === -1) {
      throw new BadRequestException(
        'Nao e permitido remover registros globais',
      );
    }

    const vinculoRemovido = await this.prisma.sistemasModulos.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo: deleteData.motivo,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Vínculo removido com sucesso (exclusão lógica)',
      data: {
        id: Number(vinculoRemovido.id),
        situacao: vinculoRemovido.situacao,
        motivo: vinculoRemovido.motivo,
        updated_at: vinculoRemovido.updatedAt,
      },
    };
  }
}
