export class ChamadoMovimentoEtapaEntity {
  id: bigint;
  id_pessoa_juridica: bigint;
  descricao: string;
  situacao: number;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;
}
