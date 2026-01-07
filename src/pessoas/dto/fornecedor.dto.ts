import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { BaseReponseDto } from 'src/common/dto/base-query.dto';
import { CreatePessoasContatosDto } from './pessoa-contato.dto';
import { CreatePessoasDadosAdicionaisDto } from './pessoa-dados-adicionais.dto';
import { CreatePessoasEnderecosDto } from './pessoa-endereco.dto';

// Expressão regular para validar CNPJ (com ou sem máscara)
// const CNPJ_REGEX = /^(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2})$/;

export class CreateFornecedorDto {
  @ApiProperty({
    description: 'ID da empresa que esta realizando o cadastro',
    example: 4,
    required: true,
  })
  @IsNumber({}, { message: 'O campo id_pessoa_juridica deve ser numérico' })
  id_pessoa_juridica_empresa: number;

  @ApiPropertyOptional({
    description: 'Código de identificação da pessoa jurídica (opcional)',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiProperty({
    description: 'ID da pessoa física responsável',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'O campo id_pessoa_fisica_responsavel deve ser numérico' },
  )
  id_pessoa_fisica_responsavel?: number;

  @ApiProperty({
    description: 'CNPJ da pessoa jurídica (com ou sem máscara)',
    example: '12.345.678/0001-90',
  })
  @IsNotEmpty({ message: 'O campo cnpj é obrigatório' })
  @Length(14, 18, { message: 'O campo cnpj deve ter entre 14 e 18 caracteres' })
  cnpj: string;

  @ApiProperty({
    description: 'Razão social da empresa',
    example: 'Empresa de Teste Ltda.',
  })
  @IsNotEmpty({ message: 'O campo razao_social é obrigatório' })
  @IsString({ message: 'O campo razao_social deve ser um texto' })
  @Length(3, 250, {
    message: 'A razão social deve ter entre 3 e 250 caracteres',
  })
  @Transform(({ value }) => value.toUpperCase())
  razao_social: string;

  @ApiPropertyOptional({
    description: 'Nome fantasia da empresa (opcional)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  nome_fantasia?: string;

  @ApiProperty({
    description: 'Inscrição estadual (opcional)',
    example: '123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  insc_estadual?: string;

  @ApiProperty({
    description: 'Inscrição municipal (opcional)',
    example: '987654321',
    required: false,
  })
  @IsOptional()
  @IsString()
  insc_municipal?: string;

  @ApiProperty({
    description: 'Indica se é filial principal (1 = sim, 0 = não)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O campo filial_principal deve ser numérico' })
  filial_principal?: number;

  endereco: CreatePessoasEnderecosDto[];

  contato: CreatePessoasContatosDto[];

  adicional: CreatePessoasDadosAdicionaisDto[];
}

export class UpdateFornecedorDto extends PartialType(CreateFornecedorDto) {}

export class QueryFornecedorDto {
  @ApiPropertyOptional({
    description: 'ID da empresa que esta realizando o cadastro',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  id_pessoa_juridica_empresa?: number;

  @ApiPropertyOptional({
    description: 'ID da pessoa física responsável',

    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  id_pessoa_fisica_responsavel?: number;

  @ApiPropertyOptional({
    description: 'CNPJ da pessoa jurídica (com ou sem máscara)',
  })
  @IsOptional()
  @Length(14, 18, { message: 'O campo cnpj deve ter entre 14 e 18 caracteres' })
  cnpj?: string;

  @ApiPropertyOptional({
    description: 'Razão social da empresa',
  })
  @IsOptional()
  @IsString({ message: 'O campo razao_social deve ser um texto' })
  razao_social: string;

  @ApiPropertyOptional({
    description: 'Nome fantasia da empresa (opcional)',
  })
  @IsOptional()
  @IsString()
  nome_fantasia?: string;

  @ApiPropertyOptional({
    description: 'Inscrição estadual (opcional)',

    required: false,
  })
  @IsOptional()
  @IsString()
  insc_estadual?: string;

  @ApiPropertyOptional({
    description: 'Inscrição municipal (opcional)',

    required: false,
  })
  @IsOptional()
  @IsString()
  insc_municipal?: string;

  @ApiPropertyOptional({
    description: 'Indica se é filial principal (1 = sim, 0 = não)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O campo filial_principal deve ser numérico' })
  @Type(() => Number)
  filial_principal?: number;
}

export class ResponseFornecedorDto extends BaseReponseDto(
  CreateFornecedorDto,
) {}
