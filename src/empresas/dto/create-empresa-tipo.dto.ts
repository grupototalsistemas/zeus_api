// empresas/dto/empresa-tipo.dto.ts
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusRegistro } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEmpresaTipoDto {
  @ApiProperty({
    description: 'Descrição do tipo de empresa',
    example: 'Matriz',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'O campo descricao é obrigatório.' })
  @IsString({ message: 'O campo descricao deve ser uma string.' })
  @MinLength(1, { message: 'O campo descricao não pode estar vazio.' })
  @MaxLength(100, {
    message: 'O campo descricao pode ter no máximo 100 caracteres.',
  })
  descricao: string;

  @ApiProperty({
    description: 'Status do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
    default: StatusRegistro.ATIVO,
  })
  @IsNotEmpty({ message: 'O campo ativo é obrigatório.' })
  @IsEnum(StatusRegistro, {
    message: 'O campo ativo deve ser um valor válido do enum StatusRegistro.',
  })
  ativo: StatusRegistro = StatusRegistro.ATIVO;
}

export class UpdateEmpresaTipoDto extends PartialType(CreateEmpresaTipoDto) {
  // PartialType já herda os validators e torna os campos opcionais
}

export class EmpresaTipoResponseDto {
  @ApiProperty({ description: 'ID único do tipo de empresa', example: 123 })
  id: number;

  @ApiProperty({ description: 'ID da empresa vinculada', example: 1 })
  empresaId: number;

  @ApiProperty({
    description: 'Descrição do tipo de empresa',
    example: 'Filial',
  })
  descricao: string;

  @ApiProperty({
    description: 'Status do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

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
