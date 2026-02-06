import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateChamadoMovimentoDto {
  @ApiProperty({ example: 1, description: 'ID do chamado' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_chamado: number;

  @ApiProperty({ example: 1, description: 'ID da etapa do movimento' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_chamado_movimento_etapa: number;

  @ApiProperty({ example: 1, description: 'ID do usuário' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_pessoa_usuario: number;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Ordem do movimento',
  })
  @IsOptional()
  @IsInt()
  ordem?: number;

  @ApiProperty({
    example: '2024-01-01T10:00:00Z',
    required: false,
    description: 'Data e hora de início',
  })
  @IsOptional()
  @IsDateString()
  dataHoraInicio?: string;

  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    required: false,
    description: 'Data e hora de fim',
  })
  @IsOptional()
  @IsDateString()
  dataHoraFim?: string;

  @ApiProperty({
    example: 'Ação realizada no chamado',
    description: 'Descrição da ação',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  descricaoAcao: string;

  @ApiProperty({
    example: 'Observações técnicas',
    description: 'Observação técnica',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  observacaoTecnica: string;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Situação do registro',
  })
  @IsOptional()
  @IsInt()
  situacao?: number;

  @ApiProperty({ example: 'Motivo da alteração', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

export class UpdateChamadoMovimentoDto extends PartialType(
  CreateChamadoMovimentoDto,
) {}
