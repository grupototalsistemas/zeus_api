import { Injectable } from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
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
      console.log('Criando novo chamado:', dados);
      return this.prisma.chamado.create({
        data: {
          empresaId: BigInt(dados.empresaId),
          sistemaId: BigInt(dados.sistemaId),
          pessoaId: BigInt(dados.pessoaId),
          usuarioId: BigInt(dados.usuarioId),
          ocorrenciaId: BigInt(dados.ocorrenciaId),
          prioridadeId: BigInt(dados.prioridadeId),
          protocolo: dados.protocolo ? String(dados.protocolo) : undefined,
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

  async excluirChamado(id: bigint) {
    return this.prisma.chamado.delete({
      where: { id },
    });
  }

  // =================== OPERAÇÕES DE MOVIMENTO ===================

  async criarMovimento(dados: CreateMovimentoDto) {
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
    return this.prisma.chamadoMovimento.deleteMany({
      where: { chamadoId },
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

    // Deletar registros do banco
    return this.prisma.chamadoMovimentoAnexo.deleteMany({
      where: { movimentoId },
    });
  }

  async excluirAnexo(id: bigint) {
    // Buscar anexo para obter pathname
    const anexo = await this.obterAnexo(id);

    if (anexo?.pathname) {
      await this.blobStorageService.deleteFile(anexo.pathname);
    }

    return this.prisma.chamadoMovimentoAnexo.delete({
      where: { id },
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
    return this.prisma.chamadoMovimentoMensagem.deleteMany({
      where: { movimentoId },
    });
  }

  // =================== MÉTODOS PRINCIPAIS ===================

  async create(data: CreateChamadoDto) {
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

    // 2. Se houver movimento inicial, criar
    if (data.movimento) {
      // 2.1 Criar o movimento
      const movimento = await this.criarMovimento({
        chamadoId: Number(chamado.id),
        usuarioId: data.usuarioId,
        etapaId: data.movimento.etapaId,
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
    }

    // 3. Retornar chamado com todos os relacionamentos
    return this.buscarChamado(chamado.id);
  }

  async findAll(query: FindChamadosDto) {
    const { page = 1, limit = 10, startDate, endDate, ...filters } = query;
    const skip = (page - 1) * limit;

    // Construir where com os filtros
    const where = {
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

    return chamados;
  }

  async findOne(id: bigint) {
    return this.buscarChamado(id);
  }

  async update(id: bigint, data: UpdateChamadoDto) {
    const { movimento, ...chamadoData } = data;

    // 1. Atualizar dados básicos do chamado
    await this.atualizarChamado(id, chamadoData);

    // 2. Se houver novo movimento, criar
    if (movimento) {
      // 2.1 Criar o movimento
      const novoMovimento = await this.criarMovimento({
        chamadoId: Number(id),
        usuarioId: data.usuarioId!,
        etapaId: movimento.etapaId,
        ordem: movimento.ordem || 0,
        descricaoAcao: movimento.descricaoAcao,
        observacaoTec: movimento.observacaoTec || '',
        ativo: StatusRegistro.ATIVO,
      });

      // 2.2 Se houver anexos, criar
      if (movimento.anexos?.length) {
        await this.criarAnexos({
          movimentoId: Number(novoMovimento.id),
          anexos: movimento.anexos,
        });
      }

      // 2.3 Se houver mensagens, criar
      if (movimento.mensagens?.length) {
        await this.criarMensagens({
          movimentoId: Number(novoMovimento.id),
          mensagens: movimento.mensagens,
        });
      }
    }

    // 3. Retornar chamado atualizado
    return this.buscarChamado(id);
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
