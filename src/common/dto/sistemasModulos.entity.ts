
import {Sistemas} from './sistemas.entity'
import {Modulos} from './modulos.entity'


export class SistemasModulos {
  id: bigint ;
id_sistema: bigint ;
id_modulo_principal: bigint ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
sistema?: Sistemas ;
moduloPrincipal?: Modulos ;
}
