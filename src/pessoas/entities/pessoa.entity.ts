// src/entities/pessoa.entity.ts

import { Empresa } from '@prisma/client';
import { StatusGenero } from 'src/common/enums/status-genero.enum';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { PessoaTipo } from './pessoa-tipo.entity';
import { PessoaUsuario } from './pessoa-usuario.entity';

export class Pessoa {
  id: bigint;
  empresaId: bigint;
  tipoId: bigint;
  genero: StatusGenero;
  nome: string;
  nomeSocial?: string;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  empresa?: Empresa;
  tipo?: PessoaTipo;
  usuarios?: PessoaUsuario[];
}
