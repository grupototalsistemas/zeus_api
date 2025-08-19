import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChamadosRelatorioService {
  constructor(private prisma: PrismaService) {}

  /**
   * Gera relatório de desempenho por equipe/usuário
   */
  async getRelatorioDesempenho(
    empresaId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const chamados = await this.prisma.chamado.findMany({
      where: {
        empresaId,
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
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
        prioridade: true,
        ocorrencia: {
          include: {
            tipo: true,
          },
        },
      },
    });

    const desempenho = chamados.reduce(
      (acc, chamado) => {
        const movimentos = chamado.movimentos.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );

        const primeiroConcluido = movimentos.find(
          (m) => m.etapa.descricao === 'CONCLUIDO',
        );

        if (!primeiroConcluido) return acc;

        const tempoResolucao =
          primeiroConcluido.createdAt.getTime() - chamado.createdAt.getTime();
        const tempoEsperado = chamado.prioridade.tempo.getTime();

        const usuarioId = Number(chamado.usuarioId);
        if (!acc[usuarioId]) {
          acc[usuarioId] = {
            totalChamados: 0,
            chamadosNoPrazo: 0,
            chamadosAtrasados: 0,
            tempoMedioResolucao: 0,
            porPrioridade: {},
            porTipoOcorrencia: {},
          };
        }

        // Estatísticas gerais
        acc[usuarioId].totalChamados++;
        if (tempoResolucao <= tempoEsperado) {
          acc[usuarioId].chamadosNoPrazo++;
        } else {
          acc[usuarioId].chamadosAtrasados++;
        }
        acc[usuarioId].tempoMedioResolucao =
          (acc[usuarioId].tempoMedioResolucao *
            (acc[usuarioId].totalChamados - 1) +
            tempoResolucao) /
          acc[usuarioId].totalChamados;

        // Por prioridade
        const prioridadeKey = chamado.prioridade.descricao;
        if (!acc[usuarioId].porPrioridade[prioridadeKey]) {
          acc[usuarioId].porPrioridade[prioridadeKey] = {
            total: 0,
            noPrazo: 0,
            atrasados: 0,
          };
        }
        acc[usuarioId].porPrioridade[prioridadeKey].total++;
        if (tempoResolucao <= tempoEsperado) {
          acc[usuarioId].porPrioridade[prioridadeKey].noPrazo++;
        } else {
          acc[usuarioId].porPrioridade[prioridadeKey].atrasados++;
        }

        // Por tipo de ocorrência
        const tipoOcorrenciaKey = chamado.ocorrencia.tipo.descricao;
        if (!acc[usuarioId].porTipoOcorrencia[tipoOcorrenciaKey]) {
          acc[usuarioId].porTipoOcorrencia[tipoOcorrenciaKey] = {
            total: 0,
            noPrazo: 0,
            atrasados: 0,
          };
        }
        acc[usuarioId].porTipoOcorrencia[tipoOcorrenciaKey].total++;
        if (tempoResolucao <= tempoEsperado) {
          acc[usuarioId].porTipoOcorrencia[tipoOcorrenciaKey].noPrazo++;
        } else {
          acc[usuarioId].porTipoOcorrencia[tipoOcorrenciaKey].atrasados++;
        }

        return acc;
      },
      {} as Record<number, any>,
    );

    // Buscar informações dos usuários
    const usuarios = await this.prisma.pessoaUsuario.findMany({
      where: {
        id: {
          in: Object.keys(desempenho).map(Number),
        },
      },
      include: {
        pessoa: true,
        perfil: true,
      },
    });

    // Combinar dados
    return usuarios.map((usuario) => ({
      usuario: {
        id: usuario.id,
        nome: usuario.pessoa.nome,
        perfil: usuario.perfil.descricao,
      },
      ...desempenho[Number(usuario.id)],
      tempoMedioResolucaoDias: Math.floor(
        desempenho[Number(usuario.id)].tempoMedioResolucao /
          (1000 * 60 * 60 * 24),
      ),
    }));
  }

  /**
   * Gera relatório de tendências
   */
  async getRelatorioTendencias(empresaId: number, meses: number = 12) {
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - meses);

    const chamados = await this.prisma.chamado.findMany({
      where: {
        empresaId,
        createdAt: {
          gte: dataInicio,
        },
      },
      include: {
        movimentos: {
          include: {
            etapa: true,
          },
        },
        ocorrencia: {
          include: {
            tipo: true,
          },
        },
      },
    });

    // Agrupar por mês
    const tendencias = chamados.reduce(
      (acc, chamado) => {
        const mes = `${chamado.createdAt.getFullYear()}-${String(
          chamado.createdAt.getMonth() + 1,
        ).padStart(2, '0')}`;

        if (!acc[mes]) {
          acc[mes] = {
            total: 0,
            porStatus: {},
            porTipoOcorrencia: {},
          };
        }

        // Total de chamados
        acc[mes].total++;

        // Por status
        const ultimoMovimento = chamado.movimentos
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .shift();

        if (ultimoMovimento) {
          const status = ultimoMovimento.etapa.descricao;
          acc[mes].porStatus[status] = (acc[mes].porStatus[status] || 0) + 1;
        }

        // Por tipo de ocorrência
        const tipoOcorrencia = chamado.ocorrencia.tipo.descricao;
        acc[mes].porTipoOcorrencia[tipoOcorrencia] =
          (acc[mes].porTipoOcorrencia[tipoOcorrencia] || 0) + 1;

        return acc;
      },
      {} as Record<string, any>,
    );

    // Converter para array e ordenar por mês
    return Object.entries(tendencias)
      .map(([mes, dados]) => ({
        mes,
        ...dados,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }

  /**
   * Gera relatório de satisfação do cliente
   */
  //   async getRelatorioSatisfacao(empresaId: number) {
  //     const avaliacoes = await this.prisma.chamadoAvaliacao.findMany({
  //       where: {
  //         chamado: {
  //           empresaId,
  //         },
  //       },
  //       include: {
  //         chamado: {
  //           include: {
  //             prioridade: true,
  //             ocorrencia: {
  //               include: {
  //                 tipo: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     return {
  //       mediaGeral:
  //         avaliacoes.reduce((acc, av) => acc + av.nota, 0) / avaliacoes.length,
  //       porPrioridade: avaliacoes.reduce(
  //         (acc, av) => {
  //           const prioridade = av.chamado.prioridade.descricao;
  //           if (!acc[prioridade]) {
  //             acc[prioridade] = { total: 0, soma: 0 };
  //           }
  //           acc[prioridade].total++;
  //           acc[prioridade].soma += av.nota;
  //           acc[prioridade].media = acc[prioridade].soma / acc[prioridade].total;
  //           return acc;
  //         },
  //         {} as Record<string, any>,
  //       ),
  //       porTipoOcorrencia: avaliacoes.reduce(
  //         (acc, av) => {
  //           const tipo = av.chamado.ocorrencia.tipo.descricao;
  //           if (!acc[tipo]) {
  //             acc[tipo] = { total: 0, soma: 0 };
  //           }
  //           acc[tipo].total++;
  //           acc[tipo].soma += av.nota;
  //           acc[tipo].media = acc[tipo].soma / acc[tipo].total;
  //           return acc;
  //         },
  //         {} as Record<string, any>,
  //       ),
  //     };
  //   }
}
