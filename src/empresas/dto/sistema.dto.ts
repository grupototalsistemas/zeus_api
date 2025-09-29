// src/dtos/sistema/create-sistema.dto.ts
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';

export class CreateSistemaDto {
  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  empresaId: bigint;

  @ApiProperty({
    description: 'Nome do sistema',
    example: 'Sistema de Vendas',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(50, { message: 'Nome deve ter no máximo 50 caracteres' })
  nome: string;

  @ApiProperty({
    description: 'Descrição do sistema',
    example: 'Sistema para gerenciamento de vendas',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(100, { message: 'Descrição deve ter no máximo 100 caracteres' })
  descricao: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
    default: StatusRegistro.ATIVO,
  })
  @IsEnum(StatusRegistro, { message: 'Status deve ser um valor válido' })
  ativo: StatusRegistro = StatusRegistro.ATIVO;

  @ApiProperty({
    description: 'Motivo da inativação',
    example: 'Sistema descontinuado',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;
}

// src/dtos/sistema/update-sistema.dto.ts
export class UpdateSistemaDto extends PartialType(
  OmitType(CreateSistemaDto, ['empresaId'] as const),
) {}

// src/dtos/sistema/sistema-response.dto.ts
export class SistemaResponseDto {
  @ApiProperty({ description: 'ID único do sistema', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @Transform(({ value }) => value.toString())
  empresaId: string;

  @ApiProperty({ description: 'Nome do sistema', example: 'Sistema de Vendas' })
  nome: string;

  @ApiProperty({
    description: 'Descrição do sistema',
    example: 'Sistema para gerenciamento de vendas',
  })
  descricao: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({
    description: 'Motivo da inativação',
    example: 'Sistema descontinuado',
    required: false,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
