// src/entities/empresa-tipo.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';

export class EmpresaTipo {
  id: bigint;
  descricao: string;
  ativo: StatusRegistro;
  createdAt: Date;
  updatedAt?: Date;
}
