
import {PessoasJuridicasFisicas} from './pessoasJuridicasFisicas.entity'
import {PessoasJuridicas} from './pessoasJuridicas.entity'


export class PessoasJuridicasJuridicas {
  id: bigint ;
id_pessoa_juridica_empresa: bigint ;
descricao: string ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoasJuridicasFisicas?: PessoasJuridicasFisicas[] ;
pessoaJuridicaEmpresa?: PessoasJuridicas ;
}
