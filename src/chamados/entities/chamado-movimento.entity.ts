export class ChamadoMovimentoEntity {
  id: bigint;
  id_chamado: bigint;
  id_chamado_movimento_etapa: bigint;
  id_pessoa_usuario: bigint;
  ordem?: number;
  dataHoraInicio?: Date;
  dataHoraFim?: Date;
  descricaoAcao: string;
  observacaoTecnica: string;
  situacao: number;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;
}
