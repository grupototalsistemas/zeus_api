





export class CreatePessoasJuridicasDto {
  id_pessoa_responsavel: bigint;
cnpj: string;
razao_social: string;
nome_fantasia?: string;
inscricao_estadual?: string;
inscricao_municipal?: string;
filial_principal?: number;
motivo?: string;
updatedAt?: Date;
}
