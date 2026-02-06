export class ChamadoMovimentoMensagemEntity {
  id: bigint;
  id_chamado_movimento: bigint;
  id_pessoa_usuario_envio: bigint;
  id_pessoa_usuario_leitura: bigint;
  ordem?: number;
  descricao: string;
  dataHoraEnvio?: Date;
  dataHoraLeitura?: Date;
  situacao: number;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;
}
