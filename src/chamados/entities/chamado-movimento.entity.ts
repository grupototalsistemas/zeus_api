// src/entities/chamado-movimento.entity.ts

import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { ChamadoMovimentoAnexo } from './chamado-movimento-anexo.entity';
import { ChamadoMovimentoEtapa } from './chamado-movimento-etapa.entity';
import { ChamadoMovimentoMensagem } from './chamado-movimento-mensagem.entity';
import { Chamado } from './chamado.entity';

export class ChamadoMovimento {
  id: bigint;
  chamadoId: bigint;
  etapaId: bigint;
  usuarioId: bigint;
  ordem?: number;
  inicio?: Date;
  fim?: Date;
  descricaoAcao: string;
  observacaoTec: string;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  chamado?: Chamado;
  etapa?: ChamadoMovimentoEtapa;
  anexos?: ChamadoMovimentoAnexo[];
  mensagens?: ChamadoMovimentoMensagem[];
}
