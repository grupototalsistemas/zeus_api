// src/entities/prioridade.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { Empresa } from 'src/empresas/entity/empresa.entity';
import { Chamado } from './chamado.entity';

export class Prioridade {
  id: bigint;
  empresaId: bigint;
  descricao: string;
  cor: string;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;
  tempo: number;

  // Relations
  chamados?: Chamado[];
  empresa?: Empresa;
}
