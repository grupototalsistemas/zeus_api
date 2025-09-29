import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';

// src/dtos/empresa-sistema/create-empresa-sistema.dto.ts
export class CreateEmpresaSistemaDto {
  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  empresaId: bigint;

  @ApiProperty({ description: 'ID do sistema', example: '1' })
  @IsNotEmpty({ message: 'ID do sistema é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  sistemaId: bigint;

  @ApiProperty({
    description: 'Versão do sistema',
    example: '1.0.0',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Versão é obrigatória' })
  @IsString({ message: 'Versão deve ser uma string' })
  @MaxLength(50, { message: 'Versão deve ter no máximo 50 caracteres' })
  versao: string;

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
    example: 'Versão descontinuada',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;
}

// src/dtos/empresa-sistema/update-empresa-sistema.dto.ts

export class UpdateEmpresaSistemaDto extends PartialType(
  CreateEmpresaSistemaDto,
) {}

// src/dtos/empresa-sistema/empresa-sistema-response.dto.ts

export class EmpresaSistemaResponseDto {
  @ApiProperty({ description: 'ID único da relação', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @Transform(({ value }) => value.toString())
  empresaId: string;

  @ApiProperty({ description: 'ID do sistema', example: '1' })
  @Transform(({ value }) => value.toString())
  sistemaId: string;

  @ApiProperty({ description: 'Versão do sistema', example: '1.0.0' })
  versao: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({
    description: 'Motivo da inativação',
    example: 'Versão descontinuada',
    required: false,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
