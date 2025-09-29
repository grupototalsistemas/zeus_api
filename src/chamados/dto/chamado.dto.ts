// src/dtos/chamado/create-chamado.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';

export class CreateChamadoDto {
  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  empresaId: bigint;

  @ApiProperty({ description: 'ID do sistema', example: '1' })
  @IsNotEmpty({ message: 'ID do sistema é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  sistemaId: bigint;

  @ApiProperty({ description: 'ID da pessoa', example: '1' })
  @IsNotEmpty({ message: 'ID da pessoa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  pessoaId: bigint;

  @ApiProperty({ description: 'ID do usuário', example: '1' })
  @IsNotEmpty({ message: 'ID do usuário é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  usuarioId: bigint;

  @ApiProperty({ description: 'ID da ocorrência', example: '1' })
  @IsNotEmpty({ message: 'ID da ocorrência é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  ocorrenciaId: bigint;

  @ApiProperty({ description: 'ID da prioridade', example: '1' })
  @IsNotEmpty({ message: 'ID da prioridade é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  prioridadeId: bigint;

  @ApiProperty({
    description: 'Protocolo do chamado',
    example: 'CHM-2024-001',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Protocolo deve ser uma string' })
  @MaxLength(50, { message: 'Protocolo deve ter no máximo 50 caracteres' })
  protocolo?: string;

  @ApiProperty({
    description: 'Título do chamado',
    example: 'Erro no sistema de login',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @IsString({ message: 'Título deve ser uma string' })
  @MaxLength(100, { message: 'Título deve ter no máximo 100 caracteres' })
  titulo: string;

  @ApiProperty({
    description: 'Descrição do chamado',
    example: 'Usuário não consegue fazer login no sistema',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  descricao: string;

  @ApiProperty({
    description: 'Observação do chamado',
    example: 'Verificar logs do servidor',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Observação é obrigatória' })
  @IsString({ message: 'Observação deve ser uma string' })
  @MaxLength(500, { message: 'Observação deve ter no máximo 500 caracteres' })
  observacao: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
    default: StatusRegistro.ATIVO,
  })
  @IsEnum(StatusRegistro, { message: 'Status deve ser um valor válido' })
  ativo: StatusRegistro = StatusRegistro.ATIVO;

  @ApiProperty({
    description: 'Motivo da inativação',
    example: 'Chamado cancelado pelo usuário',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;
}

// src/dtos/chamado/update-chamado.dto.ts
export class UpdateChamadoDto extends PartialType(CreateChamadoDto) {}

// src/dtos/chamado/chamado-response.dto.ts
export class ChamadoResponseDto {
  @ApiProperty({ description: 'ID único do chamado', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @Transform(({ value }) => value.toString())
  empresaId: string;

  @ApiProperty({ description: 'ID do sistema', example: '1' })
  @Transform(({ value }) => value.toString())
  sistemaId: string;

  @ApiProperty({ description: 'ID da pessoa', example: '1' })
  @Transform(({ value }) => value.toString())
  pessoaId: string;

  @ApiProperty({ description: 'ID do usuário', example: '1' })
  @Transform(({ value }) => value.toString())
  usuarioId: string;

  @ApiProperty({ description: 'ID da ocorrência', example: '1' })
  @Transform(({ value }) => value.toString())
  ocorrenciaId: string;

  @ApiProperty({ description: 'ID da prioridade', example: '1' })
  @Transform(({ value }) => value.toString())
  prioridadeId: string;

  @ApiProperty({
    description: 'Protocolo do chamado',
    example: 'CHM-2024-001',
    required: false,
  })
  protocolo?: string;

  @ApiProperty({
    description: 'Título do chamado',
    example: 'Erro no sistema de login',
  })
  titulo: string;

  @ApiProperty({
    description: 'Descrição do chamado',
    example: 'Usuário não consegue fazer login no sistema',
  })
  descricao: string;

  @ApiProperty({
    description: 'Observação do chamado',
    example: 'Verificar logs do servidor',
  })
  observacao: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({
    description: 'Motivo da inativação',
    example: 'Chamado cancelado pelo usuário',
    required: false,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
