import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChamadoMovimentoMensagemController } from './controllers/chamado-movimento-mensagem.controller';
import { ChamadosMetricasController } from './controllers/chamados-metricas.controller';
import { ChamadosRelatorioController } from './controllers/chamados-relatorio.controller';
import { ChamadosWorkflowController } from './controllers/chamados-workflow.controller';
import { ChamadosController } from './controllers/chamados.controller';
import { ChamadoMovimentoEtapaController } from './controllers/movimento-etapa.controller';
import { ChamadoOcorrenciaTipoController } from './controllers/ocorrencia-tipo.controller';
import { ChamadoOcorrenciaController } from './controllers/ocorrencia.controller';
import { ChamadoPrioridadeController } from './controllers/prioridade.controller';
import { ChamadoMovimentoMensagemService } from './services/chamado-movimento-mensagem.service';
import { ChamadosMetricasService } from './services/chamados-metricas.service';
import { ChamadosNotificacaoService } from './services/chamados-notificacao.service';
import { ChamadosRelatorioService } from './services/chamados-relatorio.service';
import { ChamadosWorkflowService } from './services/chamados-workflow.service';
import { ChamadosService } from './services/chamados.service';
import { ChamadoMovimentoEtapaService } from './services/movimento-etapa.service';
import { ChamadoOcorrenciaTipoService } from './services/ocorrencia-tipo.service';
import { ChamadoOcorrenciaService } from './services/ocorrencia.service';
import { ChamadoPrioridadeService } from './services/prioridade.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    ChamadosController,
    ChamadosMetricasController,
    ChamadosWorkflowController,
    ChamadosRelatorioController,
    ChamadoOcorrenciaController,
    ChamadoOcorrenciaTipoController,
    ChamadoPrioridadeController,
    ChamadoMovimentoEtapaController,
    ChamadoMovimentoMensagemController,
  ],
  providers: [
    ChamadosService,
    ChamadosMetricasService,
    ChamadosWorkflowService,
    ChamadosNotificacaoService,
    ChamadosRelatorioService,
    ChamadoOcorrenciaService,
    ChamadoOcorrenciaTipoService,
    ChamadoPrioridadeService,
    ChamadoMovimentoEtapaService,
    ChamadoMovimentoMensagemService,
  ],
  exports: [
    ChamadosService,
    ChamadosMetricasService,
    ChamadosWorkflowService,
    ChamadosNotificacaoService,
    ChamadosRelatorioService,
    ChamadoOcorrenciaService,
    ChamadoOcorrenciaTipoService,
    ChamadoPrioridadeService,
    ChamadoMovimentoEtapaService,
    ChamadoMovimentoMensagemService,
  ],
})
export class ChamadosModule {}
