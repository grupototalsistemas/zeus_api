import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOcorrenciaDto {
  @ApiProperty({ example: 1, description: 'ID do tipo de ocorrência' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_ocorrencia_tipo: number;

  @ApiProperty({ example: 1, description: 'ID da empresa' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_pessoa_juridica: number;

  @ApiProperty({
    example: 'Erro no sistema',
    description: 'Descrição da ocorrência',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descricao: string;

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

export class UpdateOcorrenciaDto extends PartialType(CreateOcorrenciaDto) {}
