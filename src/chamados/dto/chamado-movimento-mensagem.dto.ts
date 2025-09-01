import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StatusRegistro } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateChamadoMovimentoMensagemDto {
  @ApiProperty({
    description: 'ID do movimento do chamado',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do movimento é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  movimentoId: bigint;

  @ApiProperty({
    description: 'ID do usuário que enviou a mensagem',
    example: 1,
  })
  @IsNotEmpty({ message: 'ID do usuário de envio é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  usuarioEnvioId: bigint;

  @ApiProperty({
    description: 'ID do usuário que leu a mensagem',
    example: 2,
  })
  @IsNotEmpty({ message: 'ID do usuário de leitura é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  usuarioLeituraId: bigint;

  @ApiPropertyOptional({
    description: 'Ordem da mensagem na sequência',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um número inteiro' })
  @Min(1, { message: 'Ordem deve ser maior que zero' })
  @Type(() => Number)
  ordem?: number;

  @ApiProperty({
    description: 'Descrição/conteúdo da mensagem',
    example: 'Mensagem de retorno sobre o atendimento do chamado',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString({ message: 'Descrição deve ser um texto' })
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  descricao: string;

  @ApiPropertyOptional({
    description: 'Data e hora do envio da mensagem',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsOptional()
  @IsDate({ message: 'Data de envio deve ser uma data válida' })
  @Type(() => Date)
  envio?: Date;

  @ApiPropertyOptional({
    description: 'Data e hora da leitura da mensagem',
    example: '2024-01-15T11:00:00.000Z',
  })
  @IsOptional()
  @IsDate({ message: 'Data de leitura deve ser uma data válida' })
  @Type(() => Date)
  leitura?: Date;

  @ApiPropertyOptional({
    description: 'Status do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
    default: StatusRegistro.ATIVO,
  })
  @IsOptional()
  @IsEnum(StatusRegistro, { message: 'Status deve ser um valor válido' })
  ativo?: StatusRegistro = StatusRegistro.ATIVO;

  @ApiPropertyOptional({
    description: 'Motivo de alteração do status',
    example: 'Mensagem arquivada por conclusão do chamado',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser um texto' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;
}

export class UpdateChamadoMovimentoMensagemDto extends PartialType(
  CreateChamadoMovimentoMensagemDto,
) {
  @ApiPropertyOptional({
    description: 'ID do movimento do chamado',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? BigInt(value) : undefined))
  movimentoId?: bigint;

  @ApiPropertyOptional({
    description: 'ID do usuário que enviou a mensagem',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? BigInt(value) : undefined))
  usuarioEnvioId?: bigint;

  @ApiPropertyOptional({
    description: 'ID do usuário que leu a mensagem',
    example: 2,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? BigInt(value) : undefined))
  usuarioLeituraId?: bigint;
}

export class ChamadoMovimentoMensagemResponseDto {
  @ApiProperty({
    description: 'ID único da mensagem',
    example: 1,
  })
  id: bigint;

  @ApiProperty({
    description: 'ID do movimento do chamado',
    example: 1,
  })
  movimentoId: bigint;

  @ApiProperty({
    description: 'ID do usuário que enviou a mensagem',
    example: 1,
  })
  usuarioEnvioId: bigint;

  @ApiProperty({
    description: 'ID do usuário que leu a mensagem',
    example: 2,
  })
  usuarioLeituraId: bigint;

  @ApiPropertyOptional({
    description: 'Ordem da mensagem na sequência',
    example: 1,
  })
  ordem?: number;

  @ApiProperty({
    description: 'Descrição/conteúdo da mensagem',
    example: 'Mensagem de retorno sobre o atendimento do chamado',
  })
  descricao: string;

  @ApiPropertyOptional({
    description: 'Data e hora do envio da mensagem',
    example: '2024-01-15T10:30:00.000Z',
  })
  envio?: Date;

  @ApiPropertyOptional({
    description: 'Data e hora da leitura da mensagem',
    example: '2024-01-15T11:00:00.000Z',
  })
  leitura?: Date;

  @ApiProperty({
    description: 'Status do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiPropertyOptional({
    description: 'Motivo de alteração do status',
    example: 'Mensagem arquivada por conclusão do chamado',
  })
  motivo?: string;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2024-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Data de última atualização do registro',
    example: '2024-01-15T12:00:00.000Z',
  })
  updatedAt?: Date;
}

export class ChamadoMovimentoMensagemQueryDto {
  @ApiPropertyOptional({
    description: 'ID do movimento para filtrar mensagens',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? BigInt(value) : undefined))
  movimentoId?: bigint;

  @ApiPropertyOptional({
    description: 'ID do usuário de envio para filtrar mensagens',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? BigInt(value) : undefined))
  usuarioEnvioId?: bigint;

  @ApiPropertyOptional({
    description: 'ID do usuário de leitura para filtrar mensagens',
    example: 2,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? BigInt(value) : undefined))
  usuarioLeituraId?: bigint;

  @ApiPropertyOptional({
    description: 'Status do registro para filtro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  @IsOptional()
  @IsEnum(StatusRegistro, { message: 'Status deve ser um valor válido' })
  ativo?: StatusRegistro;

  @ApiPropertyOptional({
    description: 'Página para paginação',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @IsPositive({ message: 'Página deve ser maior que zero' })
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsInt({ message: 'Limite deve ser um número inteiro' })
  @Min(1, { message: 'Limite deve ser maior que zero' })
  @Type(() => Number)
  limit?: number = 10;
}
