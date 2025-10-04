
import {Pessoas} from './pessoas.entity'


export class PessoasTipo {
  id: bigint ;
descricao: string ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoas?: Pessoas[] ;
}
