
import {Pessoas} from './pessoas.entity'
import {PessoasEnderecos} from './pessoasEnderecos.entity'


export class PessoasEnderecosTipo {
  id: bigint ;
id_pessoa: bigint ;
descricao: string ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoa?: Pessoas ;
pessoasEnderecos?: PessoasEnderecos[] ;
}
