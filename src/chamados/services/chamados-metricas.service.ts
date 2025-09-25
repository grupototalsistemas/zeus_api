// src/chamados/services/chamados-metricas.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChamadosMetricasService {
  constructor(private prisma: PrismaService) {}

  async getTempoMedioResolucao(
    empresaId: number,
    usuarioId?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const whereClause: any = {
      empresaId,
      createdAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
      movimentos: { some: { etapa: { descricao: 'CONCLUIDO' } } },
      ...(usuarioId && { usuarioId }),
    };

    const chamados = await this.prisma.chamado.findMany({
      where: whereClause,
      include: {
        movimentos: {
          where: { etapa: { descricao: 'CONCLUIDO' } },
          select: { createdAt: true },
        },
        prioridade: true,
        ocorrencia: true,
      },
    });

    const metricas = chamados.reduce(
      (acc, chamado) => {
        const conclusao = chamado.movimentos[0]?.createdAt;
        if (!conclusao) return acc;

        const tempoResolucao =
          conclusao.getTime() - chamado.createdAt.getTime();
        const dias = tempoResolucao / (1000 * 60 * 60 * 24);

        const prioridadeKey = chamado.prioridade.descricao;
        const ocorrenciaKey = chamado.ocorrencia.descricao;

        acc.porPrioridade[prioridadeKey] ??= { total: 0, count: 0 };
        acc.porOcorrencia[ocorrenciaKey] ??= { total: 0, count: 0 };

        acc.porPrioridade[prioridadeKey].total += dias;
        acc.porPrioridade[prioridadeKey].count += 1;
        acc.porOcorrencia[ocorrenciaKey].total += dias;
        acc.porOcorrencia[ocorrenciaKey].count += 1;
        acc.total += dias;
        acc.count += 1;

        return acc;
      },
      { porPrioridade: {}, porOcorrencia: {}, total: 0, count: 0 },
    );

    return {
      tempoMedioGeral: metricas.count > 0 ? metricas.total / metricas.count : 0,
      porPrioridade: Object.fromEntries(
        Object.entries(metricas.porPrioridade).map(([key, v]: any) => [
          key,
          v.total / v.count,
        ]),
      ),
      porOcorrencia: Object.fromEntries(
        Object.entries(metricas.porOcorrencia).map(([key, v]: any) => [
          key,
          v.total / v.count,
        ]),
      ),
    };
  }

  async getQuantidadePorStatus(
    empresaId: number,
    usuarioId?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const chamados = await this.prisma.chamado.findMany({
      where: {
        empresaId,
        ...(usuarioId && { usuarioId }),
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
      include: {
        movimentos: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { etapa: true },
        },
      },
    });

    return chamados.reduce((acc, chamado) => {
      const status = chamado.movimentos[0]?.etapa.descricao || 'NOVO';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }

  async getPerformancePorUsuario(
    empresaId: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const movimentos = await this.prisma.chamadoMovimento.findMany({
      where: {
        chamado: {
          empresaId,
          createdAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
      },
      include: { etapa: true },
    });

    return movimentos.reduce((acc, movimento) => {
      const usuarioId = movimento.usuarioId?.toString() ?? 'sem-usuario';
      acc[usuarioId] ??= { totalMovimentos: 0, porEtapa: {} };

      acc[usuarioId].totalMovimentos += 1;
      const etapa = movimento.etapa.descricao;
      acc[usuarioId].porEtapa[etapa] =
        (acc[usuarioId].porEtapa[etapa] || 0) + 1;

      return acc;
    }, {});
  }

  async getChamadosAbertos(
    empresaId: number,
    usuarioId?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.getQuantidadePorStatus(
      empresaId,
      usuarioId,
      startDate,
      endDate,
    ).then((status) => status['ABERTO'] || 0);
  }

  async getChamadosFechados(
    empresaId: number,
    usuarioId?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.getQuantidadePorStatus(
      empresaId,
      usuarioId,
      startDate,
      endDate,
    ).then((status) => status['CONCLUIDO'] || 0);
  }

  async getSlaCumprido(
    empresaId: number,
    usuarioId?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const chamados = await this.prisma.chamado.findMany({
      where: {
        empresaId,
        ...(usuarioId && { usuarioId }),
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
      include: {
        movimentos: {
          where: { etapa: { descricao: 'CONCLUIDO' } },
          select: { createdAt: true },
        },
        prioridade: true,
      },
    });

    let cumpridos = 0;
    let total = 0;

    for (const chamado of chamados) {
      const conclusao = chamado.movimentos[0]?.createdAt;
      if (!conclusao) continue;

      total++;
      const tempo =
        (conclusao.getTime() - chamado.createdAt.getTime()) / (1000 * 60 * 60);
      // exemplo: SLA = prioridade.horasMax
      if (tempo <= chamado.prioridade.tempo) cumpridos++;
    }

    return {
      percentual: total > 0 ? (cumpridos / total) * 100 : 0,
      cumpridos,
      total,
    };
  }
}
