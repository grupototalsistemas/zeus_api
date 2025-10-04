
import {PessoasFisica} from './pessoasFisica.entity'


export class PessoasFisicasGenero {
  id: bigint ;
genero: string  | null;
descricao: string  | null;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoasFisicas?: PessoasFisica[] ;
}
