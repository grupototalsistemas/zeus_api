// src/dtos/perfil/create-perfil.dto.ts

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

export class CreatePerfilDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: '1',
  })
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  empresaId: bigint;

  @ApiProperty({
    description: 'Descrição do perfil',
    example: 'Administrador',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(100, { message: 'Descrição deve ter no máximo 100 caracteres' })
  descricao: string;

  @ApiProperty({
    description: 'Status do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
    default: StatusRegistro.ATIVO,
  })
  @IsEnum(StatusRegistro, { message: 'Status deve ser um valor válido' })
  ativo: StatusRegistro = StatusRegistro.ATIVO;

  @ApiProperty({
    description: 'Motivo da inativação ou observações',
    example: 'Perfil descontinuado',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;
}

// src/dtos/perfil/update-perfil.dto.ts

export class UpdatePerfilDto extends PartialType(
  OmitType(CreatePerfilDto, ['empresaId'] as const),
) {}

// src/dtos/perfil/perfil-response.dto.ts

export class PerfilResponseDto {
  @ApiProperty({ description: 'ID único do perfil', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @Transform(({ value }) => value.toString())
  empresaId: string;

  @ApiProperty({ description: 'Descrição do perfil', example: 'Administrador' })
  descricao: string;

  @ApiProperty({
    description: 'Status do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({
    description: 'Motivo da inativação ou observações',
    example: 'Perfil descontinuado',
    required: false,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
