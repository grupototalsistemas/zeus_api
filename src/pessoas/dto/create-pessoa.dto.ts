// pessoas/dto/create-pessoa.dto.ts
import { StatusGenero, StatusRegistro } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePessoaDto {
  @IsNotEmpty()
  @IsNumber()
  empresaId: number;

  @IsNotEmpty()
  @IsNumber()
  tipoId: number;

  @IsNotEmpty()
  @IsEnum(StatusGenero)
  genero: StatusGenero = StatusGenero.NEUTRO;

  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  nomeSocial?: string;

  @IsNotEmpty()
  @IsEnum(StatusRegistro)
  ativo: StatusRegistro = StatusRegistro.ATIVO;
}
