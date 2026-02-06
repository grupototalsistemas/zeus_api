export class ChamadoMovimentoAnexoEntity {
  id: bigint;
  id_chamado_movimento: bigint;
  id_pessoa_usuario: bigint;
  ordem?: number;
  descricao: string;
  dataHora?: Date;
  caminho: string;
  situacao: number;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;
}
