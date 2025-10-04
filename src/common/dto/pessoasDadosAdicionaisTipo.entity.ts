
import {Pessoas} from './pessoas.entity'
import {PessoasDadosAdicionais} from './pessoasDadosAdicionais.entity'


export class PessoasDadosAdicionaisTipo {
  id: bigint ;
id_pessoa: bigint ;
descricao: string ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoa?: Pessoas ;
pessoasDadosAdicionais?: PessoasDadosAdicionais[] ;
}
