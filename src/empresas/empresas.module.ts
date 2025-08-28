// empresas/empresas.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmpresaCategoriaController } from './controllers/categoria.controller';
import { EmpresaSistemaController } from './controllers/empresa-sistema.controller';
import { EmpresaTipoController } from './controllers/empresa-tipo.controller';
import { EmpresasController } from './controllers/empresas.controller';
import { SistemasController } from './controllers/sistemas.controller';
import { EmpresaCategoriaService } from './services/categoria.service';
import { EmpresaSistemaService } from './services/empresa-sistema.service';
import { EmpresaTipoService } from './services/empresa-tipo.service';
import { EmpresasService } from './services/empresas.service';
import { SistemasService } from './services/sistemas.service';


@Module({
  imports: [PrismaModule],
  controllers: [
    EmpresasController,
    EmpresaCategoriaController,
    EmpresaTipoController,
    EmpresaSistemaController,
    SistemasController
  ],
  providers: [
    EmpresasService,
    EmpresaCategoriaService,
    EmpresaTipoService,
    EmpresaSistemaService,
    SistemasService
  ],
  exports: [
    EmpresasService,
    EmpresaCategoriaService,
    EmpresaTipoService,
    EmpresaSistemaService,
    SistemasService
  ],
})
export class EmpresasModule {}
