// empresas/dto/create-empresa-sistema.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
export class CreateEmpresaSistemaDto {
  @ApiProperty({
    description: 'ID da empresa vinculada ao sistema',
    example: 1,
  })
  @IsNotEmpty({ message: 'O campo empresaId é obrigatório.' })
  @IsNumber({}, { message: 'O campo empresaId deve ser um número.' })
  empresaId: number;

  @ApiProperty({
    description: 'ID do sistema vinculado à empresa',
    example: 10,
  })
  @IsNotEmpty({ message: 'O campo sistemaId é obrigatório.' })
  @IsNumber({}, { message: 'O campo sistemaId deve ser um número.' })
  sistemaId: number;

  @ApiProperty({
    description: 'Versão do sistema',
    example: 'v1.0.3',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'O campo versao é obrigatório.' })
  @IsString({ message: 'O campo versao deve ser uma string.' })
  @MinLength(1, { message: 'O campo versao não pode estar vazio.' })
  @MaxLength(50, { message: 'O campo versao pode ter no máximo 50 caracteres.' })
  versao: string;

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
    description: 'Motivo da alteração ou status do registro',
    example: 'Sistema descontinuado pela empresa.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'O campo motivo deve ser uma string.' })
  @MaxLength(500, { message: 'O campo motivo pode ter no máximo 500 caracteres.' })
  motivo?: string;
}

export class UpdateEmpresaSistemaDto extends PartialType(CreateEmpresaSistemaDto) {}

export class EmpresaSistemaResponseDto {
  @ApiProperty({ description: 'ID único do vínculo empresa-sistema', example: 123 })
  id: number;

  @ApiProperty({ description: 'ID da empresa vinculada', example: 1 })
  empresaId: number;

  @ApiProperty({ description: 'ID do sistema vinculado', example: 10 })
  sistemaId: number;

  @ApiProperty({ description: 'Versão do sistema', example: 'v2.1.0' })
  versao: string;

  @ApiProperty({
    description: 'Status atual do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiPropertyOptional({
    description: 'Motivo do status atual',
    example: 'Sistema suspenso por falta de pagamento',
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