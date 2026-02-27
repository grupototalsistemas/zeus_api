import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { FileStorageService } from '../common/services/file-storage.service';
import { ChamadoMovimentoAnexosController } from './controllers/chamado-movimento-anexos.controller';
import { ChamadoMovimentoEtapasController } from './controllers/chamado-movimento-etapas.controller';
import { ChamadoMovimentoMensagensController } from './controllers/chamado-movimento-mensagens.controller';
import { ChamadoMovimentosController } from './controllers/chamado-movimentos.controller';
import { ChamadosController } from './controllers/chamados.controller';
import { OcorrenciaTipoController } from './controllers/ocorrencia-tipo.controller';
import { OcorrenciaController } from './controllers/ocorrencia.controller';
import { PrioridadeController } from './controllers/prioridade.controller';
import { ChamadoMovimentoAnexosService } from './services/chamado-movimento-anexos.service';
import { ChamadoMovimentoEtapasService } from './services/chamado-movimento-etapas.service';
import { ChamadoMovimentoMensagensService } from './services/chamado-movimento-mensagens.service';
import { ChamadoMovimentosService } from './services/chamado-movimentos.service';
import { ChamadosService } from './services/chamados.service';
import { OcorrenciaTipoService } from './services/ocorrencia-tipo.service';
import { OcorrenciaService } from './services/ocorrencia.service';
import { PrioridadeService } from './services/prioridade.service';

@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    ChamadosController,
    ChamadoMovimentosController,
    ChamadoMovimentoEtapasController,
    ChamadoMovimentoAnexosController,
    ChamadoMovimentoMensagensController,
    OcorrenciaController,
    OcorrenciaTipoController,
    PrioridadeController,
  ],
  providers: [
    FileStorageService,
    ChamadosService,
    ChamadoMovimentosService,
    ChamadoMovimentoEtapasService,
    ChamadoMovimentoAnexosService,
    ChamadoMovimentoMensagensService,
    OcorrenciaService,
    OcorrenciaTipoService,
    PrioridadeService,
  ],
  exports: [
    FileStorageService,
    ChamadosService,
    ChamadoMovimentosService,
    ChamadoMovimentoEtapasService,
    ChamadoMovimentoAnexosService,
    ChamadoMovimentoMensagensService,
    OcorrenciaService,
    OcorrenciaTipoService,
    PrioridadeService,
  ],
})
export class ChamadosModule {}
