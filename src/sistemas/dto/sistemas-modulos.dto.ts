import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateSistemaModuloDto {
  @ApiProperty({
    description: 'ID do sistema',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do sistema é obrigatório' })
  @IsNumber()
  @Type(() => Number)
  id_sistema: number;

  @ApiProperty({
    description: 'ID do módulo principal',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do módulo principal é obrigatório' })
  @IsNumber()
  @Type(() => Number)
  id_modulo_principal: number;
}

export class CreateSistemasModulosDto {
  @ApiProperty({
    description: 'Lista de módulos a serem vinculados ao sistema',
    type: [CreateSistemaModuloDto],
    example: [
      {
        id_sistema: 1,
        id_modulo_principal: 1,
      },
      {
        id_sistema: 1,
        id_modulo_principal: 2,
      },
    ],
  })
  @IsArray({ message: 'Deve ser um array de módulos' })
  @ValidateNested({ each: true })
  @Type(() => CreateSistemaModuloDto)
  modulos: CreateSistemaModuloDto[];
}

export class UpdateSistemaModuloDto {
  @ApiProperty({
    description: 'ID do módulo principal',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id_modulo_principal?: number;

  @ApiProperty({
    description: 'Situação do vínculo',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  situacao?: number;

  @ApiProperty({
    description: 'Motivo da alteração',
    example: 'Módulo descontinuado',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;
}

export class DeleteSistemaModuloDto {
  @ApiProperty({
    description: 'Motivo da exclusão',
    example: 'Módulo não será mais utilizado neste sistema',
  })
  @IsNotEmpty({ message: 'Motivo da exclusão é obrigatório' })
  @IsString()
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo: string;
}
