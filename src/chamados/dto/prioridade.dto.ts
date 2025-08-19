import { StatusRegistro } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinDate,
} from 'class-validator';

export class CreateChamadoPrioridadeDto {
  @IsNotEmpty()
  @IsNumber()
  empresaId: number;

  @IsNotEmpty()
  @IsString()
  cor: string;

  @IsNotEmpty()
  @IsDate()
  @MinDate(new Date())
  @Type(() => Date)
  tempo: Date;

  @IsNotEmpty()
  @IsEnum(StatusRegistro)
  ativo: StatusRegistro;

  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}
