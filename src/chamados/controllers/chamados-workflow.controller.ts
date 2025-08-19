import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChamadosNotificacaoService } from '../services/chamados-notificacao.service';
import { ChamadosWorkflowService } from '../services/chamados-workflow.service';

@ApiTags('Chamados - Workflow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chamados/workflow')
export class ChamadosWorkflowController {
  constructor(
    private readonly workflowService: ChamadosWorkflowService,
    private readonly notificacaoService: ChamadosNotificacaoService,
  ) {}

  @Get(':id/proximas-etapas')
  @ApiOperation({
    summary: 'Retorna as próximas etapas possíveis para um chamado',
  })
  getProximasEtapas(@Param('id') id: string) {
    return this.workflowService.getProximasEtapas(BigInt(id));
  }

  @Get(':id/atraso')
  @ApiOperation({ summary: 'Verifica se um chamado está atrasado' })
  verificarAtraso(@Param('id') id: string) {
    return this.workflowService.verificarAtraso(BigInt(id));
  }

  @Get(':id/sugestoes')
  @ApiOperation({ summary: 'Retorna sugestões de ações baseadas no histórico' })
  getSugestoes(@Param('id') id: string) {
    return this.workflowService.getSugestoes(BigInt(id));
  }

  //   @Get(':id/equipe-recomendada')
  //   @ApiOperation({
  //     summary: 'Retorna a equipe mais apropriada para atender o chamado',
  //   })
  //   getEquipeRecomendada(@Param('id') id: string) {
  //     return this.workflowService.getEquipeRecomendada(BigInt(id));
  //   }
}
