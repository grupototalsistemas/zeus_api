import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

export class CreatePrioridadeDto {
  @ApiProperty({ description: 'ID da empresa' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_pessoa_juridica: number;

  @ApiProperty({ description: 'Descrição da prioridade' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descricao: string;

  @ApiProperty({
    description: 'Cor da prioridade em hexadecimal',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(7)
  @Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
    message: 'A cor deve estar em formato hexadecimal (ex: #FF0000)',
  })
  cor: string;

  @ApiProperty({
    description: 'Tempo de resolução esperado em minutos',
  })
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(525600)
  tempoResolucao: number;

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

export class UpdatePrioridadeDto extends PartialType(CreatePrioridadeDto) {}

export class QueryPrioridadeBaseDto {
  @ApiPropertyOptional({ description: 'ID da prioridade' })
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

  @ApiPropertyOptional({
    description: 'Filtrar por descricao (parcial)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por cor hexadecimal',
  })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  @Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
    message: 'A cor deve estar em formato hexadecimal (ex: #FF0000)',
  })
  cor?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tempo de resolucao exato (minutos)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  tempoResolucao?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por tempo de resolucao minimo (minutos)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tempoResolucaoMin?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por tempo de resolucao maximo (minutos)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  tempoResolucaoMax?: number;
}

export class QueryPrioridadeDto extends BaseQueryDto(QueryPrioridadeBaseDto) {}
