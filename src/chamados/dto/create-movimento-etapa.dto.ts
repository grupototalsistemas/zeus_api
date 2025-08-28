import {
    ApiProperty,
    ApiPropertyOptional,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import { StatusRegistro } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@ApiTags('Movimentos de Etapa')
@ApiResponse({ status: 400, description: 'Requisição inválida' })
@ApiResponse({ status: 500, description: 'Erro interno do servidor' })
export class CreateMovimentoEtapaDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: 1,
    minimum: 1,
    required: true
  })
  @IsNotEmpty({ message: 'O ID da empresa é obrigatório' })
  @IsNumber({}, { message: 'O ID da empresa deve ser um número' })
  empresaId: number;

  @ApiProperty({
    description: 'Descrição do movimento de etapa',
    example: 'Movimento de aprovação da etapa inicial',
    minLength: 3,
    maxLength: 255,
    required: true
  })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @IsString({ message: 'A descrição deve ser uma string' })
  descricao: string;

  @ApiProperty({
    description: 'Status do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
    required: true
  })
  @IsNotEmpty({ message: 'O status é obrigatório' })
  @IsEnum(StatusRegistro, { message: 'Status deve ser um valor válido do enum StatusRegistro' })
  ativo: StatusRegistro;

  @ApiPropertyOptional({
    description: 'Motivo do movimento (opcional)',
    example: 'Ajuste necessário devido a mudanças no processo',
    minLength: 3,
    maxLength: 500,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'O motivo deve ser uma string' })
  motivo?: string;
}