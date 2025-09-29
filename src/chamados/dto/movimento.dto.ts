// src/dtos/chamado-movimento/create-chamado-movimento.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';

export class CreateChamadoMovimentoDto {
  @ApiProperty({ description: 'ID do chamado', example: '1' })
  @IsNotEmpty({ message: 'ID do chamado é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  chamadoId: bigint;

  @ApiProperty({ description: 'ID da etapa', example: '1' })
  @IsNotEmpty({ message: 'ID da etapa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  etapaId: bigint;

  @ApiProperty({ description: 'ID do usuário', example: '1' })
  @IsNotEmpty({ message: 'ID do usuário é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  usuarioId: bigint;

  @ApiProperty({
    description: 'Ordem do movimento',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Ordem deve ser um número inteiro' })
  ordem?: number;

  @ApiProperty({
    description: 'Data e hora de início',
    example: '2024-01-01T10:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de início deve ser uma data válida' })
  inicio?: Date;

  @ApiProperty({
    description: 'Data e hora de fim',
    example: '2024-01-01T12:00:00.000Z',
    required: false,
  })
  fim?: Date;

  @ApiProperty({
    description: 'Descrição da ação',
    example: 'Análise inicial do problema',
  })
  descricaoAcao: string;

  @ApiProperty({
    description: 'Observação técnica',
    example: 'Verificados logs do sistema',
  })
  observacaoTec: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({
    description: 'Motivo da inativação',
    example: 'Movimento cancelado',
    required: false,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}

// src/dtos/chamado-movimento/update-chamado-movimento.dto.ts
export class UpdateChamadoMovimentoDto extends PartialType(
  CreateChamadoMovimentoDto,
) {}

// src/dtos/chamado-movimento/chamado-movimento-response.dto.ts
export class ChamadoMovimentoResponseDto {
  @ApiProperty({ description: 'ID único do movimento', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID do chamado', example: '1' })
  @Transform(({ value }) => value.toString())
  chamadoId: string;

  @ApiProperty({ description: 'ID da etapa', example: '1' })
  @Transform(({ value }) => value.toString())
  etapaId: string;

  @ApiProperty({ description: 'ID do usuário', example: '1' })
  @Transform(({ value }) => value.toString())
  usuarioId: string;

  @ApiProperty({
    description: 'Ordem do movimento',
    example: 1,
    required: false,
  })
  ordem?: number;

  @ApiProperty({
    description: 'Data e hora de início',
    example: '2024-01-01T10:00:00.000Z',
    required: false,
  })
  inicio?: Date;

  @ApiProperty({
    description: 'Data e hora de fim',
    example: '2024-01-01T10:00:00.000Z',
    required: false,
  })
  fim?: Date;

  @ApiProperty({
    description: 'Descrição da ação',
    example: 'Atendimento do chamado',
  })
  descricaoAcao: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({ description: 'Data de criação', required: false })
  createdAt?: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
