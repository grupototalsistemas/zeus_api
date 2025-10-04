
import {PessoasJuridicasFisicas} from './pessoasJuridicasFisicas.entity'
import {ModulosPerfisPermissoes} from './modulosPerfisPermissoes.entity'
import {PessoasJuridicas} from './pessoasJuridicas.entity'
import {LogSystem} from './logSystem.entity'


export class PessoasJuridicasPerfis {
  id: bigint ;
id_pessoa_juridica: bigint ;
descricao: string ;
status_view: number  | null;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoasJuridicasFisicas?: PessoasJuridicasFisicas[] ;
perfisPermissoes?: ModulosPerfisPermissoes[] ;
pessoaJuridica?: PessoasJuridicas ;
LogSystem?: LogSystem[] ;
}
