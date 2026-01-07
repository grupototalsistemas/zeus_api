import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePessoasEnderecosDto {
  @ApiProperty({
    description: 'ID da pessoa',
    example: 1,
    type: String,
  })
  @IsNotEmpty({ message: 'O campo id_pessoa é obrigatório' })
  @IsString()
  id_pessoa: string;

  @ApiProperty({
    description: 'ID do tipo de endereço',
    example: 1,
    type: String,
  })
  @IsNotEmpty({ message: 'O campo id_pessoa_endereco_tipo é obrigatório' })
  @IsString()
  id_pessoa_endereco_tipo: string;

  @ApiProperty({
    description: 'Tipo de logradouro',
    example: 'Rua',
  })
  @IsNotEmpty({ message: 'O campo logradouro é obrigatório' })
  @IsString()
  logradouro: string;

  @ApiProperty({
    description: 'Nome do endereço',
    example: 'das Flores',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'O campo endereco é obrigatório' })
  @IsString()
  @MaxLength(150)
  endereco: string;

  @ApiPropertyOptional({
    description: 'Número do endereço',
    example: '123',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numero?: string;

  @ApiPropertyOptional({
    description: 'Complemento',
    example: 'Apto 101',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'O campo bairro é obrigatório' })
  @IsString()
  @MaxLength(100)
  bairro: string;

  @ApiProperty({
    description: 'Município',
    example: 'Niterói',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'O campo municipio é obrigatório' })
  @IsString()
  @MaxLength(100)
  municipio: string;

  @ApiPropertyOptional({
    description: 'Código IBGE do município',
    example: '3303302',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  municipio_ibge?: string;

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'RJ',
    maxLength: 2,
  })
  @IsNotEmpty({ message: 'O campo estado é obrigatório' })
  @IsString()
  @MaxLength(2)
  estado: string;

  @ApiProperty({
    description: 'CEP',
    example: '24020-040',
    maxLength: 10,
  })
  @IsNotEmpty({ message: 'O campo cep é obrigatório' })
  @IsString()
  @MaxLength(10)
  cep: string;

  @ApiPropertyOptional({
    description: 'Situação (1 = ativo, 0 = inativo)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  situacao?: number;

  @ApiPropertyOptional({
    description: 'Motivo da situação',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

export class UpdatePessoasEnderecosDto extends PartialType(
  CreatePessoasEnderecosDto,
) {}

export class PessoasEnderecosResponseDto {
  @ApiProperty({ description: 'ID do endereço', type: String })
  id: string;

  @ApiProperty({ description: 'ID da pessoa', type: String })
  id_pessoa: string;

  @ApiProperty({ description: 'ID do tipo de endereço', type: String })
  id_pessoa_endereco_tipo: string;

  @ApiProperty({ description: 'Tipo de logradouro' })
  logradouro: string;

  @ApiProperty({ description: 'Endereço' })
  endereco: string;

  @ApiProperty({ description: 'Número', nullable: true })
  numero: string | null;

  @ApiProperty({ description: 'Complemento', nullable: true })
  complemento: string | null;

  @ApiProperty({ description: 'Bairro' })
  bairro: string;

  @ApiProperty({ description: 'Município' })
  municipio: string;

  @ApiProperty({ description: 'Código IBGE', nullable: true })
  municipio_ibge: string | null;

  @ApiProperty({ description: 'Estado' })
  estado: string;

  @ApiProperty({ description: 'CEP' })
  cep: string;

  @ApiProperty({ description: 'Situação' })
  situacao: number;

  @ApiProperty({ description: 'Motivo', nullable: true })
  motivo: string | null;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', nullable: true })
  updatedAt: Date | null;
}

export class QueryPessoasEnderecosDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID da pessoa',
    example: '1',
    type: String,
  })
  @IsOptional()
  @IsString()
  id_pessoa?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de endere??o',
    example: '2',
    type: String,
  })
  @IsOptional()
  @IsString()
  id_pessoa_endereco_tipo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar pela situa??uo (1 = ativo, 0 = inativo)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  situacao?: number;
}

export class DeletePessoasEnderecosDto {
  @ApiProperty({
    description: 'Motivo da exclusão (obrigatório)',
    example: 'Endereço substituído por solicitação do cliente',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'O campo motivo é obrigatório' })
  @IsString()
  @MaxLength(500)
  motivo: string;
}
