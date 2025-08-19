import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetEmpresa } from '../../common/decorators/get-empresa.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChamadosMetricasService } from '../services/chamados-metricas.service';

@ApiTags('Chamados Métricas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chamados/metricas')
export class ChamadosMetricasController {
  constructor(private readonly metricasService: ChamadosMetricasService) {}

  @Get('tempo-medio')
  @ApiOperation({ summary: 'Retorna o tempo médio de resolução dos chamados' })
  getTempoMedioResolucao(
    @GetEmpresa() empresaId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.metricasService.getTempoMedioResolucao(
      empresaId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('por-status')
  @ApiOperation({ summary: 'Retorna a quantidade de chamados por status' })
  getQuantidadePorStatus(
    @GetEmpresa() empresaId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.metricasService.getQuantidadePorStatus(
      empresaId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('performance')
  @ApiOperation({ summary: 'Retorna a performance por usuário' })
  getPerformancePorUsuario(
    @GetEmpresa() empresaId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.metricasService.getPerformancePorUsuario(
      empresaId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
