// src/dtos/empresa-tipo/create-empresa-tipo.dto.ts

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';

export class CreateEmpresaTipoDto {
  @ApiProperty({
    description: 'Descrição do tipo de empresa',
    example: 'Matriz',
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
}

// src/dtos/empresa-tipo/update-empresa-tipo.dto.ts

export class UpdateEmpresaTipoDto extends PartialType(CreateEmpresaTipoDto) {}

// src/dtos/empresa-tipo/empresa-tipo-response.dto.ts
export class EmpresaTipoResponseDto {
  @ApiProperty({ description: 'ID único do tipo de empresa', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({
    description: 'Descrição do tipo de empresa',
    example: 'Matriz',
  })
  descricao: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
