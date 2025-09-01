// pessoas/pessoas.module.ts
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { PessoaPerfilController } from './controllers/pessoa-perfil.controller';
import { PessoaTipoController } from './controllers/pessoa-tipo.controller';
import { PessoaUsuarioController } from './controllers/pessoa-usuario.controller';
import { PessoasController } from './controllers/pessoas.controller';
import { PessoaPerfilService } from './services/pessoa-perfil.service';
import { PessoaTipoService } from './services/pessoa-tipo.service';
import { PessoaUsuarioService } from './services/pessoa-usuario.service';
import { PessoasService } from './services/pessoas.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    PessoasController,
    PessoaTipoController,
    PessoaPerfilController,
    PessoaUsuarioController,
  ],
  providers: [
    PessoasService,
    PessoaTipoService,
    PessoaPerfilService,
    PessoaUsuarioService,
  ],
  exports: [
    PessoasService,
    PessoaTipoService,
    PessoaPerfilService,
    PessoaUsuarioService,
  ],
})
export class PessoasModule {}
