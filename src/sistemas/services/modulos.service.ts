import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateModuloDto, UpdateModuloDto } from '../dto/modulo.dto';

@Injectable()
export class ModulosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createModuloDto: CreateModuloDto, id_sistema?: bigint) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const moduloExistente = await tx.modulos.findFirst({
          where: {
            component_name: createModuloDto.component_name,
            situacao: 1,
            name_form_page: createModuloDto.name_form_page,
          },
        });

        if (moduloExistente) {
          throw new BadRequestException(
            `Módulo ${createModuloDto.component_name} ja cadastrado`,
          );
        }

        const moduloData = { ...createModuloDto } as Record<string, any>;
        delete moduloData.id;
        delete moduloData.createdAt;
        delete moduloData.updatedAt;

        const novoModulo = await tx.modulos.create({
          data: moduloData as CreateModuloDto,
        });

        if (id_sistema !== undefined && id_sistema !== null) {
          const sistemaId =
            typeof id_sistema === 'bigint' ? id_sistema : BigInt(id_sistema);

          const sistemaExiste = await tx.sistemas.findUnique({
            where: { id: sistemaId },
          });

          if (!sistemaExiste) {
            throw new NotFoundException(
              `Sistema com ID ${sistemaId.toString()} não encontrado`,
            );
          }

          const vinculoExistente = await tx.sistemasModulos.findFirst({
            where: {
              id_sistema: sistemaId,
              id_modulo_principal: novoModulo.id,
              situacao: 1,
            },
          });

          if (vinculoExistente) {
            throw new BadRequestException(
              `Vínculo entre sistema ${sistemaId.toString()} e módulo ${novoModulo.id.toString()} já existe`,
            );
          }

          // Cria o vínculo na mesma transação para manter consistência.
          await tx.sistemasModulos.create({
            data: {
              id_sistema: sistemaId,
              id_modulo_principal: novoModulo.id,
              situacao: 1,
              motivo: null,
            },
          });
        }

        return novoModulo;
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new ServiceUnavailableException(
        `Erro ao criar módulo: ${error.message}`,
      );
    }
  }

  async findAll() {
    return this.prisma.modulos.findMany();
  }

  async findAllBySistema(id_sistema: bigint) {
    const sistema_modulos = await this.prisma.sistemasModulos.findMany({
      where: { id_sistema: id_sistema },
    });

    const idsToFind = sistema_modulos.map((sm) => sm.id_modulo_principal);

    return this.prisma.modulos.findMany({
      where: {
        OR: [{ id: { in: idsToFind } }, { id_parent: { in: idsToFind } }],
      },
    });
  }

  async findOne(id: bigint) {
    const modulos = await this.prisma.modulos.findUnique({
      where: { id },
    });
    if (!modulos) {
      throw new NotFoundException(`Módulo com ID ${id} não encontrado`);
    }
    return modulos;
  }

  async update(id: bigint, updateModuloDto: UpdateModuloDto) {
    await this.findOne(id); // valida se existe
    return this.prisma.modulos.update({
      where: { id },
      data: updateModuloDto,
    });
  }

  async remove(id: bigint, motivo: string) {
    // Busca o módulo para validação
    const modulo = await this.prisma.modulos.findUnique({
      where: { id },
    });

    if (!modulo) {
      throw new NotFoundException(`Módulo com ID ${id} não encontrado`);
    }

    // Verifica se está ativo (situacao = 1)
    if (modulo.situacao !== 1) {
      throw new BadRequestException('Módulo já está desativado');
    }

    // Verifica se não é registro global (id_parent = -1 pode indicar módulo raiz/global)
    // Neste caso, não bloqueamos, pois id_parent = -1 indica que é um módulo raiz, não global

    // Executa a remoção lógica
    return this.prisma.modulos.update({
      where: { id },
      data: {
        situacao: 0,
        motivo: motivo,
        updatedAt: new Date(),
      },
    });
  }

  async removeAllChildrens(id: bigint, motivo: string) {
    await this.findOne(id); // valida se existe
    return this.prisma.modulos.updateMany({
      where: { id_parent: id },
      data: {
        situacao: 0,
        motivo: motivo,
        updatedAt: new Date(),
      },
    });
  }
}
