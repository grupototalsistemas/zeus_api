export class ChamadoMovimentoEtapaEntity {
  id: bigint;
  id_empresa: bigint;
  descricao: string;
  situacao: number;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;
}
