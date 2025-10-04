
import {Pessoas} from './pessoas.entity'
import {Sistemas} from './sistemas.entity'
import {PessoasFisica} from './pessoasFisica.entity'
import {PessoasJuridicasFisicas} from './pessoasJuridicasFisicas.entity'
import {PessoasJuridicasJuridicas} from './pessoasJuridicasJuridicas.entity'
import {PessoasJuridicasSistemas} from './pessoasJuridicasSistemas.entity'
import {PessoasJuridicasPerfis} from './pessoasJuridicasPerfis.entity'


export class PessoasJuridicas {
  id: bigint ;
id_pessoa: bigint ;
id_pessoa_responsavel: bigint ;
id_pessoa_fisica: bigint ;
cnpj: string ;
razao_social: string ;
nome_fantasia: string  | null;
inscricao_estadual: string  | null;
inscricao_municipal: string  | null;
filial_principal: number  | null;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoa?: Pessoas ;
sistemas?: Sistemas[] ;
pessoaFisica?: PessoasFisica ;
pessoasJuridicasFisicas?: PessoasJuridicasFisicas[] ;
PessoasJuridicasJuridicas?: PessoasJuridicasJuridicas[] ;
PessoasJuridicasSistemas?: PessoasJuridicasSistemas[] ;
PessoasJuridicasPerfis?: PessoasJuridicasPerfis[] ;
}
