export class ChamadoEntity {
  id: bigint;
  id_empresa: bigint;
  id_sistema: bigint;
  id_pessoa_empresa: bigint;
  id_pessoa_usuario: bigint;
  id_ocorrencia: bigint;
  id_prioridade: bigint;
  protocolo?: number;
  titulo: string;
  descricao: string;
  observacao: string;
  situacao: number;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;
}
