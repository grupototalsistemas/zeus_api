
import {Pessoas} from './pessoas.entity'
import {PessoasEnderecosTipo} from './pessoasEnderecosTipo.entity'


export class PessoasEnderecos {
  id: bigint ;
id_pessoa: bigint ;
id_pessoa_endereco_tipo: bigint ;
logradouro: string ;
endereco: string ;
numero: string  | null;
complemento: string  | null;
bairro: string ;
municipio: string ;
municipio_ibge: string  | null;
estado: string ;
cep: string ;
situacao: number ;
motivo: string  | null;
createdAt: Date ;
updatedAt: Date  | null;
pessoa?: Pessoas ;
enderecoTipo?: PessoasEnderecosTipo ;
}
