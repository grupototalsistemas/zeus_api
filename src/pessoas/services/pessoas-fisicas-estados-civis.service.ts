import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DateUtils } from 'src/common/utils/date.utils';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePessoasFisicasEstadosCivisDto,
  DeletePessoasFisicasEstadosCivisDto,
  PessoasFisicasEstadosCivisResponseDto,
  UpdatePessoasFisicasEstadosCivisDto,
} from '../dto/pessoas-fisicas-estados-civis.dto';

@Injectable()
export class PessoasFisicasEstadosCivisService {
  constructor(
    private prisma: PrismaService,
    private dateUtils: DateUtils,
  ) {}

  async create(createEstadosCivisDto: CreatePessoasFisicasEstadosCivisDto[]) {
    const sucessos: any[] = [];
    const erros: any[] = [];
    const total = createEstadosCivisDto.length;

    if (!createEstadosCivisDto || createEstadosCivisDto.length === 0) {
      throw new BadRequestException('Estados civis inválidos ou inexistentes.');
    }

    // Validação básica dos dados
    const resultadosValidacao = await Promise.allSettled(
      createEstadosCivisDto.map(async (estadoCivil, index) => {
        // Validação se já existe um estado civil com a mesma descrição
        const existente = await this.prisma.pessoasFisicasEstadoCivil.findFirst(
          {
            where: {
              descricao: estadoCivil.descricao?.trim(),
              situacao: 1,
            },
          },
        );

        if (existente) {
          throw new Error(`Estado civil '${estadoCivil.descricao}' já existe`);
        }

        return {
          descricao: estadoCivil.descricao?.trim(),
          situacao: 1,
        };
      }),
    );

    const dadosValidos: any[] = [];

    resultadosValidacao.forEach((resultado, index) => {
      if (resultado.status === 'fulfilled') {
        sucessos.push({
          index,
          estadoCivil: resultado.value.descricao,
        });
        dadosValidos.push(resultado.value);
      } else {
        erros.push({
          index,
          descricao: createEstadosCivisDto[index]?.descricao,
          erro: resultado.reason.message,
          estadoCivil: createEstadosCivisDto[index],
        });
      }
    });

    if (dadosValidos.length === 0) {
      throw new BadRequestException({
        message: 'Nenhum estado civil válido encontrado',
        erros,
        total,
        sucessos: sucessos.length,
        falhas: erros.length,
      });
    }

    try {
      const resultado = await this.prisma.pessoasFisicasEstadoCivil.createMany({
        data: dadosValidos,
      });

      return {
        message: 'Estados civis criados com sucesso',
        resultado,
        total,
        sucessos: sucessos.length,
        falhas: erros.length,
        detalhes: {
          sucessos,
          erros,
        },
      };
    } catch (error) {
      throw new BadRequestException({
        message: 'Erro ao criar estados civis',
        error: error.message,
        processamento: {
          total,
          sucessos: sucessos.length,
          falhas: erros.length,
          detalhes: { sucessos, erros },
        },
      });
    }
  }

  async findAll(): Promise<PessoasFisicasEstadosCivisResponseDto[]> {
    const estadosCivis = await this.prisma.pessoasFisicasEstadoCivil.findMany({
      where: {
        situacao: 1,
      },
      orderBy: {
        descricao: 'asc',
      },
    });

    return estadosCivis.map((item) => ({
      id: item.id.toString(),
      descricao: item.descricao || '',
      situacao: item.situacao,
      motivo: item.motivo,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async findOne(
    id: number,
  ): Promise<PessoasFisicasEstadosCivisResponseDto | null> {
    if (!id || id < 1) {
      throw new BadRequestException('ID inválido para buscar estado civil.');
    }

    const estadoCivil = await this.prisma.pessoasFisicasEstadoCivil.findUnique({
      where: {
        id: BigInt(id),
        situacao: 1,
      },
    });

    if (!estadoCivil) {
      throw new NotFoundException('Estado civil não encontrado.');
    }

    return {
      id: estadoCivil.id.toString(),
      descricao: estadoCivil.descricao || '',
      situacao: estadoCivil.situacao,
      motivo: estadoCivil.motivo,
      createdAt: estadoCivil.createdAt,
      updatedAt: estadoCivil.updatedAt,
    };
  }

  async update(
    id: number,
    updateEstadoCivilDto: UpdatePessoasFisicasEstadosCivisDto,
  ): Promise<PessoasFisicasEstadosCivisResponseDto> {
    if (!id || id < 1) {
      throw new BadRequestException(
        'ID inválido para atualização do estado civil.',
      );
    }

    // Verificar se o estado civil existe
    const estadoCivilExistente =
      await this.prisma.pessoasFisicasEstadoCivil.findUnique({
        where: {
          id: BigInt(id),
          situacao: 1,
        },
      });

    if (!estadoCivilExistente) {
      throw new NotFoundException('Estado civil não encontrado.');
    }

    // Verificar se já existe outro estado civil com a mesma descrição
    if (updateEstadoCivilDto.descricao) {
      const descricaoExistente =
        await this.prisma.pessoasFisicasEstadoCivil.findFirst({
          where: {
            descricao: updateEstadoCivilDto.descricao.trim(),
            situacao: 1,
            id: {
              not: BigInt(id),
            },
          },
        });

      if (descricaoExistente) {
        throw new BadRequestException(
          `Estado civil '${updateEstadoCivilDto.descricao}' já existe.`,
        );
      }
    }

    const estadoCivilAtualizado =
      await this.prisma.pessoasFisicasEstadoCivil.update({
        where: {
          id: BigInt(id),
          situacao: 1,
        },
        data: {
          descricao: updateEstadoCivilDto.descricao?.trim(),
          updatedAt: new Date(),
        },
      });

    return {
      id: estadoCivilAtualizado.id.toString(),
      descricao: estadoCivilAtualizado.descricao || '',
      situacao: estadoCivilAtualizado.situacao,
      motivo: estadoCivilAtualizado.motivo,
      createdAt: estadoCivilAtualizado.createdAt,
      updatedAt: estadoCivilAtualizado.updatedAt,
    };
  }

  async remove(
    deleteDto: DeletePessoasFisicasEstadosCivisDto,
  ): Promise<PessoasFisicasEstadosCivisResponseDto> {
    if (!deleteDto.id || deleteDto.id < 1) {
      throw new BadRequestException(
        'ID inválido para exclusão do estado civil.',
      );
    }

    // Verificar se o estado civil existe
    const estadoCivilExistente =
      await this.prisma.pessoasFisicasEstadoCivil.findUnique({
        where: {
          id: BigInt(deleteDto.id),
        },
      });

    if (!estadoCivilExistente) {
      throw new NotFoundException('Estado civil não encontrado.');
    }

    // Verifica se está ativo (situacao = 1)
    if (estadoCivilExistente.situacao !== 1) {
      throw new BadRequestException('Estado civil já está desativado.');
    }

    // Verificar se existem pessoas físicas usando este estado civil
    const pessoasUsandoEstadoCivil = await this.prisma.pessoasFisica.findFirst({
      where: {
        id_pessoa_estado_civil: BigInt(deleteDto.id),
      },
    });

    if (pessoasUsandoEstadoCivil) {
      throw new BadRequestException(
        'Não é possível excluir este estado civil pois existem pessoas físicas que o utilizam.',
      );
    }

    const estadoCivilRemovido =
      await this.prisma.pessoasFisicasEstadoCivil.update({
        where: {
          id: BigInt(deleteDto.id),
        },
        data: {
          situacao: 0,
          motivo: deleteDto.motivo,
          updatedAt: new Date(),
        },
      });

    return {
      id: estadoCivilRemovido.id.toString(),
      descricao: estadoCivilRemovido.descricao || '',
      situacao: estadoCivilRemovido.situacao,
      motivo: estadoCivilRemovido.motivo,
      createdAt: estadoCivilRemovido.createdAt,
      updatedAt: estadoCivilRemovido.updatedAt,
    };
  }
}
