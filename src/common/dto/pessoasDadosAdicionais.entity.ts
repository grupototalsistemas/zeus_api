
import {Pessoas} from './pessoas.entity'
import {PessoasDadosAdicionaisTipo} from './pessoasDadosAdicionaisTipo.entity'


export class PessoasDadosAdicionais {
  id: bigint ;
id_pessoa_dado_adicional_tipo: bigint ;
id_pessoa: bigint ;
descricao: string ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoa?: Pessoas ;
dadoAdicionalTipo?: PessoasDadosAdicionaisTipo ;
}
