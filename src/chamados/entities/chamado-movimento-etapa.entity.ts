// src/entities/chamado-movimento-etapa.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';

import { Empresa } from 'src/empresas/entity/empresa.entity';
import { ChamadoMovimento } from './chamado-movimento.entity';

export class ChamadoMovimentoEtapa {
  id: bigint;
  empresaId: bigint;
  descricao: string;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  movimentos?: ChamadoMovimento[];
  empresa?: Empresa;
}
