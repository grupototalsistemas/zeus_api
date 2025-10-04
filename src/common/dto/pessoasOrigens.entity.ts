
import {Pessoas} from './pessoas.entity'


export class PessoasOrigens {
  id: bigint ;
descricao: string ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoas?: Pessoas[] ;
}
