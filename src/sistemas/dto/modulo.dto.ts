import { ApiProperty, PartialType } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Modulo } from '../entities/modulo.entity';

export class CreateModuloDto {
  @ApiProperty({ description: 'ID do módulo pai', example: -1 })
  @IsNotEmpty({ message: 'ID do módulo pai é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  id_parent: bigint;

  @ApiProperty({ description: 'Índice do menu', example: '1.1' })
  @IsString({ message: 'Índice do menu deve ser uma string' })
  @IsNotEmpty({ message: 'Índice do menu é obrigatório' })
  @MaxLength(100, {
    message: 'Índice do menu deve ter no máximo 100 caracteres',
  })
  component_index: string;

  @ApiProperty({ description: 'Texto do menu', example: 'Usuários' })
  @IsString({ message: 'Texto do menu deve ser uma string' })
  @IsNotEmpty({ message: 'Texto do menu é obrigatório' })
  @MaxLength(100, {
    message: 'Texto do menu deve ter no máximo 100 caracteres',
  })
  component_text: string;

  @ApiProperty({ description: 'Nome do menu', example: 'usuarios' })
  @IsString({ message: 'Nome do menu deve ser uma string' })
  @IsNotEmpty({ message: 'Nome do menu é obrigatório' })
  @MaxLength(100, { message: 'Nome do menu deve ter no máximo 100 caracteres' })
  component_name: string;

  @ApiProperty({ description: 'Formulário do menu', example: 'FormUsuarios' })
  @IsString({ message: 'Formulário do menu deve ser uma string' })
  @MaxLength(100, {
    message: 'Formulário do menu deve ter no máximo 100 caracteres',
  })
  name_form_page: string;

  @ApiProperty({ description: 'Evento do menu', example: 'onUsuarios' })
  @IsString({ message: 'Evento do menu deve ser uma string' })
  @IsOptional()
  @MaxLength(100, {
    message: 'Evento do menu deve ter no máximo 100 caracteres',
  })
  component_event: string;

  @ApiProperty({ description: 'Teclas de atalho', example: 'Ctrl+U' })
  @IsString({ message: 'Teclas de atalho deve ser uma string' })
  @IsOptional()
  @MaxLength(100, {
    message: 'Teclas de atalho deve ter no máximo 100 caracteres',
  })
  shortcutkeys: string;

  @ApiProperty({
    description: 'Status de visibilidade',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Status de visibilidade deve ser um número' })
  status_visible?: number;

  @ApiProperty({ description: 'Status do registro' })
  @IsNotEmpty({ message: 'Status é obrigatório' })
  @IsNumber()
  situacao: number;
}

export class ModuloResponseDto extends Modulo {}

export class UpdateModuloDto extends PartialType(CreateModuloDto) {}
