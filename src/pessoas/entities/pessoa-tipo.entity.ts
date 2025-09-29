// src/entities/pessoa-tipo.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { Empresa } from 'src/empresas/entity/empresa.entity';
import { Pessoa } from './pessoa.entity';

export class PessoaTipo {
  id: bigint;
  empresaId: bigint;
  descricao: string;
  ativo: StatusRegistro;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  pessoas?: Pessoa[];
  empresa?: Empresa;
}
