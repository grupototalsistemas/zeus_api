// src/entities/chamado.entity.ts

import { ChamadoMovimento } from './chamado-movimento.entity';

import { StatusRegistro } from 'src/common/enums/status-registro.enum';

import { Empresa } from 'src/empresas/entity/empresa.entity';
import { Sistema } from 'src/empresas/entity/sistema.entity';
import { Ocorrencia } from './ocorrencia.entity';
import { Prioridade } from './prioridade.entity';

export class Chamado {
  id: bigint;
  empresaId: bigint;
  sistemaId: bigint;
  pessoaId: bigint;
  usuarioId: bigint;
  ocorrenciaId: bigint;
  prioridadeId: bigint;
  protocolo?: string;
  titulo: string;
  descricao: string;
  observacao: string;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  empresa?: Empresa;
  ocorrencia?: Ocorrencia;
  prioridade?: Prioridade;
  sistema?: Sistema;
  movimentos?: ChamadoMovimento[];
}
