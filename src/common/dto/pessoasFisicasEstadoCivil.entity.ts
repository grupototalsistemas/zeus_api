
import {PessoasFisica} from './pessoasFisica.entity'


export class PessoasFisicasEstadoCivil {
  id: bigint ;
descricao: string  | null;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoasFisicas?: PessoasFisica[] ;
}
