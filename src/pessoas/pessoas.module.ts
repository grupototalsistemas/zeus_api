import { Module } from '@nestjs/common';
import { DateUtils } from 'src/common/utils/date.utils';

import { FuncionariosAdicionaisController } from './controllers/adicionais.controller';
import { CartorioController } from './controllers/cartorio.controller';
import { FornecedoresController } from './controllers/fornecedores.controller';
import { FuncionariosController } from './controllers/funcionarios.controller';
import { PessoasEnderecosTiposController } from './controllers/pessoas-enderecos-tipos.controller';
import { PessoasEnderecosController } from './controllers/pessoas-enderecos.controller';
import { PessoasFisicasEstadosCivisController } from './controllers/pessoas-fisicas-estados-civis.controller';
import { PessoasFisicasGenerosController } from './controllers/pessoas-fisicas-generos.controller';
import { PessoasJuridicasPerfisController } from './controllers/pessoas-juridicas-perfis.controller';
import { PessoasUsuariosController } from './controllers/pessoas-usuarios.controller';
import { PessoasController } from './controllers/pessoas.controller';
import { FuncionariosAdicionaisTiposService } from './services/adicionais.service';
import { CartorioService } from './services/cartorio.service';
import { FornecedoresService } from './services/fornecedores.service';
import { FuncionariosService } from './services/funcionarios.service';
import { PessoasEnderecosTiposService } from './services/pessoas-enderecos-tipos.service';
import { PessoasEnderecosService } from './services/pessoas-enderecos.service';
import { PessoasFisicasEstadosCivisService } from './services/pessoas-fisicas-estados-civis.service';
import { PessoasFisicasGenerosService } from './services/pessoas-fisicas-generos.service';
import { PessoasJuridicasPerfisService } from './services/pessoas-juridicas-perfis.service';
import { PessoasUsuariosService } from './services/pessoas-usuarios.service';
import { PessoasService } from './services/pessoas.service';

@Module({
  controllers: [
    PessoasController,
    PessoasUsuariosController,
    FuncionariosController,
    FornecedoresController,
    CartorioController,
    PessoasEnderecosController,
    PessoasEnderecosTiposController,

    FuncionariosAdicionaisController,
    PessoasFisicasEstadosCivisController,
    PessoasFisicasGenerosController,
    PessoasJuridicasPerfisController,
  ],
  providers: [
    PessoasService,
    PessoasUsuariosService,
    DateUtils,
    FuncionariosService,
    FornecedoresService,
    CartorioService,
    PessoasEnderecosService,
    PessoasEnderecosTiposService,

    FuncionariosAdicionaisTiposService,
    PessoasFisicasEstadosCivisService,
    PessoasFisicasGenerosService,
    PessoasJuridicasPerfisService,
  ],
  exports: [CartorioService],
})
export class PessoasModule {}
