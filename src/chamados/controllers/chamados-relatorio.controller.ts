import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetEmpresa } from '../../common/decorators/get-empresa.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChamadosRelatorioService } from '../services/chamados-relatorio.service';

@ApiTags('Chamados - Relatórios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chamados/relatorios')
export class ChamadosRelatorioController {
  constructor(private readonly relatorioService: ChamadosRelatorioService) {}

  @Get('desempenho')
  @ApiOperation({ summary: 'Gera relatório de desempenho por equipe/usuário' })
  async getRelatorioDesempenho(
    @GetEmpresa() empresaId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.relatorioService.getRelatorioDesempenho(
      empresaId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('tendencias')
  @ApiOperation({ summary: 'Gera relatório de tendências' })
  async getRelatorioTendencias(
    @GetEmpresa() empresaId: number,
    @Query('meses') meses?: number,
  ) {
    return this.relatorioService.getRelatorioTendencias(
      empresaId,
      meses ? Number(meses) : undefined,
    );
  }

  //   @Get('satisfacao')
  //   @ApiOperation({ summary: 'Gera relatório de satisfação do cliente' })
  //   async getRelatorioSatisfacao(@GetEmpresa() empresaId: number) {
  //     return this.relatorioService.getRelatorioSatisfacao(empresaId);
  //   }

  // TODO: Adicionar endpoint para exportar relatórios em diferentes formatos (PDF, Excel, etc.)
}
