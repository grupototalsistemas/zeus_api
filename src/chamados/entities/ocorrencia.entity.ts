// src/entities/ocorrencia.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { Empresa } from 'src/empresas/entity/empresa.entity';
import { Chamado } from './chamado.entity';
import { OcorrenciaTipo } from './ocorrencia-tipo.entity';

export class Ocorrencia {
  id: bigint;
  tipoId: bigint;
  empresaId: bigint;
  descricao: string;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  chamados?: Chamado[];
  empresa?: Empresa;
  tipo?: OcorrenciaTipo;
}
