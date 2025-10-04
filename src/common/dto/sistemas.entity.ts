
import {PessoasJuridicas} from './pessoasJuridicas.entity'
import {SistemasModulos} from './sistemasModulos.entity'


export class Sistemas {
  id: bigint ;
id_pessoa_juridica_base: bigint ;
sistema: string ;
descricao: string ;
status_web: number ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoaJuridicaBase?: PessoasJuridicas ;
sistemasModulos?: SistemasModulos[] ;
}
