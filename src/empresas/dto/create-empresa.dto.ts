// empresas/dto/empresa.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SiglaEstado, StatusRegistro } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEmpresaDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O campo id deve ser um número.' })
  id?: number;

  @ApiProperty({
    description: 'CNPJ da empresa',
    example: '12.345.678/0001-90',
  })
  @IsNotEmpty({ message: 'O campo cnpj é obrigatório.' })
  @IsString({ message: 'O campo cnpj deve ser uma string.' })
  @MinLength(14, { message: 'O campo cnpj deve ter no mínimo 14 caracteres.' })
  @MaxLength(18, { message: 'O campo cnpj pode ter no máximo 18 caracteres.' })
  cnpj: string;

  @ApiProperty({
    description: 'Razão social da empresa',
    example: 'Empresa de Exemplo LTDA',
  })
  @IsNotEmpty({ message: 'O campo razaoSocial é obrigatório.' })
  @IsString({ message: 'O campo razaoSocial deve ser uma string.' })
  @MaxLength(255, {
    message: 'O campo razaoSocial pode ter no máximo 255 caracteres.',
  })
  razaoSocial: string;

  @ApiProperty({
    description: 'Nome fantasia da empresa',
    example: 'Exemplo Tech',
  })
  @IsNotEmpty({ message: 'O campo nomeFantasia é obrigatório.' })
  @IsString({ message: 'O campo nomeFantasia deve ser uma string.' })
  @MaxLength(255, {
    message: 'O campo nomeFantasia pode ter no máximo 255 caracteres.',
  })
  nomeFantasia: string;

  @ApiPropertyOptional({
    description: 'ID da empresa matriz (caso exista)',
    example: 50,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O campo parentId deve ser um número.' })
  parentId?: number;

  @ApiPropertyOptional({
    description: 'Código interno da empresa',
    example: 'EMP-001',
  })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Logradouro da empresa',
    example: 'Rua das Palmeiras',
  })
  @IsOptional()
  @IsString()
  logradouro?: string;

  @ApiPropertyOptional({
    description: 'Endereço completo',
    example: 'Av. Paulista',
  })
  @IsOptional()
  @IsString()
  endereco?: string;

  @ApiPropertyOptional({ description: 'Número do endereço', example: '1234' })
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiPropertyOptional({
    description: 'Complemento do endereço',
    example: 'Sala 5',
  })
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiPropertyOptional({ description: 'Bairro da empresa', example: 'Centro' })
  @IsOptional()
  @IsString()
  bairro?: string;

  @ApiPropertyOptional({ description: 'CEP da empresa', example: '01000-000' })
  @IsOptional()
  @IsString()
  cep?: string;

  @ApiPropertyOptional({
    description: 'Cidade da empresa',
    example: 'São Paulo',
  })
  @IsOptional()
  @IsString()
  cidade?: string;

  @ApiPropertyOptional({
    description: 'Nome do contato principal',
    example: 'João Silva',
  })
  @IsOptional()
  @IsString()
  contato?: string;

  @ApiPropertyOptional({
    description: 'Telefone da empresa',
    example: '(11) 99999-9999',
  })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({
    description: 'Email da empresa',
    example: 'contato@empresa.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'O campo email deve ser um email válido.' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Observações adicionais sobre a empresa',
    example: 'Aberto aos sábados',
  })
  @IsOptional()
  @IsString()
  observacao?: string;

  @ApiPropertyOptional({
    description: 'Motivo do status da empresa',
    example: 'Empresa suspensa por inadimplência',
  })
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiPropertyOptional({
    description: 'Estado (sigla) onde a empresa está localizada',
    enum: SiglaEstado,
    example: 'SP',
  })
  @IsOptional()
  @IsEnum(SiglaEstado, {
    message: 'O campo estado deve ser uma sigla de estado válida.',
  })
  estado?: SiglaEstado;

  @ApiProperty({
    description: 'Status do registro da empresa',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
    default: StatusRegistro.ATIVO,
  })
  @IsNotEmpty({ message: 'O campo ativo é obrigatório.' })
  @IsEnum(StatusRegistro, {
    message: 'O campo ativo deve ser um valor válido do enum StatusRegistro.',
  })
  ativo: StatusRegistro = StatusRegistro.ATIVO;

  @ApiProperty({
    description: 'ID do tipo da empresa',
    example: 2,
  })
  @IsNotEmpty({ message: 'O campo tipoId é obrigatório.' })
  @IsNumber({}, { message: 'O campo tipoId deve ser um número.' })
  tipoId: number;

  @ApiProperty({
    description: 'ID da categoria da empresa',
    example: 5,
  })
  @IsNotEmpty({ message: 'O campo categoriaId é obrigatório.' })
  @IsNumber({}, { message: 'O campo categoriaId deve ser um número.' })
  categoriaId: number;

  // Timestamps gerenciados pelo banco de dados
  @ApiPropertyOptional({
    description: 'Data de criação do registro',
    example: '2023-10-05T14:48:00.000Z',
  })
  @IsOptional()
  createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Data da última atualização do registro',
    example: '2023-10-10T10:20:30.000Z',
  })
  @IsOptional()
  updatedAt?: Date;
}

// Update herda de Create e deixa tudo opcional
export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {}
