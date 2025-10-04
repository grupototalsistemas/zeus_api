
import {PessoasJuridicasFisicas} from './pessoasJuridicasFisicas.entity'
import {ModulosPerfisPermissoes} from './modulosPerfisPermissoes.entity'
import {PessoasJuridicas} from './pessoasJuridicas.entity'


export class PessoasJuridicasSistemas {
  id: bigint ;
id_pessoa_juridica: bigint ;
id_sistema: bigint ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoasJuridicasFisicas?: PessoasJuridicasFisicas[] ;
perfisPermissoes?: ModulosPerfisPermissoes[] ;
pessoaJuridica?: PessoasJuridicas ;
}
