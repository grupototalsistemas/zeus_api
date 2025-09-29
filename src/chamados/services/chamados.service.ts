import { BadRequestException, Injectable } from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
import { EventsGateway } from 'src/events/events.gateway';
import { BlobStorageService } from '../../common/services/blob-storage.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateChamadoDto } from '../dto/create-chamado.dto';
import { CreateMovimentoDto } from '../dto/create-movimento.dto';
import { FindChamadosDto } from '../dto/find-chamados.dto';
import { UpdateChamadoDto } from '../dto/update-chamado.dto';

@Injectable()
export class ChamadosService {
  constructor(
    private prisma: PrismaService,
    private blobStorageService: BlobStorageService,
    private eventsGateway: EventsGateway,
  ) {}

  // =================== OPERAÇÕES DE CHAMADO ===================

  async criarChamado(dados: {
    empresaId: number;
    sistemaId: number;
    pessoaId: number;
    usuarioId: number;
    ocorrenciaId: number;
    prioridadeId: number;
    protocolo?: string | null;
    titulo: string;
    descricao: string;
    observacao: string;
    ativo?: StatusRegistro;
  }) {
    const chamado = await this.prisma.chamado.findFirst({
      where: {
        empresaId: dados.empresaId,
        sistemaId: dados.sistemaId,
        pessoaId: dados.pessoaId,
        protocolo: dados.protocolo,
      },
    });

    if (chamado) {
      return this.prisma.chamado.update({
        where: { id: chamado.id },
        data: {
          ...dados,
          ativo: dados.ativo || StatusRegistro.ATIVO,
        },
      });
    } else {
      // console.log('Criando novo chamado:', dados);
      return this.prisma.chamado.create({
        data: {
          empresaId: BigInt(dados.empresaId),
          sistemaId: BigInt(dados.sistemaId),
          pessoaId: BigInt(dados.pessoaId),
          usuarioId: BigInt(dados.usuarioId),
          ocorrenciaId: BigInt(dados.ocorrenciaId),
          prioridadeId: BigInt(dados.prioridadeId),
          protocolo: dados.protocolo
            ? String(dados.protocolo)
            : new Date().getTime().toString(),
          titulo: dados.titulo,
          descricao: dados.descricao,
          observacao: dados.observacao,
          ativo: dados.ativo || StatusRegistro.ATIVO,
        },
      });
    }
  }

  async buscarChamado(id: bigint) {
    return this.prisma.chamado.findUnique({
      where: { id },
      include: {
        empresa: true,
        sistema: true,
        ocorrencia: true,
        prioridade: true,
        movimentos: {
          include: {
            etapa: true,
            anexos: true,
            mensagens: true,
          },
        },
      },
    });
  }

  async buscarChamadoPorProtocolo(protocolo: string) {
    return this.prisma.chamado.findFirst({
      where: { protocolo },
      include: {
        empresa: true,
        sistema: true,
        ocorrencia: true,
        prioridade: true,
        movimentos: {
          include: {
            etapa: true,
            anexos: true,
            mensagens: true,
          },
        },
      },
    });
  }

  async atualizarChamado(
    id: bigint,
    dados: {
      empresaId?: number;
      sistemaId?: number;
      pessoaId?: number;
      usuarioId?: number;
      ocorrenciaId?: number;
      prioridadeId?: number;
      titulo?: string;
      descricao?: string;
      observacao?: string;
      protocolo?: string;
      ativo?: StatusRegistro;
    },
  ) {
    return this.prisma.chamado.update({
      where: { id },
      data: {
        ...(dados.empresaId && {
          empresa: { connect: { id: BigInt(dados.empresaId) } },
        }),
        ...(dados.sistemaId && {
          sistema: { connect: { id: BigInt(dados.sistemaId) } },
        }),
        ...(dados.pessoaId && {
          pessoaId: BigInt(dados.pessoaId),
        }),
        ...(dados.usuarioId && {
          usuarioId: BigInt(dados.usuarioId),
        }),
        ...(dados.ocorrenciaId && {
          ocorrencia: { connect: { id: BigInt(dados.ocorrenciaId) } },
        }),
        ...(dados.prioridadeId && {
          prioridade: { connect: { id: BigInt(dados.prioridadeId) } },
        }),
        ...(dados.titulo && { titulo: dados.titulo }),
        ...(dados.descricao && { descricao: dados.descricao }),
        ...(dados.observacao && { observacao: dados.observacao }),
        ...(dados.protocolo && { protocolo: dados.protocolo }),
        ...(dados.ativo && { ativo: dados.ativo }),
      },
    });
  }

  // exclusão logica
  async excluirChamado(id: bigint) {
    return this.prisma.chamado.update({
      where: { id },
      data: { ativo: StatusRegistro.INATIVO },
    });
  }

  // =================== OPERAÇÕES DE MOVIMENTO ===================

  async criarMovimento(dados: CreateMovimentoDto) {
    console.log('Criando movimento:', dados);
    return this.prisma.chamadoMovimento.create({
      data: {
        ...(() => {
          const { anexos, ...rest } = dados as any;
          return rest;
        })(),
        ativo: StatusRegistro.ATIVO,
      },
    });
  }

  async excluirMovimentos(chamadoId: number) {
    return this.prisma.chamadoMovimento.updateMany({
      where: { chamadoId },
      data: { ativo: StatusRegistro.INATIVO },
    });
  }

  // =================== OPERAÇÕES DE ANEXO ===================

  async criarAnexos(dados: {
    movimentoId: number;
    anexos: {
      usuarioId: number;
      descricao: string;
      url: string;
      pathname: string;
      nomeOriginal: string;
      mimeType: string;
      tamanho: number;
    }[];
  }) {
    return this.prisma.chamadoMovimentoAnexo.createMany({
      data: dados.anexos.map((anexo) => ({
        movimentoId: dados.movimentoId,
        usuarioId: anexo.usuarioId,
        descricao: anexo.descricao,
        url: anexo.url,
        pathname: anexo.pathname,
        nomeOriginal: anexo.nomeOriginal,
        mimeType: anexo.mimeType,
        tamanho: anexo.tamanho,
        dataHora: new Date(),
        ativo: StatusRegistro.ATIVO,
      })),
    });
  }

  async obterAnexo(id: bigint) {
    return this.prisma.chamadoMovimentoAnexo.findUnique({
      where: { id },
    });
  }

  async listarAnexos(movimentoId: number) {
    return this.prisma.chamadoMovimentoAnexo.findMany({
      where: {
        movimentoId,
        ativo: StatusRegistro.ATIVO,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async excluirAnexos(movimentoId: number) {
    // Buscar anexos para deletar do blob storage
    const anexos = await this.prisma.chamadoMovimentoAnexo.findMany({
      where: { movimentoId },
    });

    // Deletar arquivos do blob storage
    for (const anexo of anexos) {
      if (anexo.pathname) {
        await this.blobStorageService.deleteFile(anexo.pathname);
      }
    }

    // Deletar logicamente os registros do banco
    return this.prisma.chamadoMovimentoAnexo.updateMany({
      where: { movimentoId },
      data: { ativo: StatusRegistro.INATIVO },
    });
  }

  async excluirAnexo(id: bigint) {
    // Buscar anexo para obter pathname
    const anexo = await this.obterAnexo(id);

    if (anexo?.pathname) {
      await this.blobStorageService.deleteFile(anexo.pathname);
    }

    return this.prisma.chamadoMovimentoAnexo.update({
      where: { id },
      data: { ativo: StatusRegistro.INATIVO },
    });
  }

  // =================== OPERAÇÕES DE MENSAGEM ===================

  async criarMensagens(dados: {
    movimentoId: number;
    mensagens: {
      usuarioEnvioId: number;
      usuarioLeituraId: number;
      descricao: string;
    }[];
  }) {
    return this.prisma.chamadoMovimentoMensagem.createMany({
      data: dados.mensagens.map((msg) => ({
        movimentoId: dados.movimentoId,
        usuarioEnvioId: msg.usuarioEnvioId,
        usuarioLeituraId: msg.usuarioLeituraId,
        descricao: msg.descricao,
        ativo: StatusRegistro.ATIVO,
      })),
    });
  }

  async excluirMensagens(movimentoId: number) {
    return this.prisma.chamadoMovimentoMensagem.updateMany({
      where: { movimentoId },
      data: { ativo: StatusRegistro.INATIVO },
    });
  }

  // =================== MÉTODOS PRINCIPAIS ===================

  async create(data: CreateChamadoDto) {
    // Antes de criar o chamado informa ao usuario que é necessário criar etapa inicial de movimento
    const etapa = await this.prisma.chamadoMovimentoEtapa.findFirst({
      where: {
        empresaId: data.empresaId,
        ativo: StatusRegistro.ATIVO,
      },
    });
    let id_etapa = etapa?.id || 0;
    // Caso não tenha etapa de movimento, cria
    if (!etapa) {
      const etapa = await this.prisma.chamadoMovimentoEtapa.create({
        data: {
          empresaId: data.empresaId,
          descricao: 'ABERTO',
          ativo: StatusRegistro.ATIVO,
        },
      });
      id_etapa = Number(etapa.id);
    }

    // 1. Criar o chamado
    const chamado = await this.criarChamado({
      empresaId: data.empresaId,
      sistemaId: data.sistemaId,
      pessoaId: data.pessoaId,
      usuarioId: data.usuarioId,
      ocorrenciaId: data.ocorrenciaId,
      prioridadeId: data.prioridadeId,
      protocolo: data.protocolo,
      titulo: data.titulo,
      descricao: data.descricao,
      observacao: data.observacao || '',
    });

    // 2. Se houver movimento inicial, criar com base no repassado. Se não, cria com etapa aberta
    if (data.movimento) {
      // 2.1 Criar o movimento
      const movimento = await this.criarMovimento({
        chamadoId: Number(chamado.id),
        usuarioId: data.usuarioId,
        etapaId: Number(id_etapa),
        ordem: data.movimento.ordem || 0,
        descricaoAcao: data.movimento.descricaoAcao,
        observacaoTec: data.movimento.observacaoTec || '',
        ativo: StatusRegistro.ATIVO,
      });

      // 2.2 Se houver anexos, criar
      if (data.movimento.anexos?.length) {
        await this.criarAnexos({
          movimentoId: Number(movimento.id),
          anexos: data.movimento.anexos,
        });
      }

      // 2.3 Se houver mensagens, criar
      if (data.movimento.mensagens?.length) {
        await this.criarMensagens({
          movimentoId: Number(movimento.id),
          mensagens: data.movimento.mensagens,
        });
      }
    } else {
      // 2.1 Criar o movimento
      await this.criarMovimento({
        chamadoId: Number(chamado.id),
        usuarioId: data.usuarioId,
        etapaId: Number(id_etapa),
        ordem: 0,
        descricaoAcao: '',
        observacaoTec: '',
        ativo: StatusRegistro.ATIVO,
      });
    }

    // 3. Retornar chamado com todos os relacionamentos
    return this.buscarChamado(chamado.id);
  }

  async findAll(query: FindChamadosDto) {
    const { page = 1, limit = 10, startDate, endDate, ...filters } = query;
    const skip = (page - 1) * limit;

    // Construir where com os filtros
    const where = {
      ...{ ativo: StatusRegistro.ATIVO },
      ...(filters.empresaId && { empresaId: filters.empresaId }),
      ...(filters.sistemaId && { sistemaId: filters.sistemaId }),
      ...(filters.pessoaId && { pessoaId: filters.pessoaId }),
      ...(filters.usuarioId && { usuarioId: filters.usuarioId }),
      ...(filters.ocorrenciaId && { ocorrenciaId: filters.ocorrenciaId }),
      ...(filters.prioridadeId && { prioridadeId: filters.prioridadeId }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }),
    };

    // Buscar chamados com paginação
    const [chamados, total] = await Promise.all([
      this.prisma.chamado.findMany({
        where,
        include: {
          empresa: true,
          sistema: true,
          ocorrencia: true,
          prioridade: true,
          movimentos: {
            include: {
              etapa: true,
              anexos: true,
              mensagens: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.chamado.count({ where }),
    ]);

    this.eventsGateway.server.emit('chamados', { total });
    return chamados;
  }

  async findOne(id: bigint) {
    return this.buscarChamado(id);
  }

  async update(id: bigint, data: UpdateChamadoDto) {
    console.log('parte a ser atualizada: ', data);
    const { movimento, ...chamadoData } = data;

    // 1. Buscar chamado atual (antes de atualizar)
    const oldChamado = await this.buscarChamado(id);

    // 2. Atualizar dados básicos do chamado
    await this.atualizarChamado(id, chamadoData);

    // 3. Se vier movimento do chamado cria ele com base no movimento passado
    if (movimento) {
      // Criar o movimento
      console.log('Criando movimento com base no update: ', movimento);
      const novoMovimento = await this.criarMovimento({
        chamadoId: Number(id),
        usuarioId: data.usuarioId!,
        etapaId: movimento.etapaId,
        ordem: movimento.ordem || 0,
        descricaoAcao: movimento.descricaoAcao,
        observacaoTec: movimento.observacaoTec || '',
        ativo: StatusRegistro.ATIVO,
      });

      // Criar anexos (se houver)
      if (movimento.anexos?.length) {
        await this.criarAnexos({
          movimentoId: Number(novoMovimento.id),
          anexos: movimento.anexos,
        });
      }

      // Criar mensagens (se houver)
      if (movimento.mensagens?.length) {
        await this.criarMensagens({
          movimentoId: Number(novoMovimento.id),
          mensagens: movimento.mensagens,
        });
      }
    } else {
      // 3. Se não vier movimento no chamado, cria com base na atualização do chamado
      const descricao = this.verificaQualFoiAAtualizacaoDoChamado(
        oldChamado,
        chamadoData,
      );
      console.log('Descrição da atualização: ', descricao);
      const verificaEtapaExist =
        await this.prisma.chamadoMovimentoEtapa.findFirst({
          where: {
            empresaId: data.empresaId,
            descricao: descricao,
            ativo: StatusRegistro.ATIVO,
          },
        });

      if (!verificaEtapaExist) {
        console.log('Criando nova etapa de movimento: ', descricao);
        // Criar nova etapa de movimento
        const etapa = await this.prisma.chamadoMovimentoEtapa.create({
          data: {
            empresaId: id,
            descricao: descricao,
            ativo: StatusRegistro.ATIVO,
          },
        });
        if (etapa) {
          console.log('Etapa criada com sucesso: ', etapa);
          await this.criarMovimento({
            chamadoId: Number(id),
            usuarioId: data.usuarioId!,
            etapaId: Number(etapa.id),
            ordem: 0,
            descricaoAcao: descricao,
            observacaoTec: '',
            ativo: StatusRegistro.ATIVO,
          });
        } else {
          throw new BadRequestException('Erro ao criar etapa');
        }
      } else {
        console.log('Etapa já existe: ', verificaEtapaExist);
        await this.criarMovimento({
          chamadoId: Number(id),
          usuarioId: data.usuarioId!,
          etapaId: Number(verificaEtapaExist.id),
          ordem: 0,
          descricaoAcao: descricao,
          observacaoTec: '',
          ativo: StatusRegistro.ATIVO,
        });
      }
    }

    // 4. Retornar chamado atualizado
    return this.buscarChamado(id);
  }

  async concluirChamado(id: bigint) {
    // 1. verificar se o chamado existe e se ele nao esta concluido
    const chamado = await this.buscarChamado(id);
    if (!chamado) {
      throw new BadRequestException('Chamado nao encontrado');
    }
    if (chamado.ativo === StatusRegistro.INATIVO) {
      throw new BadRequestException('Chamado ja concluido');
    }
    // 2. Verifica se existe etapa de conclusao de movimento
    const etapa = await this.prisma.chamadoMovimentoEtapa.findFirst({
      where: {
        empresaId: chamado.empresaId,
        descricao: 'CONCLUIDO',
        ativo: StatusRegistro.ATIVO,
      },
    });

    let id_etapa = etapa?.id || 0;
    // 3. Se não tiver, cria etapa de movimento com base na etapa de conclusao
    if (!etapa) {
      const etapa = await this.prisma.chamadoMovimentoEtapa.create({
        data: {
          empresaId: chamado.empresaId,
          descricao: 'CONCLUIDO',
          ativo: StatusRegistro.ATIVO,
        },
      });
      id_etapa = Number(etapa.id);
    }

    // 4. Altera o chamado para inativo e com base na etapa de conclusao
    return this.prisma.chamado.update({
      where: { id },
      data: {
        ativo: StatusRegistro.INATIVO,
        movimentos: {
          create: {
            ativo: StatusRegistro.INATIVO,
            usuarioId: Number(chamado.usuarioId),
            etapaId: Number(id_etapa),
            ordem: 0,
            descricaoAcao: 'CONCLUIDO',
            observacaoTec: '',
          },
        },
      },
    });
  }

  verificaQualFoiAAtualizacaoDoChamado(
    oldChamado: any,
    chamadoData: any,
  ): string {
    const alteracoes: string[] = [];

    if (chamadoData.titulo && chamadoData.titulo !== oldChamado.titulo) {
      alteracoes.push('título');
    }
    if (
      chamadoData.descricao &&
      chamadoData.descricao !== oldChamado.descricao
    ) {
      alteracoes.push('descrição');
    }
    if (
      chamadoData.observacao &&
      chamadoData.observacao !== oldChamado.observacao
    ) {
      alteracoes.push('observação');
    }
    if (
      chamadoData.usuarioId &&
      chamadoData.usuarioId !== Number(oldChamado.usuarioId)
    ) {
      alteracoes.push('responsável');
    }
    if (
      chamadoData.prioridadeId &&
      chamadoData.prioridadeId !== Number(oldChamado.prioridadeId)
    ) {
      alteracoes.push('prioridade');
    }
    if (
      chamadoData.ocorrenciaId &&
      chamadoData.ocorrenciaId !== Number(oldChamado.ocorrenciaId)
    ) {
      alteracoes.push('ocorrência');
    }
    if (
      chamadoData.sistemaId &&
      chamadoData.sistemaId !== Number(oldChamado.sistemaId)
    ) {
      alteracoes.push('sistema');
    }
    if (
      chamadoData.empresaId &&
      chamadoData.empresaId !== Number(oldChamado.empresaId)
    ) {
      alteracoes.push('empresa');
    }

    if (alteracoes.length === 0) return 'nenhum campo';

    if (alteracoes.length === 1) return alteracoes[0];

    const ultima = alteracoes.pop();
    return `${alteracoes.join(', ')} e ${ultima}`;
  }

  async remove(id: bigint) {
    // 1. Buscar todos os movimentos do chamado
    const movimentos = await this.prisma.chamadoMovimento.findMany({
      where: { chamadoId: Number(id) },
    });

    // 2. Para cada movimento, excluir anexos e mensagens
    for (const movimento of movimentos) {
      await this.excluirAnexos(Number(movimento.id));
      await this.excluirMensagens(Number(movimento.id));
    }

    // 3. Excluir todos os movimentos
    await this.excluirMovimentos(Number(id));

    // 4. Excluir o chamado
    return this.excluirChamado(id);
  }
}
