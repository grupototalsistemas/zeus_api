// src/dtos/pessoa-usuario/create-pessoa-usuario.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';

import { Exclude, Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';

export class CreatePessoaUsuarioDto {
  @ApiProperty({
    description: 'ID da pessoa',
    example: '1',
  })
  @IsNotEmpty({ message: 'ID da pessoa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  pessoaId: bigint;

  @ApiProperty({
    description: 'ID do perfil',
    example: '1',
  })
  @IsNotEmpty({ message: 'ID do perfil é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  perfilId: bigint;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@empresa.com',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @MaxLength(150, { message: 'Email deve ter no máximo 150 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Login do usuário',
    example: 'joao.silva',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'Login é obrigatório' })
  @IsString({ message: 'Login deve ser uma string' })
  @MaxLength(150, { message: 'Login deve ter no máximo 150 caracteres' })
  @MinLength(3, { message: 'Login deve ter no mínimo 3 caracteres' })
  login: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
    maxLength: 150,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MaxLength(150, { message: 'Senha deve ter no máximo 150 caracteres' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha?: string;

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
    example: 'Usuário bloqueado temporariamente',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;
}

// src/dtos/pessoa-usuario/update-pessoa-usuario.dto.ts

export class UpdatePessoaUsuarioDto extends PartialType(
  CreatePessoaUsuarioDto,
) {}

// src/dtos/pessoa-usuario/pessoa-usuario-response.dto.ts

export class PessoaUsuarioResponseDto {
  @ApiProperty({ description: 'ID único do usuário da pessoa', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID da pessoa', example: '1' })
  @Transform(({ value }) => value.toString())
  pessoaId: string;

  @ApiProperty({ description: 'ID do perfil', example: '1' })
  @Transform(({ value }) => value.toString())
  perfilId: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@empresa.com',
  })
  email: string;

  @ApiProperty({ description: 'Login do usuário', example: 'joao.silva' })
  login: string;

  @Exclude()
  senha?: string;

  @ApiProperty({
    description: 'Status do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({
    description: 'Motivo da inativação ou observações',
    example: 'Usuário bloqueado temporariamente',
    required: false,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
