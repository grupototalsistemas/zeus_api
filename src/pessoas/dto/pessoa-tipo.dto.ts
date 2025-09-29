// src/dtos/pessoa-tipo/create-pessoa-tipo.dto.ts

import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';

export class CreatePessoaTipoDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: '1',
  })
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  empresaId: bigint;

  @ApiProperty({
    description: 'Descrição do tipo de pessoa',
    example: 'Funcionário',
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
}

// src/dtos/pessoa-tipo/update-pessoa-tipo.dto.ts

export class UpdatePessoaTipoDto extends PartialType(
  OmitType(CreatePessoaTipoDto, ['empresaId'] as const),
) {}

// src/dtos/pessoa-tipo/pessoa-tipo-response.dto.ts

export class PessoaTipoResponseDto {
  @ApiProperty({ description: 'ID único do tipo de pessoa', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @Transform(({ value }) => value.toString())
  empresaId: string;

  @ApiProperty({
    description: 'Descrição do tipo de pessoa',
    example: 'Funcionário',
  })
  descricao: string;

  @ApiProperty({
    description: 'Status do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
