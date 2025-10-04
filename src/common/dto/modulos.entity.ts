
import {ModulosPerfisPermissoes} from './modulosPerfisPermissoes.entity'
import {SistemasModulos} from './sistemasModulos.entity'
import {LogSystem} from './logSystem.entity'


export class Modulos {
  id: bigint ;
id_parent: bigint ;
name_form_page: string ;
component_index: string ;
component_name: string ;
component_text: string ;
component_event: string  | null;
shortcutkeys: string  | null;
status_visible: number  | null;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
perfisPermissoes?: ModulosPerfisPermissoes[] ;
sistemasModulos?: SistemasModulos[] ;
logSystem?: LogSystem[] ;
}
