import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChamadosWorkflowService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retorna as próximas etapas possíveis para um chamado
   */
  async getProximasEtapas(chamadoId: bigint) {
    const chamado = await this.prisma.chamado.findUnique({
      where: { id: chamadoId },
      include: {
        movimentos: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { etapa: true },
        },
      },
    });

    if (!chamado) return [];

    const etapaAtual = chamado.movimentos[0]?.etapa.descricao;

    // Mapeamento de transições permitidas por etapa
    const transicoesPermitidas: Record<string, string[]> = {
      NOVO: ['EM_ANALISE', 'CANCELADO'],
      EM_ANALISE: [
        'EM_DESENVOLVIMENTO',
        'AGUARDANDO_CLIENTE',
        'AGUARDANDO_TERCEIROS',
        'CANCELADO',
      ],
      EM_DESENVOLVIMENTO: ['EM_TESTE', 'AGUARDANDO_CLIENTE', 'CANCELADO'],
      EM_TESTE: ['CONCLUIDO', 'EM_DESENVOLVIMENTO', 'CANCELADO'],
      AGUARDANDO_CLIENTE: [
        'EM_ANALISE',
        'EM_DESENVOLVIMENTO',
        'CONCLUIDO',
        'CANCELADO',
      ],
      AGUARDANDO_TERCEIROS: [
        'EM_ANALISE',
        'EM_DESENVOLVIMENTO',
        'CONCLUIDO',
        'CANCELADO',
      ],
      CONCLUIDO: [],
      CANCELADO: [],
    };

    const proximasEtapas = transicoesPermitidas[etapaAtual || 'NOVO'] || [];

    return this.prisma.chamadoMovimentoEtapa.findMany({
      where: {
        descricao: {
          in: proximasEtapas,
        },
      },
    });
  }

  /**
   * Verifica se um chamado está atrasado com base na prioridade
   */
  async verificarAtraso(chamadoId: bigint) {
    const chamado = await this.prisma.chamado.findUnique({
      where: { id: chamadoId },
      include: {
        prioridade: true,
        movimentos: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { etapa: true },
        },
      },
    });

    if (!chamado) return null;

    const ultimoMovimento = chamado.movimentos[0];
    if (!ultimoMovimento) return null;

    // Se já está concluído ou cancelado, não está atrasado
    if (['CONCLUIDO', 'CANCELADO'].includes(ultimoMovimento.etapa.descricao)) {
      return {
        atrasado: false,
        diasAtraso: 0,
      };
    }

    const agora = new Date();
    const criacao = chamado.createdAt;
    const tempoResolucao = chamado.prioridade.tempo; // campo tempo_resolucao do banco

    const diasPassados = Math.floor(
      (agora.getTime() - criacao.getTime()) / (1000 * 60 * 60 * 24),
    );
    const diasPrevistos = Math.floor(
      tempoResolucao.getTime() / (1000 * 60 * 60 * 24),
    );

    return {
      atrasado: diasPassados > diasPrevistos,
      diasAtraso: Math.max(0, diasPassados - diasPrevistos),
    };
  }

  /**
   * Retorna sugestões de ações baseadas no histórico
   */
  async getSugestoes(chamadoId: bigint) {
    const chamado = await this.prisma.chamado.findUnique({
      where: { id: chamadoId },
      include: {
        ocorrencia: true,
        movimentos: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { etapa: true },
        },
      },
    });

    if (!chamado) return [];

    // Buscar chamados similares já resolvidos
    const chamadosSimilares = await this.prisma.chamado.findMany({
      where: {
        ocorrenciaId: chamado.ocorrenciaId,
        movimentos: {
          some: {
            etapa: {
              descricao: 'CONCLUIDO',
            },
          },
        },
      },
      include: {
        movimentos: {
          include: {
            etapa: true,
          },
        },
      },
      take: 5,
    });

    // Analisar padrões de resolução
    const sugestoes = chamadosSimilares.map((similar) => {
      const movimentos = similar.movimentos.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );

      return {
        chamadoId: similar.id,
        fluxo: movimentos.map((m) => m.etapa.descricao),
        tempoResolucao: Math.floor(
          (movimentos[movimentos.length - 1].createdAt.getTime() -
            similar.createdAt.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      };
    });

    return sugestoes;
  }

  /**
   * Retorna a equipe mais apropriada para atender o chamado
   */
  //   async getEquipeRecomendada(chamadoId: bigint) {
  //     const chamado = await this.prisma.chamado.findUnique({
  //       where: { id: chamadoId },
  //       include: {
  //         ocorrencia: true,
  //         sistema: true,
  //       },
  //     });

  //     if (!chamado) return null;

  //     // Buscar usuários com experiência em chamados similares
  //     const especialistas = await this.prisma.pessoaUsuario.findMany({
  //       where: {
  //         Movimento: {
  //           some: {
  //             chamado: {
  //               ocorrenciaId: chamado.ocorrenciaId,
  //               sistemaId: chamado.sistemaId,
  //             },
  //           },
  //         },
  //       },
  //       include: {
  //         Movimento: {
  //           where: {
  //             chamado: {
  //               ocorrenciaId: chamado.ocorrenciaId,
  //               sistemaId: chamado.sistemaId,
  //             },
  //           },
  //           include: {
  //             etapa: true,
  //           },
  //         },
  //         pessoa: true,
  //       },
  //     });

  //     // Calcular score de cada especialista
  //     const scores = especialistas.map((usuario) => {
  //       const chamadosResolvidos = usuario.Movimento.filter(
  //         (m) => m.etapa.descricao === 'CONCLUIDO',
  //       ).length;

  //       const tempoMedioResolucao =
  //         usuario.Movimento.filter(
  //           (m) => m.etapa.descricao === 'CONCLUIDO',
  //         ).reduce(
  //           (acc, m) => acc + (m.fim!.getTime() - m.inicio!.getTime()),
  //           0,
  //         ) / chamadosResolvidos;

  //       return {
  //         usuario: {
  //           id: usuario.id,
  //           nome: usuario.pessoa.nome,
  //         },
  //         score: chamadosResolvidos * (1 / tempoMedioResolucao),
  //         chamadosResolvidos,
  //         tempoMedioResolucao: Math.floor(
  //           tempoMedioResolucao / (1000 * 60 * 60 * 24),
  //         ),
  //       };
  //     });

  //     return scores.sort((a, b) => b.score - a.score);
  //   }
}
