
import {Pessoas} from './pessoas.entity'
import {PessoasContatosTipo} from './pessoasContatosTipo.entity'


export class PessoasContatos {
  id: bigint ;
id_pessoa_contato_tipo: bigint ;
id_pessoa: bigint ;
descricao: string ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoa?: Pessoas ;
contatoTipo?: PessoasContatosTipo ;
}
