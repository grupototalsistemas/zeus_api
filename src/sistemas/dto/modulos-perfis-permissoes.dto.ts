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

export class CreateModuloPerfilPermissaoDto {
  @ApiProperty({
    description: 'ID do módulo',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do módulo é obrigatório' })
  @IsNumber()
  @Type(() => Number)
  id_modulo: number;

  @ApiProperty({
    description: 'ID do perfil da pessoa jurídica',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do perfil é obrigatório' })
  @IsNumber()
  @Type(() => Number)
  id_pessoa_juridica_perfil: number;

  @ApiProperty({
    description: 'Permissão de inserção',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  action_insert?: number;

  @ApiProperty({
    description: 'Permissão de atualização',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  action_update?: number;

  @ApiProperty({
    description: 'Permissão de pesquisa',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  action_search?: number;

  @ApiProperty({
    description: 'Permissão de exclusão',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  action_delete?: number;

  @ApiProperty({
    description: 'Permissão de impressão',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  action_print?: number;
}

export class CreateModulosPerfisPermissoesDto {
  @ApiProperty({
    description: 'Lista de permissões a serem criadas',
    type: [CreateModuloPerfilPermissaoDto],
    example: [
      {
        id_modulo: 1,
        id_pessoa_juridica_perfil: 1,
        action_insert: 1,
        action_update: 1,
        action_search: 1,
        action_delete: 1,
        action_print: 1,
      },
      {
        id_modulo: 2,
        id_pessoa_juridica_perfil: 1,
        action_insert: 0,
        action_update: 0,
        action_search: 1,
        action_delete: 0,
        action_print: 1,
      },
    ],
  })
  @IsArray({ message: 'Deve ser um array de permissões' })
  @ValidateNested({ each: true })
  @Type(() => CreateModuloPerfilPermissaoDto)
  permissoes: CreateModuloPerfilPermissaoDto[];
}

export class UpdateModuloPerfilPermissaoDto {
  @ApiProperty({
    description: 'Permissão de inserção',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  action_insert?: number;

  @ApiProperty({
    description: 'Permissão de atualização',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  action_update?: number;

  @ApiProperty({
    description: 'Permissão de pesquisa',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  action_search?: number;

  @ApiProperty({
    description: 'Permissão de exclusão',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  action_delete?: number;

  @ApiProperty({
    description: 'Permissão de impressão',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  action_print?: number;

  @ApiProperty({
    description: 'Situação da permissão',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  situacao?: number;

  @ApiProperty({
    description: 'Motivo da alteração',
    example: 'Permissão revogada por motivo de segurança',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;
}

export class DeleteModuloPerfilPermissaoDto {
  @ApiProperty({
    description: 'Motivo da exclusão',
    example: 'Perfil não necessita mais desta permissão',
  })
  @IsNotEmpty({ message: 'Motivo da exclusão é obrigatório' })
  @IsString()
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo: string;
}
