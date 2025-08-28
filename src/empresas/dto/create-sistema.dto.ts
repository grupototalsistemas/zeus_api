// sistemas/dto/sistema.dto.ts
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusRegistro } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSistemaDto {
  @ApiProperty({
    description: 'ID da empresa à qual o sistema pertence',
    example: 1,
  })
  @IsNotEmpty({ message: 'O campo empresaId é obrigatório.' })
  @IsNumber({}, { message: 'O campo empresaId deve ser um número.' })
  empresaId: number;

  @ApiProperty({
    description: 'Nome do sistema',
    example: 'ERP Financeiro',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'O campo nome é obrigatório.' })
  @IsString({ message: 'O campo nome deve ser uma string.' })
  @MinLength(1, { message: 'O campo nome não pode estar vazio.' })
  @MaxLength(50, { message: 'O campo nome pode ter no máximo 50 caracteres.' })
  nome: string;

  @ApiProperty({
    description: 'Descrição detalhada do sistema',
    example: 'Sistema de gestão financeira integrado',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'O campo descricao é obrigatório.' })
  @IsString({ message: 'O campo descricao deve ser uma string.' })
  @MinLength(1, { message: 'O campo descricao não pode estar vazio.' })
  @MaxLength(100, { message: 'O campo descricao pode ter no máximo 100 caracteres.' })
  descricao: string;

  @ApiProperty({
    description: 'Status do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
    default: StatusRegistro.ATIVO,
  })
  @IsNotEmpty({ message: 'O campo ativo é obrigatório.' })
  @IsEnum(StatusRegistro, { message: 'O campo ativo deve ser um valor válido do enum StatusRegistro.' })
  ativo: StatusRegistro = StatusRegistro.ATIVO;

  @ApiPropertyOptional({
    description: 'Motivo para a situação atual do sistema',
    example: 'Sistema descontinuado pela empresa.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'O campo motivo deve ser uma string.' })
  @MaxLength(500, { message: 'O campo motivo pode ter no máximo 500 caracteres.' })
  motivo?: string;
}

export class UpdateSistemaDto extends PartialType(CreateSistemaDto) {

  // PartialType já herda os validators e os torna opcionais
}

export class SistemaResponseDto {
  @ApiProperty({ description: 'ID único do sistema', example: 101 })
  id: number;

  @ApiProperty({ description: 'ID da empresa vinculada ao sistema', example: 1 })
  empresaId: number;

  @ApiProperty({ description: 'Nome do sistema', example: 'ERP Financeiro' })
  nome: string;

  @ApiProperty({
    description: 'Descrição detalhada do sistema',
    example: 'Sistema de gestão financeira integrado',
  })
  descricao: string;

  @ApiProperty({
    description: 'Status atual do sistema',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiPropertyOptional({
    description: 'Motivo do status do sistema',
    example: 'Sistema suspenso por falta de atualização',
  })
  motivo?: string;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2025-08-23T12:34:56.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Data da última atualização',
    example: '2025-08-23T15:45:10.000Z',
  })
  updatedAt?: Date;
}
