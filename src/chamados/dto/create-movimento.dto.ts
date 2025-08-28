import { StatusRegistro } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMovimentoDto {
  @IsNotEmpty()
  @IsNumber()
  chamadoId: number;

   @IsOptional()
  @IsString()
  etapaId: number;

  @IsNotEmpty()
  @IsNumber()
  usuarioId: number;

  @IsOptional()
  @IsNumber()
  ordem: number;

  @IsOptional()
  @IsDate()
  inicio?: Date;

  @IsOptional()
  @IsDate()
  fim?: Date;

  @IsOptional()
  @IsString()
  descricaoAcao: string;

  @IsOptional()
  @IsString()
  observacaoTec: string;

  @IsNotEmpty()
  @IsEnum(StatusRegistro)
  ativo: StatusRegistro;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsNotEmpty()
  @IsString()
  mensages?: string[];

  @IsOptional()
  @IsString({ each: true })
  anexos?: string[];
}
