import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateChamadoDto {
  @ApiProperty({ example: 1, description: 'ID da empresa' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_pessoa_juridica: number;

  @ApiProperty({ example: 1, description: 'ID do sistema' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_sistema: number;

  @ApiProperty({ example: 1, description: 'ID da pessoa empresa' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_pessoa_empresa: number;

  @ApiProperty({ example: 1, description: 'ID do usuário' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_pessoa_usuario: number;

  @ApiProperty({ example: 1, description: 'ID da ocorrência' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_ocorrencia: number;

  @ApiProperty({ example: 1, description: 'ID da prioridade' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_prioridade: number;

  @ApiProperty({
    example: '1771613909281',
    required: false,
    description: 'Número do protocolo',
  })
  @IsOptional()
  @IsNumberString()
  protocolo?: string;

  @ApiProperty({
    example: 'Problema no sistema',
    description: 'Título do chamado',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  titulo: string;

  @ApiProperty({
    example: 'Descrição detalhada do problema',
    description: 'Descrição do chamado',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  descricao: string;

  @ApiPropertyOptional({
    example: 'Observações adicionais',
    description: 'Observação do chamado',
  })
  @IsString()
  @MaxLength(500)
  observacao?: string;

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

export class UpdateChamadoDto extends PartialType(CreateChamadoDto) {}
