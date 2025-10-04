
import {PessoasJuridicas} from './pessoasJuridicas.entity'
import {PessoasFisica} from './pessoasFisica.entity'
import {PessoasJuridicasPerfis} from './pessoasJuridicasPerfis.entity'
import {PessoasJuridicasJuridicas} from './pessoasJuridicasJuridicas.entity'
import {PessoasJuridicasSistemas} from './pessoasJuridicasSistemas.entity'


export class PessoasJuridicasFisicas {
  id: bigint ;
id_pessoa_juridica: bigint ;
id_pessoa_fisica: bigint ;
id_pessoa_juridica_perfil: bigint ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoaJuridica?: PessoasJuridicas ;
pessoaFisica?: PessoasFisica ;
pessoaJuridicaPerfil?: PessoasJuridicasPerfis ;
PessoasJuridicasJuridicas?: PessoasJuridicasJuridicas[] ;
PessoasJuridicasSistemas?: PessoasJuridicasSistemas[] ;
}
