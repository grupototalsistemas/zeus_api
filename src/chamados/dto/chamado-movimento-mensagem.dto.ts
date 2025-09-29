// src/dtos/chamado-movimento-mensagem/create-chamado-movimento-mensagem.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';

export class CreateChamadoMovimentoMensagemDto {
  @ApiProperty({ description: 'ID do movimento', example: '1' })
  @IsNotEmpty({ message: 'ID do movimento é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  movimentoId: bigint;

  @ApiProperty({ description: 'ID do usuário que envia', example: '1' })
  @IsNotEmpty({ message: 'ID do usuário de envio é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  usuarioEnvioId: bigint;

  @ApiProperty({ description: 'ID do usuário que lê', example: '2' })
  @IsNotEmpty({ message: 'ID do usuário de leitura é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  usuarioLeituraId: bigint;

  @ApiProperty({
    description: 'Ordem da mensagem',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Ordem deve ser um número inteiro' })
  ordem?: number;

  @ApiProperty({
    description: 'Descrição da mensagem',
    example: 'Problema foi identificado e será corrigido',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  descricao: string;

  @ApiProperty({
    description: 'Data e hora de envio',
    example: '2024-01-01T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de envio deve ser uma data válida' })
  envio?: Date;

  @ApiProperty({
    description: 'Data e hora de leitura',
    example: '2024-01-01T10:15:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de leitura deve ser uma data válida' })
  leitura?: Date;

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
    example: 'Mensagem deletada',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;
}

// src/dtos/chamado-movimento-mensagem/update-chamado-movimento-mensagem.dto.ts
export class UpdateChamadoMovimentoMensagemDto extends PartialType(
  CreateChamadoMovimentoMensagemDto,
) {}

// src/dtos/chamado-movimento-mensagem/chamado-movimento-mensagem-response.dto.ts
export class ChamadoMovimentoMensagemResponseDto {
  @ApiProperty({ description: 'ID único da mensagem', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID do movimento', example: '1' })
  @Transform(({ value }) => value.toString())
  movimentoId: string;

  @ApiProperty({ description: 'ID do usuário que envia', example: '1' })
  @Transform(({ value }) => value.toString())
  usuarioEnvioId: string;

  @ApiProperty({ description: 'ID do usuário que lê', example: '2' })
  @Transform(({ value }) => value.toString())
  usuarioLeituraId: string;

  @ApiProperty({
    description: 'Ordem da mensagem',
    example: 1,
    required: false,
  })
  ordem?: number;

  @ApiProperty({
    description: 'Descrição da mensagem',
    example: 'Problema foi identificado e será corrigido',
  })
  descricao: string;

  @ApiProperty({
    description: 'Data e hora de envio',
    example: '2024-01-01T10:00:00.000Z',
    required: false,
  })
  envio?: Date;

  @ApiProperty({
    description: 'Data e hora de leitura',
    example: '2024-01-01T10:15:00.000Z',
    required: false,
  })
  leitura?: Date;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({
    description: 'Motivo da inativação',
    example: 'Mensagem deletada',
    required: false,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;

  @IsOptional()
  @IsDateString({}, { message: 'Data de fim deve ser uma data válida' })
  fim?: Date;

  @ApiProperty({
    description: 'Descrição da ação',
    example: 'Análise inicial do problema',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Descrição da ação é obrigatória' })
  @IsString({ message: 'Descrição da ação deve ser uma string' })
  @MaxLength(500, {
    message: 'Descrição da ação deve ter no máximo 500 caracteres',
  })
  descricaoAcao: string;

  @ApiProperty({
    description: 'Observação técnica',
    example: 'Verificados logs do sistema',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Observação técnica é obrigatória' })
  @IsString({ message: 'Observação técnica deve ser uma string' })
  @MaxLength(500, {
    message: 'Observação técnica deve ter no máximo 500 caracteres',
  })
  observacaoTec: string;
}
