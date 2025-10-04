
import {Pessoas} from './pessoas.entity'
import {PessoasFisicasGenero} from './pessoasFisicasGenero.entity'
import {PessoasFisicasEstadoCivil} from './pessoasFisicasEstadoCivil.entity'
import {PessoasUsuarios} from './pessoasUsuarios.entity'
import {PessoasJuridicas} from './pessoasJuridicas.entity'
import {PessoasJuridicasFisicas} from './pessoasJuridicasFisicas.entity'


export class PessoasFisica {
  id: bigint ;
id_pessoa: bigint ;
id_pessoa_genero: bigint ;
id_pessoa_estado_civil: bigint ;
cpf_justificativa: number ;
cpf: string  | null;
nome_registro: string ;
nome_social: string  | null;
doc_numero: string  | null;
doc_emissor: string  | null;
doc_data_emissao: Date  | null;
nacionalidade: string  | null;
naturalidade: string  | null;
data_nascimento: Date  | null;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoa?: Pessoas ;
genero?: PessoasFisicasGenero ;
estadoCivil?: PessoasFisicasEstadoCivil ;
pessoasUsuarios?: PessoasUsuarios[] ;
PessoasJuridicas?: PessoasJuridicas[] ;
PessoasJuridicasFisicas?: PessoasJuridicasFisicas[] ;
}
