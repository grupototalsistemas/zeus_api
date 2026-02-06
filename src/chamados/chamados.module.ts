import { Module } from '@nestjs/common';
import { ChamadoMovimentoAnexosController } from './controllers/chamado-movimento-anexos.controller';
import { ChamadoMovimentoEtapasController } from './controllers/chamado-movimento-etapas.controller';
import { ChamadoMovimentoMensagensController } from './controllers/chamado-movimento-mensagens.controller';
import { ChamadoMovimentosController } from './controllers/chamado-movimentos.controller';
import { ChamadosController } from './controllers/chamados.controller';
import { OcorrenciaController } from './controllers/ocorrencia.controller';
import { PrioridadeController } from './controllers/prioridade.controller';
import { ChamadoMovimentoAnexosService } from './services/chamado-movimento-anexos.service';
import { ChamadoMovimentoEtapasService } from './services/chamado-movimento-etapas.service';
import { ChamadoMovimentoMensagensService } from './services/chamado-movimento-mensagens.service';
import { ChamadoMovimentosService } from './services/chamado-movimentos.service';
import { ChamadosService } from './services/chamados.service';
import { OcorrenciaService } from './services/ocorrencia.service';
import { PrioridadeService } from './services/prioridade.service';

@Module({
  controllers: [
    ChamadosController,
    ChamadoMovimentosController,
    ChamadoMovimentoEtapasController,
    ChamadoMovimentoAnexosController,
    ChamadoMovimentoMensagensController,
    OcorrenciaController,
    PrioridadeController,
  ],
  providers: [
    ChamadosService,
    ChamadoMovimentosService,
    ChamadoMovimentoEtapasService,
    ChamadoMovimentoAnexosService,
    ChamadoMovimentoMensagensService,
    OcorrenciaService,
    PrioridadeService,
  ],
  exports: [
    ChamadosService,
    ChamadoMovimentosService,
    ChamadoMovimentoEtapasService,
    ChamadoMovimentoAnexosService,
    ChamadoMovimentoMensagensService,
    OcorrenciaService,
    PrioridadeService,
  ],
})
export class ChamadosModule {}
