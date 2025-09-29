// src/entities/sistema.entity.ts

import { Chamado } from 'src/chamados/entities/chamado.entity';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { EmpresaSistema } from './empresa-sistema.entity';
import { Empresa } from './empresa.entity';

export class Sistema {
  id: bigint;
  empresaId: bigint;
  nome: string;
  descricao: string;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  chamados?: Chamado[];
  empresasSistemas?: EmpresaSistema[];
  empresa?: Empresa;
}
