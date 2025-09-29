// src/entities/empresa-categoria.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { Empresa } from './empresa.entity';

export class EmpresaCategoria {
  id: bigint;
  empresaId: bigint;
  descricao: string;
  ativo: StatusRegistro;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  empresa?: Empresa;
}
