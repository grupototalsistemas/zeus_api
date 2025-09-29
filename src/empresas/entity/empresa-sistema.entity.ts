// src/entities/empresa-sistema.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { Empresa } from './empresa.entity';
import { Sistema } from './sistema.entity';

export class EmpresaSistema {
  id: bigint;
  empresaId: bigint;
  sistemaId: bigint;
  versao: string;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  empresa?: Empresa;
  sistema?: Sistema;
}
