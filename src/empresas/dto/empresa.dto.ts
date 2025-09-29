// src/dtos/empresa/create-empresa.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { SiglaEstado } from 'src/common/enums/siglas-estado.enum';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';

export class CreateEmpresaDto {
  @ApiProperty({ description: 'ID da empresa pai', example: '-1', default: -1 })
  @Transform(({ value }) => BigInt(value))
  parentId: bigint = BigInt(-1);

  @ApiProperty({ description: 'ID do tipo da empresa', example: '1' })
  @IsNotEmpty({ message: 'ID do tipo da empresa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  tipoId: bigint;

  @ApiProperty({ description: 'ID da categoria da empresa', example: '1' })
  @IsNotEmpty({ message: 'ID da categoria da empresa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  categoriaId: bigint;

  @ApiProperty({
    description: 'CNPJ da empresa',
    example: '12.345.678/0001-99',
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @IsString({ message: 'CNPJ deve ser uma string' })
  @MaxLength(20, { message: 'CNPJ deve ter no máximo 20 caracteres' })
  cnpj: string;

  @ApiProperty({
    description: 'Código da empresa',
    example: 'EMP001',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Código deve ser uma string' })
  @MaxLength(50, { message: 'Código deve ter no máximo 50 caracteres' })
  codigo?: string;

  @ApiProperty({
    description: 'Razão social',
    example: 'Empresa Exemplo LTDA',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Razão social é obrigatória' })
  @IsString({ message: 'Razão social deve ser uma string' })
  @MaxLength(500, { message: 'Razão social deve ter no máximo 500 caracteres' })
  razaoSocial: string;

  @ApiProperty({
    description: 'Nome fantasia',
    example: 'Empresa Exemplo',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Nome fantasia é obrigatório' })
  @IsString({ message: 'Nome fantasia deve ser uma string' })
  @MaxLength(500, {
    message: 'Nome fantasia deve ter no máximo 500 caracteres',
  })
  nomeFantasia: string;

  @ApiProperty({
    description: 'Tipo de logradouro',
    example: 'Rua',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Logradouro deve ser uma string' })
  @MaxLength(50, { message: 'Logradouro deve ter no máximo 50 caracteres' })
  logradouro?: string;

  @ApiProperty({
    description: 'Endereço',
    example: 'das Flores',
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Endereço deve ser uma string' })
  @MaxLength(150, { message: 'Endereço deve ter no máximo 150 caracteres' })
  endereco?: string;

  @ApiProperty({
    description: 'Número',
    example: '123',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Número deve ser uma string' })
  @MaxLength(20, { message: 'Número deve ter no máximo 20 caracteres' })
  numero?: string;

  @ApiProperty({
    description: 'Complemento',
    example: 'Sala 101',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Complemento deve ser uma string' })
  @MaxLength(50, { message: 'Complemento deve ter no máximo 50 caracteres' })
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Bairro deve ser uma string' })
  @MaxLength(150, { message: 'Bairro deve ter no máximo 150 caracteres' })
  bairro?: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'São Paulo',
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Cidade deve ser uma string' })
  @MaxLength(150, { message: 'Cidade deve ter no máximo 150 caracteres' })
  cidade?: string;

  @ApiProperty({
    description: 'Estado',
    enum: SiglaEstado,
    example: SiglaEstado.SP,
    required: false,
  })
  @IsOptional()
  @IsEnum(SiglaEstado, { message: 'Estado deve ser uma sigla válida' })
  estado?: SiglaEstado;

  @ApiProperty({
    description: 'CEP',
    example: '01234-567',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'CEP deve ser uma string' })
  @MaxLength(20, { message: 'CEP deve ter no máximo 20 caracteres' })
  cep?: string;

  @ApiProperty({
    description: 'Contato',
    example: '(11) 1234-5678',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Contato deve ser uma string' })
  @MaxLength(50, { message: 'Contato deve ter no máximo 50 caracteres' })
  contato?: string;

  @ApiProperty({
    description: 'Email',
    example: 'contato@empresa.com',
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @MaxLength(150, { message: 'Email deve ter no máximo 150 caracteres' })
  email?: string;

  @ApiProperty({
    description: 'Observações',
    example: 'Observações gerais',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observação deve ser uma string' })
  @MaxLength(500, { message: 'Observação deve ter no máximo 500 caracteres' })
  observacao?: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
    default: StatusRegistro.ATIVO,
  })
  @IsEnum(StatusRegistro, { message: 'Status deve ser um valor válido' })
  ativo: StatusRegistro = StatusRegistro.ATIVO;

  @ApiProperty({
    description: 'Motivo',
    example: 'Empresa inativa por período',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;
}

// src/dtos/empresa/update-empresa.dto.ts

export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {}

// src/dtos/empresa/empresa-response.dto.ts

export class EmpresaResponseDto {
  @ApiProperty({ description: 'ID único da empresa', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID da empresa pai', example: '-1' })
  @Transform(({ value }) => value.toString())
  parentId: string;

  @ApiProperty({ description: 'ID do tipo da empresa', example: '1' })
  @Transform(({ value }) => value.toString())
  tipoId: string;

  @ApiProperty({ description: 'ID da categoria da empresa', example: '1' })
  @Transform(({ value }) => value.toString())
  categoriaId: string;

  @ApiProperty({
    description: 'CNPJ da empresa',
    example: '12.345.678/0001-99',
  })
  cnpj: string;

  @ApiProperty({
    description: 'Código da empresa',
    example: 'EMP001',
    required: false,
  })
  codigo?: string;

  @ApiProperty({ description: 'Razão social', example: 'Empresa Exemplo LTDA' })
  razaoSocial: string;

  @ApiProperty({ description: 'Nome fantasia', example: 'Empresa Exemplo' })
  nomeFantasia: string;

  @ApiProperty({
    description: 'Tipo de logradouro',
    example: 'Rua',
    required: false,
  })
  logradouro?: string;

  @ApiProperty({
    description: 'Endereço',
    example: 'das Flores',
    required: false,
  })
  endereco?: string;

  @ApiProperty({ description: 'Número', example: '123', required: false })
  numero?: string;

  @ApiProperty({
    description: 'Complemento',
    example: 'Sala 101',
    required: false,
  })
  complemento?: string;

  @ApiProperty({ description: 'Bairro', example: 'Centro', required: false })
  bairro?: string;

  @ApiProperty({ description: 'Cidade', example: 'São Paulo', required: false })
  cidade?: string;

  @ApiProperty({
    description: 'Estado',
    enum: SiglaEstado,
    example: SiglaEstado.SP,
    required: false,
  })
  estado?: SiglaEstado;

  @ApiProperty({ description: 'CEP', example: '01234-567', required: false })
  cep?: string;

  @ApiProperty({
    description: 'Contato',
    example: '(11) 1234-5678',
    required: false,
  })
  contato?: string;

  @ApiProperty({
    description: 'Email',
    example: 'contato@empresa.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Observações',
    example: 'Observações gerais',
    required: false,
  })
  observacao?: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({
    description: 'Motivo',
    example: 'Empresa inativa por período',
    required: false,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
