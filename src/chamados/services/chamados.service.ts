import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { FileStorageService } from 'src/common/services/file-storage.service';
import { PLimitUtil } from 'src/common/utils/p-limit.util';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateChamadoComAnexoDto,
  CreateChamadoDto,
  UpdateChamadoDto,
} from '../dto/chamado.dto';
import { FindChamadosQueryDto } from '../dto/find-chamados-query.dto';

type MulterFile = Express.Multer.File;

export interface ErroDetalhes {
  index: number;
  dto: CreateChamadoDto;
  motivo: string;
}

export interface ResultadoCriacaoChamados {
  total: number;
  criados: number;
  erros: number;
  detalhesErros: ErroDetalhes[];
  chamadosCriados: any[];
}

@Injectable()
export class ChamadosService {
  constructor(
    private prisma: PrismaService,
    private fileStorage: FileStorageService,
  ) {}

  async create(
    createChamadoDto: CreateChamadoDto[],
  ): Promise<ResultadoCriacaoChamados> {
    const erros: ErroDetalhes[] = [];
    const sucessos: any[] = [];
    const total = createChamadoDto.length;

    if (!Array.isArray(createChamadoDto) || total === 0) {
      throw new BadRequestException(
        'O corpo da requisição deve ser um array de chamados e não pode estar vazio.',
      );
    }

    // limita o uso de conexoes simultaneas
    const limit = await PLimitUtil.create(50);

    // Valida todos os DTOs primeiro
    const validacoes = await Promise.all(
      createChamadoDto.map((dto, index) =>
        limit(async () => {
          const resultado = await this.verificaDados(dto);
          if (!resultado.valido) {
            erros.push({
              index,
              dto,
              motivo: resultado.mensagem || 'Dados inválidos',
            });
          }
          return resultado.valido;
        }),
      ),
    );

    // Cria os chamados que passaram na validação
    const chamadosProcessados = await Promise.all(
      createChamadoDto.map((dto, index) =>
        limit(async () => {
          if (!validacoes[index]) {
            return null;
          }

          try {
            // Usa transação para garantir que chamado e movimento sejam criados juntos
            const resultado = await this.prisma.$transaction(async (tx) => {
              const chamado = await tx.chamado.create({
                data: {
                  id_pessoa_juridica: BigInt(dto.id_pessoa_juridica),
                  id_sistema: BigInt(dto.id_sistema),
                  id_pessoa_fisica: BigInt(dto.id_pessoa_empresa),
                  id_pessoa_usuario: BigInt(dto.id_pessoa_usuario),
                  id_ocorrencia: BigInt(dto.id_ocorrencia),
                  id_prioridade: BigInt(dto.id_prioridade),
                  protocolo: dto.protocolo || this.gerarProtocolo(),
                  titulo: dto.titulo,
                  descricao: dto.descricao,
                  observacao: dto.observacao || '',
                  situacao: dto.situacao ?? 1,
                },
              });

              const movimento = await tx.chamadoMovimento.create({
                data: {
                  id_chamado: chamado.id,
                  id_chamado_movimento_etapa: BigInt(8), // etapa: ABERTO
                  id_pessoa_usuario: BigInt(dto.id_pessoa_usuario),
                  ordem: 1,
                  dataHoraInicio: new Date(),
                  descricaoAcao: 'Abertura do chamado',
                  observacaoTecnica: 'Abertura do chamado pelo sistema',
                },
              });

              return { chamado, movimento };
            });

            sucessos.push(resultado.chamado);
            return resultado.chamado;
          } catch (error: any) {
            erros.push({
              index,
              dto,
              motivo: `Erro ao criar chamado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            });
            return null;
          }
        }),
      ),
    );

    // Remove valores null do resultado
    const chamadosCriados = chamadosProcessados.filter(
      (chamado) => chamado !== null,
    );

    return {
      total,
      criados: sucessos.length,
      erros: erros.length,
      detalhesErros: erros,
      chamadosCriados,
    };
  }

  async createWithAttachment(
    createChamadoComAnexoDto: CreateChamadoComAnexoDto,
    file?: MulterFile,
  ) {
    // Usa transação para garantir que chamado, movimento e anexo sejam criados juntos
    const resultado = await this.prisma.$transaction(async (tx) => {
      // Cria o chamado
      // Valida dados do chamado usando o método reutilizável
      const validacao = await this.verificaDados(createChamadoComAnexoDto, tx);

      if (!validacao.valido) {
        throw new BadRequestException(validacao.mensagem);
      }

      const chamado = await tx.chamado.create({
        data: {
          id_pessoa_juridica: BigInt(
            createChamadoComAnexoDto.id_pessoa_juridica,
          ),
          id_sistema: BigInt(createChamadoComAnexoDto.id_sistema),
          id_pessoa_fisica: BigInt(createChamadoComAnexoDto.id_pessoa_empresa),
          id_pessoa_usuario: BigInt(createChamadoComAnexoDto.id_pessoa_usuario),
          id_ocorrencia: BigInt(createChamadoComAnexoDto.id_ocorrencia),
          id_prioridade: BigInt(createChamadoComAnexoDto.id_prioridade),
          protocolo:
            createChamadoComAnexoDto.protocolo || this.gerarProtocolo(),
          titulo: createChamadoComAnexoDto.titulo,
          descricao: createChamadoComAnexoDto.descricao,
          observacao: createChamadoComAnexoDto.observacao || '',
          situacao: createChamadoComAnexoDto.situacao ?? 1,
        },
      });

      // Cria o movimento inicial
      const movimento = await tx.chamadoMovimento.create({
        data: {
          id_chamado: chamado.id,
          id_chamado_movimento_etapa: BigInt(8), // etapa: ABERTO
          id_pessoa_usuario: BigInt(createChamadoComAnexoDto.id_pessoa_usuario),
          ordem: 1,
          dataHoraInicio: new Date(),
          descricaoAcao: 'Abertura do chamado',
          observacaoTecnica: 'Abertura do chamado pelo sistema',
        },
      });

      // Se houver arquivo, cria o anexo
      let anexo: any = null;
      if (file) {
        const caminho = await this.fileStorage.saveFile(file, 'anexos');

        anexo = await tx.chamadoMovimentoAnexo.create({
          data: {
            id_chamado_movimento: movimento.id,
            id_pessoa_usuario: BigInt(
              createChamadoComAnexoDto.id_pessoa_usuario,
            ),
            ordem: 1,
            descricao:
              createChamadoComAnexoDto.descricaoAnexo || 'Anexo do chamado',
            dataHora: new Date(),
            caminho,
            situacao: 1,
          },
          include: {
            movimento: true,
            usuario: true,
          },
        });
      }

      return {
        chamado,
        movimento,
        anexo,
      };
    });

    return resultado;
  }

  private gerarProtocolo(): string {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');
    const segundo = String(agora.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    return `${ano}${mes}${dia}${hora}${minuto}${segundo}${random}`;
  }

  private async verificaDados(
    createChamadoDto: CreateChamadoDto,
    tx?: any,
  ): Promise<{ valido: boolean; mensagem?: string }> {
    try {
      const prismaClient = tx || this.prisma;

      const [
        empresa,
        sistema,
        pessoaEmpresa,
        pessoaUsuario,
        ocorrencia,
        prioridade,
      ] = await Promise.all([
        prismaClient.pessoasJuridicas.findUnique({
          where: { id: BigInt(createChamadoDto.id_pessoa_juridica) },
        }),
        prismaClient.sistemas.findUnique({
          where: { id: BigInt(createChamadoDto.id_sistema) },
        }),
        prismaClient.pessoas.findUnique({
          where: { id: BigInt(createChamadoDto.id_pessoa_empresa) },
        }),
        prismaClient.pessoas.findUnique({
          where: { id: BigInt(createChamadoDto.id_pessoa_usuario) },
        }),
        prismaClient.ocorrencia.findUnique({
          where: { id: BigInt(createChamadoDto.id_ocorrencia) },
        }),
        prismaClient.prioridade.findUnique({
          where: { id: BigInt(createChamadoDto.id_prioridade) },
        }),
      ]);

      const camposInvalidos: string[] = [];

      if (!empresa) camposInvalidos.push('Empresa não encontrada');
      if (!sistema) camposInvalidos.push('Sistema não encontrado');
      if (!pessoaEmpresa) camposInvalidos.push('Pessoa empresa não encontrada');
      if (!pessoaUsuario) camposInvalidos.push('Usuário não encontrado');
      if (!ocorrencia) camposInvalidos.push('Ocorrência não encontrada');
      if (!prioridade) camposInvalidos.push('Prioridade não encontrada');

      if (camposInvalidos.length > 0) {
        return {
          valido: false,
          mensagem: camposInvalidos.join(', '),
        };
      }

      return { valido: true };
    } catch (error) {
      return {
        valido: false,
        mensagem: `Erro ao validar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }

  async findAll(query: FindChamadosQueryDto) {
    // Valores padrão
    const skip = query.skip ?? 0;
    const take = query.take ?? 10;
    const orderBy = query.orderBy ?? 'id';
    const orderDirection = query.orderDirection ?? 'desc';

    // Construir filtros dinâmicos
    const where: any = {
      situacao: query.situacao ?? 1,
    };

    // Filtros opcionais
    if (query.id_sistema) {
      where.id_sistema = BigInt(query.id_sistema);
    }

    if (query.id_pessoa_juridica) {
      where.id_pessoa_juridica = BigInt(query.id_pessoa_juridica);
    }

    if (query.id_prioridade) {
      where.id_prioridade = BigInt(query.id_prioridade);
    }

    if (query.id_pessoa_usuario) {
      where.id_pessoa_usuario = BigInt(query.id_pessoa_usuario);
    }

    // Busca por texto
    if (query.search) {
      where.OR = [
        { titulo: { contains: query.search, mode: 'insensitive' } },
        { descricao: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Construir ordenação dinamicamente
    const orderByObj: any = {};
    orderByObj[orderBy] = orderDirection;

    return this.prisma.chamado.findMany({
      where,
      include: {
        empresa: true,
        sistema: true,
        pessoaFisica: true,
        usuario: true,
        ocorrencia: true,
        prioridade: true,
        movimentos: {
          include: {
            etapa: true,
            mensagens: true,
          },
        },
      },
      skip,
      take,
      orderBy: orderByObj,
    });
  }

  async findOne(id: number) {
    const chamado = await this.prisma.chamado.findUnique({
      where: { id: BigInt(id) },
      include: {
        empresa: true,
        sistema: true,
        usuario: true,
        ocorrencia: true,
        prioridade: true,
        movimentos: {
          include: {
            etapa: true,
            usuario: true,
            anexos: true,
            mensagens: true,
          },
        },
      },
    });

    if (!chamado) {
      throw new NotFoundException(`Chamado com ID ${id} não encontrado`);
    }

    return chamado;
  }

  async update(id: number, updateChamadoDto: UpdateChamadoDto) {
    await this.findOne(id);

    return this.prisma.chamado.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateChamadoDto.id_pessoa_juridica && {
          id_pessoa_juridica: BigInt(updateChamadoDto.id_pessoa_juridica),
        }),
        ...(updateChamadoDto.id_sistema && {
          id_sistema: BigInt(updateChamadoDto.id_sistema),
        }),
        ...(updateChamadoDto.id_pessoa_empresa && {
          id_pessoa_empresa: BigInt(updateChamadoDto.id_pessoa_empresa),
        }),
        ...(updateChamadoDto.id_pessoa_usuario && {
          id_pessoa_usuario: BigInt(updateChamadoDto.id_pessoa_usuario),
        }),
        ...(updateChamadoDto.id_ocorrencia && {
          id_ocorrencia: BigInt(updateChamadoDto.id_ocorrencia),
        }),
        ...(updateChamadoDto.id_prioridade && {
          id_prioridade: BigInt(updateChamadoDto.id_prioridade),
        }),
        ...(updateChamadoDto.protocolo !== undefined && {
          protocolo: updateChamadoDto.protocolo,
        }),
        ...(updateChamadoDto.titulo && { titulo: updateChamadoDto.titulo }),
        ...(updateChamadoDto.descricao && {
          descricao: updateChamadoDto.descricao,
        }),
        ...(updateChamadoDto.observacao && {
          observacao: updateChamadoDto.observacao,
        }),
        ...(updateChamadoDto.situacao !== undefined && {
          situacao: updateChamadoDto.situacao,
        }),
        ...(updateChamadoDto.motivo && { motivo: updateChamadoDto.motivo }),
        updatedAt: new Date(),
      },
      include: {
        empresa: true,
        sistema: true,
        usuario: true,
        ocorrencia: true,
        prioridade: true,
      },
    });
  }

  async remove(id: number, motivo: string) {
    await this.findOne(id);

    return this.prisma.chamado.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo,
        updatedAt: new Date(),
      },
    });
  }

  async getMetricasEmpresa(
    id_pessoa_usuario: number,
    data_inicio?: string,
    data_fim?: string,
  ) {
    const totalChamados = await this.prisma.chamado.count({
      where: {
        situacao: 1,
        id_pessoa_usuario: BigInt(id_pessoa_usuario),
        ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
        ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
      },
    });
    console.log('Total de chamados:', totalChamados);

    const chamadosAbertos = await this.prisma.chamado.count({
      where: {
        situacao: 1,
        id_pessoa_usuario: BigInt(id_pessoa_usuario),
        ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
        ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
        movimentos: {
          none: {
            etapa: { id: 1 }, // etapa: CONCLUÍDO
          },
        },
      },
    });

    const chamadosFechados = totalChamados - chamadosAbertos;

    const chamadosPorSistema = await this.prisma.chamado.groupBy({
      by: ['id_sistema'],
      where: {
        situacao: 1,
        id_pessoa_usuario: BigInt(id_pessoa_usuario),
        ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
        ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
      },
      _count: { id: true },
    });

    const chamadosPorPrioridade = await this.prisma.chamado.groupBy({
      by: ['id_prioridade'],
      where: {
        situacao: 1,
        id_pessoa_usuario: BigInt(id_pessoa_usuario),
        ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
        ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
      },
      _count: { id: true },
    });

    // const tempoMedioResolucao = await this.prisma.chamado.aggregate({
    //   where: {
    //     situacao: 1,
    //     id_pessoa_juridica: BigInt(id_pessoa_juridica),
    //     ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
    //     ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
    //     movimentos: {
    //       some: {
    //         etapa: { id: 1 }, // etapa: CONCLUÍDO
    //       },
    //     },
    //   },
    //   _avg: {
    //     // calcula a média em horas entre a data de criação do chamado e a data do movimento de conclusão
    //   },
    // });

    const chamadosAbertosPorDia = await this.prisma.chamado.groupBy({
      by: ['createdAt'],
      where: {
        situacao: 1,
        id_pessoa_usuario: BigInt(id_pessoa_usuario),
        ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
        ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
        movimentos: {
          none: {
            etapa: { id: 1 }, // etapa: CONCLUÍDO
          },
        },
      },
      _count: { id: true },
    });

    const chamadosFechadosPorDia = await this.prisma.chamado.groupBy({
      by: ['createdAt'],
      where: {
        situacao: 1,
        id_pessoa_usuario: BigInt(id_pessoa_usuario),
        ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
        ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
        movimentos: {
          some: {
            etapa: { id: 1 }, // etapa: CONCLUÍDO
          },
        },
      },
      _count: { id: true },
    });

    const resultado = {
      totalChamados,
      chamadosAbertos,
      chamadosFechados,
      chamadosPorSistema,
      chamadosPorPrioridade,
      chamadosAbertosPorDia,
      chamadosFechadosPorDia,
    };

    return resultado;
  }

  async getMetricasUsuario(id_usuario: number) {
    const totalChamados = await this.prisma.chamado.count({
      where: {
        id_pessoa_usuario: BigInt(id_usuario),
      },
    });
  }
}
