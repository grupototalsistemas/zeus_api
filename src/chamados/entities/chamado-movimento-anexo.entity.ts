// src/entities/chamado-movimento-anexo.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { ChamadoMovimento } from './chamado-movimento.entity';

export class ChamadoMovimentoAnexo {
  id: bigint;
  movimentoId: bigint;
  usuarioId: bigint;
  ordem?: number;
  descricao: string;
  dataHora?: Date;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;
  mimeType: string;
  nomeOriginal: string;
  pathname: string;
  tamanho?: number;
  url: string;

  // Relations
  movimento?: ChamadoMovimento;
}
