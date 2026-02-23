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

export class CreateOcorrenciaTipoDto {
  @ApiProperty({ description: 'ID da empresa' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_pessoa_juridica: number;

  @ApiProperty({ description: 'Descricao do tipo de ocorrencia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descricao: string;

  @ApiProperty({ required: false, description: 'Situacao do registro' })
  @IsOptional()
  @IsInt()
  situacao?: number;

  @ApiProperty({ required: false, description: 'Motivo da alteracao' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

export class UpdateOcorrenciaTipoDto extends PartialType(
  CreateOcorrenciaTipoDto,
) {}

export class QueryOcorrenciaTipoBaseDto {
  @ApiPropertyOptional({ description: 'ID do tipo de ocorrencia' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  id?: number;

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

export class QueryOcorrenciaTipoDto extends BaseQueryDto(
  QueryOcorrenciaTipoBaseDto,
) {}
