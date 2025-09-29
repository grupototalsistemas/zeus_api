// src/entities/pessoa-usuario.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { Perfil } from './perfil.entity';
import { Pessoa } from './pessoa.entity';

export class PessoaUsuario {
  id: bigint;
  pessoaId: bigint;
  perfilId: bigint;
  email: string;
  login: string;
  senha?: string;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  pessoa?: Pessoa;
  perfil?: Perfil;
}
