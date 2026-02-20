import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

export class CreateOcorrenciaDto {
  @ApiProperty({ description: 'ID do tipo de ocorrência' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_ocorrencia_tipo: number;

  @ApiProperty({ description: 'ID da empresa' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_pessoa_juridica: number;

  @ApiProperty({
    description: 'Descrição da ocorrência',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descricao: string;

  @ApiProperty({
    required: false,
    description: 'Situação do registro',
  })
  @IsOptional()
  @IsInt()
  situacao?: number;

  @ApiProperty({ required: false, description: 'Motivo da alteração' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

export class UpdateOcorrenciaDto extends PartialType(CreateOcorrenciaDto) {}

export class QueryOcorrenciaBaseDto {
  @ApiPropertyOptional({ description: 'ID da ocorrência' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id?: number;

  @ApiPropertyOptional({ description: 'ID do tipo de ocorrência' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_ocorrencia_tipo?: number;

  @ApiPropertyOptional({ description: 'ID da empresa' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id_pessoa_juridica?: number;

  @ApiPropertyOptional({ description: 'Filtrar por descricao (parcial)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;
}

export class QueryOcorrenciaDto extends BaseQueryDto(QueryOcorrenciaBaseDto) {}
