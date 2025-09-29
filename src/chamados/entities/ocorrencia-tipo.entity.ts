// src/entities/ocorrencia-tipo.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { Empresa } from 'src/empresas/entity/empresa.entity';
import { Ocorrencia } from './ocorrencia.entity';

export class OcorrenciaTipo {
  id: bigint;
  empresaId: bigint;
  descricao: string;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  ocorrencias?: Ocorrencia[];
  empresa?: Empresa;
}
