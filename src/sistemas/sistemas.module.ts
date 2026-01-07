import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ModulosPerfisPermissoesController } from './controllers/modulos-perfis-permissoes.controller';
import { ModulosController } from './controllers/modulos.controller';
import { SistemasModulosController } from './controllers/sistemas-modulos.controller';
import { ModulosPerfisPermissoesService } from './services/modulos-perfis-permissoes.service';
import { ModulosService } from './services/modulos.service';
import { SistemasModulosService } from './services/sistemas-modulos.service';
import { SistemasController } from './sistemas.controller';
import { SistemasService } from './sistemas.service';

@Module({
  controllers: [
    SistemasController,
    SistemasModulosController,
    ModulosPerfisPermissoesController,
    ModulosController,
  ],
  providers: [
    SistemasService,
    SistemasModulosService,
    ModulosPerfisPermissoesService,
    ModulosService,
    PrismaService,
  ],
})
export class SistemasModule {}
