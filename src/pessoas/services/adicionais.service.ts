import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DateUtils } from 'src/common/utils/date.utils';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePessoasDadosAdicionaisTipoDto,
  DeletePessoasDadosAdicionaisTipoDto,
  PessoasDadosAdicionaisTipoResponseDto,
  UpdatePessoasDadosAdicionaisTipoDto,
} from '../dto/pessoa-dados-adicionais-tipo.dto';

@Injectable()
export class FuncionariosAdicionaisTiposService {
  constructor(
    private prisma: PrismaService,
    private dateUtils: DateUtils,
  ) {}

  async create(
    createFuncionariosAdicionaisTiposDto: CreatePessoasDadosAdicionaisTipoDto[],
  ) {
    const sucessos: any[] = [];
    const erros: any[] = [];
    const total = createFuncionariosAdicionaisTiposDto.length;

    if (
      !createFuncionariosAdicionaisTiposDto ||
      createFuncionariosAdicionaisTiposDto.length === 0
    ) {
      throw new BadRequestException(
        'Dados adicionais inválidos ou inexistentes.',
      );
    }

    const resultadosValidacao = await Promise.allSettled(
      createFuncionariosAdicionaisTiposDto.map(async (adicional, index) => {
        if (adicional.id_pessoa === -1) {
          throw new Error(`ID de pessoa inválido: ${adicional.id_pessoa}`);
        }

        const pessoa = await this.prisma.pessoas.findUnique({
          where: {
            id: adicional.id_pessoa,
          },
        });

        if (!pessoa) {
          throw new Error(
            `Pessoa com ID ${adicional.id_pessoa} não encontrada`,
          );
        }

        return { pessoa, adicional, index };
      }),
    );

    const dadosValidos: CreatePessoasDadosAdicionaisTipoDto[] = [];

    resultadosValidacao.forEach((resultado, index) => {
      if (resultado.status === 'fulfilled') {
        sucessos.push({
          index,
          id_pessoa: resultado.value.adicional.id_pessoa,
          pessoa: resultado.value.pessoa,
          adicional: resultado.value.adicional,
        });
        dadosValidos.push(resultado.value.adicional);
      } else {
        erros.push({
          index,
          id_pessoa: createFuncionariosAdicionaisTiposDto[index]?.id_pessoa,
          erro: resultado.reason.message,
          adicional: createFuncionariosAdicionaisTiposDto[index],
        });
      }
    });

    if (dadosValidos.length === 0) {
      throw new BadRequestException({
        message: 'Nenhuma pessoa válida encontrada',
        erros,
        total,
        sucessos: sucessos.length,
        falhas: erros.length,
      });
    }

    try {
      const resultado = await this.prisma.pessoasDadosAdicionaisTipo.createMany(
        {
          data: dadosValidos,
        },
      );

      return {
        message: 'Processamento concluído',
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
        message: 'Erro ao criar dados adicionais',
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

  async findAll(id_pessoa?: number) {
    let adicionaisTipos: PessoasDadosAdicionaisTipoResponseDto[] = [];

    if (!id_pessoa || id_pessoa === -1) {
      throw new BadRequestException(
        'O ID da pessoa é obrigatório para listar os adicionais.',
      );
    }

    if (id_pessoa && id_pessoa !== -1) {
      const result = await this.prisma.pessoasDadosAdicionaisTipo.findMany({
        where: {
          id_pessoa: {
            in: [Number(id_pessoa), -1],
          },
          situacao: 1,
        },
      });

      adicionaisTipos = result.map((item) => ({
        ...item,
        id: Number(item.id),
        id_pessoa: Number(item.id_pessoa),
      }));

      return adicionaisTipos;
    }
  }

  async findOne(id: number) {
    if (!id || id < 1) {
      throw new BadRequestException('ID inválido para buscar adicional.');
    }

    let adicional: any = null;
    if (id) {
      adicional = await this.prisma.pessoasDadosAdicionaisTipo.findUnique({
        where: { id: Number(id), situacao: 1 },
      });
    }
    return adicional;
  }

  async update(
    id: number,
    id_pessoa: number,
    updateAdicionaisTiposDto: UpdatePessoasDadosAdicionaisTipoDto,
  ) {
    if (id_pessoa && id_pessoa > 0) {
      let updateResponse = await this.prisma.pessoasDadosAdicionaisTipo.update({
        where: {
          id: Number(id),
          id_pessoa: id_pessoa,
          situacao: 1,
        },
        data: {
          descricao: updateAdicionaisTiposDto.descricao,
        },
      });

      return {
        updateResponse,
      };
    } else {
      throw new BadRequestException(
        'ID da pessoa inválido para atualização de adicional.',
      );
    }
  }

  async remove(deleteDto: DeletePessoasDadosAdicionaisTipoDto) {
    // Busca o registro para validação
    const adicional = await this.prisma.pessoasDadosAdicionaisTipo.findUnique({
      where: {
        id: Number(deleteDto.id),
      },
    });

    if (!adicional) {
      throw new NotFoundException('Tipo de dado adicional não encontrado');
    }

    // Verifica se está ativo (situacao = 1)
    if (adicional.situacao !== 1) {
      throw new BadRequestException(
        'Tipo de dado adicional já está desativado',
      );
    }

    // Verifica se não é registro global (id_pessoa = -1)
    if (Number(adicional.id_pessoa) === -1) {
      throw new BadRequestException(
        'Nao e permitido remover registros globais (pessoa = -1)',
      );
    }

    // Verifica se o id_pessoa corresponde ao informado
    if (Number(adicional.id_pessoa) !== Number(deleteDto.id_pessoa)) {
      throw new BadRequestException('ID da pessoa não corresponde ao registro');
    }

    const response = await this.prisma.pessoasDadosAdicionaisTipo.update({
      where: {
        id: Number(deleteDto.id),
      },
      data: {
        situacao: 0,
        motivo: deleteDto.motivo,
        updatedAt: new Date(),
      },
    });
    return response;
  }
}
