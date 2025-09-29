// src/dtos/pessoa/create-pessoa.dto.ts
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { StatusGenero } from 'src/common/enums/status-genero.enum';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';

export class CreatePessoaDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: '1',
  })
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  empresaId: bigint;

  @ApiProperty({
    description: 'ID do tipo da pessoa',
    example: '1',
  })
  @IsNotEmpty({ message: 'ID do tipo da pessoa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  tipoId: bigint;

  @ApiProperty({
    description: 'Gênero da pessoa',
    enum: StatusGenero,
    example: StatusGenero.IGNORADO,
  })
  @IsEnum(StatusGenero, { message: 'Gênero deve ser um valor válido' })
  genero: StatusGenero;

  @ApiProperty({
    description: 'Nome da pessoa',
    example: 'João Silva',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(150, { message: 'Nome deve ter no máximo 150 caracteres' })
  nome: string;

  @ApiProperty({
    description: 'Nome social da pessoa',
    example: 'João',
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome social deve ser uma string' })
  @MaxLength(150, { message: 'Nome social deve ter no máximo 150 caracteres' })
  nomeSocial?: string;

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
    example: 'Transferido para outra unidade',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;
}

// src/dtos/pessoa/update-pessoa.dto.ts

export class UpdatePessoaDto extends PartialType(
  OmitType(CreatePessoaDto, ['empresaId'] as const),
) {}

// src/dtos/pessoa/pessoa-response.dto.ts

export class PessoaResponseDto {
  @ApiProperty({ description: 'ID único da pessoa', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @Transform(({ value }) => value.toString())
  empresaId: string;

  @ApiProperty({ description: 'ID do tipo da pessoa', example: '1' })
  @Transform(({ value }) => value.toString())
  tipoId: string;

  @ApiProperty({
    description: 'Gênero da pessoa',
    enum: StatusGenero,
    example: StatusGenero.IGNORADO,
  })
  genero: StatusGenero;

  @ApiProperty({ description: 'Nome da pessoa', example: 'João Silva' })
  nome: string;

  @ApiProperty({
    description: 'Nome social da pessoa',
    example: 'João',
    required: false,
  })
  nomeSocial?: string;

  @ApiProperty({
    description: 'Status do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({
    description: 'Motivo da inativação ou observações',
    example: 'Transferido para outra unidade',
    required: false,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
