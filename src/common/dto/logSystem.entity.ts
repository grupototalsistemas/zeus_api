
import {Prisma} from '@prisma/client'
import {PessoasUsuarios} from './pessoasUsuarios.entity'
import {Modulos} from './modulos.entity'
import {PessoasJuridicasPerfis} from './pessoasJuridicasPerfis.entity'


export class LogSystem {
  id: bigint ;
id_usuario: bigint ;
id_perfil: bigint ;
id_modulo: bigint ;
endpoint_name: string ;
device: string ;
user_win: string  | null;
computer_name: string  | null;
action_page: string ;
table_name: string  | null;
table_id_name: string  | null;
table_id_value: bigint  | null;
table_id_value_str: string  | null;
table_data_before: Prisma.JsonValue  | null;
table_data_after: Prisma.JsonValue  | null;
error_status: number  | null;
error_message: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
usuario?: PessoasUsuarios ;
modulo?: Modulos ;
perfil?: PessoasJuridicasPerfis ;
}
