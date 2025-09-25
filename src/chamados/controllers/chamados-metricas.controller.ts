// src/chamados/controllers/chamados-metricas.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetEmpresa } from '../../common/decorators/get-empresa.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FiltroMetricasDto } from '../dto/filtro-metricas.dto';
import { ChamadosMetricasService } from '../services/chamados-metricas.service';

@ApiTags('Chamados Métricas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chamados/metricas')
export class ChamadosMetricasController {
  constructor(private readonly metricasService: ChamadosMetricasService) {}

  @Get('tempo-medio')
  @ApiOperation({ summary: 'Tempo médio de resolução dos chamados' })
  @ApiResponse({
    status: 200,
    description: 'Tempo médio por prioridade, ocorrência e geral',
  })
  getTempoMedioResolucao(
    @GetEmpresa() empresaId: number,
    @Query() filtro: FiltroMetricasDto,
  ) {
    return this.metricasService.getTempoMedioResolucao(
      empresaId,
      filtro.usuarioId ? Number(filtro.usuarioId) : undefined,
      filtro.startDate ? new Date(filtro.startDate) : undefined,
      filtro.endDate ? new Date(filtro.endDate) : undefined,
    );
  }

  @Get('por-status')
  @ApiOperation({ summary: 'Quantidade de chamados por status' })
  getQuantidadePorStatus(
    @GetEmpresa() empresaId: number,
    @Query() filtro: FiltroMetricasDto,
  ) {
    return this.metricasService.getQuantidadePorStatus(
      empresaId,
      filtro.usuarioId ? Number(filtro.usuarioId) : undefined,
      filtro.startDate ? new Date(filtro.startDate) : undefined,
      filtro.endDate ? new Date(filtro.endDate) : undefined,
    );
  }

  @Get('performance')
  @ApiOperation({ summary: 'Performance por usuário (movimentos e etapas)' })
  getPerformancePorUsuario(
    @GetEmpresa() empresaId: number,
    @Query() filtro: FiltroMetricasDto,
  ) {
    return this.metricasService.getPerformancePorUsuario(
      empresaId,
      filtro.startDate ? new Date(filtro.startDate) : undefined,
      filtro.endDate ? new Date(filtro.endDate) : undefined,
    );
  }

  @Get('abertos')
  @ApiOperation({ summary: 'Quantidade de chamados abertos' })
  getChamadosAbertos(
    @GetEmpresa() empresaId: number,
    @Query() filtro: FiltroMetricasDto,
  ) {
    return this.metricasService.getChamadosAbertos(
      empresaId,
      filtro.usuarioId ? Number(filtro.usuarioId) : undefined,
      filtro.startDate ? new Date(filtro.startDate) : undefined,
      filtro.endDate ? new Date(filtro.endDate) : undefined,
    );
  }

  @Get('fechados')
  @ApiOperation({ summary: 'Quantidade de chamados fechados' })
  getChamadosFechados(
    @GetEmpresa() empresaId: number,
    @Query() filtro: FiltroMetricasDto,
  ) {
    return this.metricasService.getChamadosFechados(
      empresaId,
      filtro.usuarioId ? Number(filtro.usuarioId) : undefined,
      filtro.startDate ? new Date(filtro.startDate) : undefined,
      filtro.endDate ? new Date(filtro.endDate) : undefined,
    );
  }

  @Get('sla')
  @ApiOperation({ summary: 'Percentual de SLA cumprido' })
  getSlaCumprido(
    @GetEmpresa() empresaId: number,
    @Query() filtro: FiltroMetricasDto,
  ) {
    return this.metricasService.getSlaCumprido(
      empresaId,
      filtro.usuarioId ? Number(filtro.usuarioId) : undefined,
      filtro.startDate ? new Date(filtro.startDate) : undefined,
      filtro.endDate ? new Date(filtro.endDate) : undefined,
    );
  }
}
