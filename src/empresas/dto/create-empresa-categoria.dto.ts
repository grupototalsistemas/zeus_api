// empresas/dto/create-empresa-categoria.dto.ts
import { StatusRegistro } from '@prisma/client';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';
// empresas/dto/update-empresa-categoria.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmpresaCategoriaDto {
  @ApiProperty({
    description: 'ID da empresa à qual a categoria pertence',
    example: 1,
    minimum: 1
  })
  @IsNotEmpty({ message: 'O ID da empresa é obrigatório' })
  @IsNumber({}, { message: 'O ID da empresa deve ser um número' })
  @Min(1, { message: 'O ID da empresa deve ser maior que zero' })
  empresaId: number;

  @ApiProperty({
    description: 'Descrição da categoria',
    example: 'Categoria de Produtos Eletrônicos',
    maxLength: 100
  })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @IsString({ message: 'A descrição deve ser uma string' })
  @MaxLength(100, { message: 'A descrição não pode ter mais de 100 caracteres' })
  descricao: string;

  @ApiPropertyOptional({
    description: 'Status da categoria',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
    default: StatusRegistro.ATIVO
  })
  @IsOptional()
  @IsEnum(StatusRegistro, { 
    message: 'O status deve ser ATIVO ou INATIVO' 
  })
  ativo: StatusRegistro = StatusRegistro.ATIVO;
}

export class UpdateEmpresaCategoriaDto extends PartialType(CreateEmpresaCategoriaDto) {}

export class EmpresaCategoriaResponseDto {
  @ApiProperty({
    description: 'ID único da categoria',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'ID da empresa à qual a categoria pertence',
    example: 1
  })
  empresaId: number;

  @ApiProperty({
    description: 'Descrição da categoria',
    example: 'Categoria de Produtos Eletrônicos',
    maxLength: 100
  })
  descricao: string;

  @ApiProperty({
    description: 'Status da categoria',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO
  })
  ativo: StatusRegistro;

  @ApiProperty({
    description: 'Data de criação da categoria',
    example: '2023-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização da categoria',
    example: '2023-01-02T00:00:00.000Z',
    required: false
  })
  updatedAt?: Date;
}