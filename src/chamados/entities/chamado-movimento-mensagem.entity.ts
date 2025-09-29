// src/entities/chamado-movimento-mensagem.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { ChamadoMovimento } from './chamado-movimento.entity';

export class ChamadoMovimentoMensagem {
  id: bigint;
  movimentoId: bigint;
  usuarioEnvioId: bigint;
  usuarioLeituraId: bigint;
  ordem?: number;
  descricao: string;
  envio?: Date;
  leitura?: Date;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  movimento?: ChamadoMovimento;
}
