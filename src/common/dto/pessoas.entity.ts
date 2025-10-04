
import {PessoasTipo} from './pessoasTipo.entity'
import {PessoasOrigens} from './pessoasOrigens.entity'
import {PessoasFisica} from './pessoasFisica.entity'
import {PessoasJuridicas} from './pessoasJuridicas.entity'
import {PessoasContatos} from './pessoasContatos.entity'
import {PessoasContatosTipo} from './pessoasContatosTipo.entity'
import {PessoasDadosAdicionais} from './pessoasDadosAdicionais.entity'
import {PessoasDadosAdicionaisTipo} from './pessoasDadosAdicionaisTipo.entity'
import {PessoasEnderecos} from './pessoasEnderecos.entity'
import {PessoasEnderecosTipo} from './pessoasEnderecosTipo.entity'


export class Pessoas {
  id: bigint ;
id_pessoa_tipo: bigint ;
id_pessoa_origem: bigint ;
pessoa: number ;
codigo: string  | null;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoaTipo?: PessoasTipo ;
pessoaOrigem?: PessoasOrigens ;
pessoaFisica?: PessoasFisica  | null;
pessoaJuridica?: PessoasJuridicas[] ;
pessoasContatos?: PessoasContatos[] ;
pessoasContatosTipo?: PessoasContatosTipo[] ;
pessoasDadosAdicionais?: PessoasDadosAdicionais[] ;
pessoasDadosAdicionaisTipo?: PessoasDadosAdicionaisTipo[] ;
pessoasEnderecos?: PessoasEnderecos[] ;
pessoasEnderecosTipo?: PessoasEnderecosTipo[] ;
}
