
import {Modulos} from './modulos.entity'
import {PessoasJuridicasPerfis} from './pessoasJuridicasPerfis.entity'
import {PessoasJuridicasSistemas} from './pessoasJuridicasSistemas.entity'


export class ModulosPerfisPermissoes {
  id: bigint ;
id_modulo: bigint ;
id_pessoa_juridica_perfil: bigint ;
action_insert: number  | null;
action_update: number  | null;
action_search: number  | null;
action_delete: number  | null;
action_print: number  | null;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
modulo?: Modulos ;
perfil?: PessoasJuridicasPerfis ;
PessoasJuridicasSistemas?: PessoasJuridicasSistemas[] ;
}
