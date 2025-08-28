import { StatusRegistro } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateChamadoPrioridadeDto {
  @IsNotEmpty()
  @IsNumber()
  empresaId: number;

  @IsNotEmpty()
  @IsString()
  cor: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Min(1) // Mínimo 1 minuto
  @Max(525600) // Máximo 1 ano em minutos
  tempo: number;

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
