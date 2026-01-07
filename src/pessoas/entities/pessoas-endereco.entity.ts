import { ApiProperty } from '@nestjs/swagger';
import { PessoasEnderecosTipoEntity } from './pessoas-endereco-tipo.entity';

export class PessoasEnderecosEntity {
  @ApiProperty({ description: 'ID do endereco', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID da pessoa proprietaria', example: 10 })
  id_pessoa: number;

  @ApiProperty({ description: 'ID do tipo de endereco', example: 2 })
  id_pessoa_endereco_tipo: number;

  @ApiProperty({ description: 'Tipo de logradouro (Rua, Avenida, etc.)' })
  logradouro: string;

  @ApiProperty({ description: 'Descricao do endereco' })
  endereco: string;

  @ApiProperty({ description: 'Numero do endereco', nullable: true })
  numero: string | null;

  @ApiProperty({ description: 'Complemento do endereco', nullable: true })
  complemento: string | null;

  @ApiProperty({ description: 'Bairro' })
  bairro: string;

  @ApiProperty({ description: 'Municipio' })
  municipio: string;

  @ApiProperty({ description: 'Codigo do municipio no IBGE', nullable: true })
  municipio_ibge: string | null;

  @ApiProperty({ description: 'UF do estado', example: 'RJ' })
  estado: string;

  @ApiProperty({ description: 'CEP no formato 99999-999' })
  cep: string;

  @ApiProperty({ description: 'Situacao do registro (1 = ativo)', example: 1 })
  situacao: number;

  @ApiProperty({ description: 'Motivo da situacao', nullable: true })
  motivo: string | null;

  @ApiProperty({ description: 'Data de criacao' })
  createdAt: Date;

  @ApiProperty({ description: 'Ultima atualizacao', nullable: true })
  updatedAt: Date | null;

  @ApiProperty({
    description: 'Dados do tipo de endereco associado',
    type: () => PessoasEnderecosTipoEntity,
    required: false,
  })
  enderecoTipo?: PessoasEnderecosTipoEntity;
}
