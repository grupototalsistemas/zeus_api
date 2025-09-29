// src/dtos/prioridade/create-prioridade.dto.ts
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';

export class CreatePrioridadeDto {
  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  empresaId: bigint;

  @ApiProperty({
    description: 'Descrição da prioridade',
    example: 'Alta',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(100, { message: 'Descrição deve ter no máximo 100 caracteres' })
  descricao: string;

  @ApiProperty({
    description: 'Cor da prioridade (hex)',
    example: '#FF0000',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Cor é obrigatória' })
  @IsString({ message: 'Cor deve ser uma string' })
  @MaxLength(100, { message: 'Cor deve ter no máximo 100 caracteres' })
  cor: string;

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
    example: 'Prioridade descontinuada',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;

  @ApiProperty({
    description: 'Tempo de resolução em horas',
    example: 24,
    default: 0,
  })
  @Type(() => Number)
  @IsInt({ message: 'Tempo deve ser um número inteiro' })
  @Min(0, { message: 'Tempo deve ser maior ou igual a 0' })
  tempo: number = 0;
}

// src/dtos/prioridade/update-prioridade.dto.ts
export class UpdatePrioridadeDto extends PartialType(
  OmitType(CreatePrioridadeDto, ['empresaId'] as const),
) {}

// src/dtos/prioridade/prioridade-response.dto.ts
export class PrioridadeResponseDto {
  @ApiProperty({ description: 'ID único da prioridade', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @Transform(({ value }) => value.toString())
  empresaId: string;

  @ApiProperty({ description: 'Descrição da prioridade', example: 'Alta' })
  descricao: string;

  @ApiProperty({ description: 'Cor da prioridade', example: '#FF0000' })
  cor: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({
    description: 'Motivo da inativação',
    example: 'Prioridade descontinuada',
    required: false,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;

  @ApiProperty({ description: 'Tempo de resolução em horas', example: 24 })
  tempo: number;
}
