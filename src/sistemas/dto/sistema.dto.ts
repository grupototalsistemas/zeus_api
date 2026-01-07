import { ApiProperty, PartialType } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Sistema } from '../entities/sistema.entity';

export class CreateSistemaDto {
  @ApiProperty({ description: 'ID da pessoa jurídica base', example: 1 })
  @IsNotEmpty({ message: 'ID da pessoa jurídica base é obrigatório' })
  @IsNumber()
  id_pessoa_juridica_base: bigint;

  @ApiProperty({ description: 'Nome do sistema', example: 'Sistema Principal' })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(50, { message: 'Nome deve ter no máximo 50 caracteres' })
  sistema: string;

  @ApiProperty({
    description: 'Descrição do sistema',
    example: 'Sistema de gestão principal',
  })
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @MaxLength(100, { message: 'Descrição deve ter no máximo 100 caracteres' })
  descricao: string;

  @ApiProperty({ description: 'Status do sistema', example: '1' })
  @IsNumber()
  @IsNotEmpty({ message: 'Status é obrigatório' })
  status_web: number;

  @ApiProperty({ description: 'Status do registro' })
  @IsNotEmpty({ message: 'Status é obrigatório' })
  @IsNumber()
  situacao: number;

  @ApiProperty({ description: 'Motivo da alteração', required: false })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;
}

export class SistemaResponseDto extends Sistema {}

export class UpdateSistemaDto extends PartialType(Sistema) {}
