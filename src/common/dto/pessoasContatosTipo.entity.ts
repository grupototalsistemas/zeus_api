
import {Pessoas} from './pessoas.entity'
import {PessoasContatos} from './pessoasContatos.entity'


export class PessoasContatosTipo {
  id: bigint ;
id_pessoa: bigint ;
descricao: string ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoa?: Pessoas ;
pessoasContatos?: PessoasContatos[] ;
}
