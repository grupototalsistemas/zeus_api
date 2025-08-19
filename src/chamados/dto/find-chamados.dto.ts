// import { StatusMovimento } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

// Define StatusMovimento enum here if not available from @prisma/client
export enum StatusMovimento {
  ABERTO = 'ABERTO',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  FECHADO = 'FECHADO',
}

export class FindChamadosDto extends PaginationQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  empresaId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sistemaId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pessoaId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  usuarioId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  ocorrenciaId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  prioridadeId?: number;

  @IsOptional()
  @IsEnum(StatusMovimento)
  status?: StatusMovimento;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;
}
