
import {PessoasFisica} from './pessoasFisica.entity'
import {LogSystem} from './logSystem.entity'


export class PessoasUsuarios {
  id: bigint ;
id_pessoa_fisica: bigint ;
nome_login: string ;
login: string ;
senha: string ;
senha_master: string ;
first_access: number ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoaFisica?: PessoasFisica ;
logSystem?: LogSystem[] ;
}
