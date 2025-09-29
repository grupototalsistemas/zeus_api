// src/entities/perfil.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';

import { Empresa } from 'src/empresas/entity/empresa.entity';
import { PessoaUsuario } from './pessoa-usuario.entity';

export class Perfil {
  id: bigint;
  empresaId: bigint;
  descricao: string;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  empresa?: Empresa;
  usuarios?: PessoaUsuario[];
}
