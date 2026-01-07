import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DateUtils } from 'src/common/utils/date.utils';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePessoasFisicasGenerosDto,
  DeletePessoasFisicasGenerosDto,
  PessoasFisicasGenerosResponseDto,
  UpdatePessoasFisicasGenerosDto,
} from '../dto/pessoas-fisicas-generos.dto';

@Injectable()
export class PessoasFisicasGenerosService {
  constructor(
    private prisma: PrismaService,
    private dateUtils: DateUtils,
  ) {}

  async create(createGenerosDto: CreatePessoasFisicasGenerosDto[]) {
    const sucessos: any[] = [];
    const erros: any[] = [];
    const total = createGenerosDto.length;

    if (!createGenerosDto || createGenerosDto.length === 0) {
      throw new BadRequestException('Gêneros inválidos ou inexistentes.');
    }

    // Validação básica dos dados
    const resultadosValidacao = await Promise.allSettled(
      createGenerosDto.map(async (genero, index) => {
        // Validação se já existe um gênero com a mesma descrição ou gênero
        const existente = await this.prisma.pessoasFisicasGenero.findFirst({
          where: {
            OR: [
              { descricao: genero.descricao?.trim() },
              { genero: genero.genero?.trim() },
            ],
            situacao: 1,
          },
        });

        if (existente) {
          throw new Error(
            `Gênero '${genero.genero || genero.descricao}' já existe`,
          );
        }

        return {
          genero: genero.genero?.trim(),
          descricao: genero.descricao?.trim(),
          situacao: 1,
        };
      }),
    );

    const dadosValidos: any[] = [];

    resultadosValidacao.forEach((resultado, index) => {
      if (resultado.status === 'fulfilled') {
        sucessos.push({
          index,
          genero: resultado.value.descricao,
        });
        dadosValidos.push(resultado.value);
      } else {
        erros.push({
          index,
          descricao: createGenerosDto[index]?.descricao,
          erro: resultado.reason.message,
          genero: createGenerosDto[index],
        });
      }
    });

    if (dadosValidos.length === 0) {
      throw new BadRequestException({
        message: 'Nenhum gênero válido encontrado',
        erros,
        total,
        sucessos: sucessos.length,
        falhas: erros.length,
      });
    }

    try {
      const resultado = await this.prisma.pessoasFisicasGenero.createMany({
        data: dadosValidos,
      });

      return {
        message: 'Gêneros criados com sucesso',
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
        message: 'Erro ao criar gêneros',
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

  async findAll(): Promise<PessoasFisicasGenerosResponseDto[]> {
    const generos = await this.prisma.pessoasFisicasGenero.findMany({
      where: {
        situacao: 1,
      },
      orderBy: {
        descricao: 'asc',
      },
    });

    return generos.map((item) => ({
      id: item.id.toString(),
      genero: item.genero || '',
      descricao: item.descricao || '',
      situacao: item.situacao,
      motivo: item.motivo,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async findOne(id: number): Promise<PessoasFisicasGenerosResponseDto | null> {
    if (!id || id < 1) {
      throw new BadRequestException('ID inválido para buscar gênero.');
    }

    const genero = await this.prisma.pessoasFisicasGenero.findUnique({
      where: {
        id: BigInt(id),
        situacao: 1,
      },
    });

    if (!genero) {
      throw new NotFoundException('Gênero não encontrado.');
    }

    return {
      id: genero.id.toString(),
      genero: genero.genero || '',
      descricao: genero.descricao || '',
      situacao: genero.situacao,
      motivo: genero.motivo,
      createdAt: genero.createdAt,
      updatedAt: genero.updatedAt,
    };
  }

  async update(
    id: number,
    updateGeneroDto: UpdatePessoasFisicasGenerosDto,
  ): Promise<PessoasFisicasGenerosResponseDto> {
    if (!id || id < 1) {
      throw new BadRequestException('ID inválido para atualização do gênero.');
    }

    // Verificar se o gênero existe
    const generoExistente = await this.prisma.pessoasFisicasGenero.findUnique({
      where: {
        id: BigInt(id),
        situacao: 1,
      },
    });

    if (!generoExistente) {
      throw new NotFoundException('Gênero não encontrado.');
    }

    // Verificar se já existe outro gênero com a mesma descrição ou gênero
    if (updateGeneroDto.descricao || updateGeneroDto.genero) {
      const existente = await this.prisma.pessoasFisicasGenero.findFirst({
        where: {
          OR: [
            { descricao: updateGeneroDto.descricao?.trim() },
            { genero: updateGeneroDto.genero?.trim() },
          ],
          situacao: 1,
          id: {
            not: BigInt(id),
          },
        },
      });

      if (existente) {
        throw new BadRequestException(
          `Gênero '${updateGeneroDto.genero || updateGeneroDto.descricao}' já existe.`,
        );
      }
    }

    const generoAtualizado = await this.prisma.pessoasFisicasGenero.update({
      where: {
        id: BigInt(id),
        situacao: 1,
      },
      data: {
        genero: updateGeneroDto.genero?.trim(),
        descricao: updateGeneroDto.descricao?.trim(),
        updatedAt: new Date(),
      },
    });

    return {
      id: generoAtualizado.id.toString(),
      genero: generoAtualizado.genero || '',
      descricao: generoAtualizado.descricao || '',
      situacao: generoAtualizado.situacao,
      motivo: generoAtualizado.motivo,
      createdAt: generoAtualizado.createdAt,
      updatedAt: generoAtualizado.updatedAt,
    };
  }

  async remove(
    deleteDto: DeletePessoasFisicasGenerosDto,
  ): Promise<PessoasFisicasGenerosResponseDto> {
    if (!deleteDto.id || deleteDto.id < 1) {
      throw new BadRequestException('ID inválido para exclusão do gênero.');
    }

    // Verificar se o gênero existe
    const generoExistente = await this.prisma.pessoasFisicasGenero.findUnique({
      where: {
        id: BigInt(deleteDto.id),
      },
    });

    if (!generoExistente) {
      throw new NotFoundException('Gênero não encontrado.');
    }

    // Verifica se está ativo (situacao = 1)
    if (generoExistente.situacao !== 1) {
      throw new BadRequestException('Gênero já está desativado.');
    }

    // Verificar se existem pessoas físicas usando este gênero
    const pessoasUsandoGenero = await this.prisma.pessoasFisica.findFirst({
      where: {
        id_pessoa_genero: BigInt(deleteDto.id),
      },
    });

    if (pessoasUsandoGenero) {
      throw new BadRequestException(
        'Não é possível excluir este gênero pois existem pessoas físicas que o utilizam.',
      );
    }

    const generoRemovido = await this.prisma.pessoasFisicasGenero.update({
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
      id: generoRemovido.id.toString(),
      genero: generoRemovido.genero || '',
      descricao: generoRemovido.descricao || '',
      situacao: generoRemovido.situacao,
      motivo: generoRemovido.motivo,
      createdAt: generoRemovido.createdAt,
      updatedAt: generoRemovido.updatedAt,
    };
  }
}
