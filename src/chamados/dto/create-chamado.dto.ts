// chamados/dto/create-chamado.dto.ts
import { StatusRegistro } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateChamadoDto {
  @IsNotEmpty()
  @IsNumber()
  empresaId: number;

  @IsNotEmpty()
  @IsNumber()
  sistemaId: number;

  @IsNotEmpty()
  @IsNumber()
  pessoaId: number;

  @IsNotEmpty()
  @IsNumber()
  usuarioId: number;

  @IsNotEmpty()
  @IsNumber()
  ocorrenciaId: number;

  @IsNotEmpty()
  @IsNumber()
  prioridadeId: number;

  @IsOptional()
  protocolo?: number;

  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsNotEmpty()
  @IsString()
  observacao: string = '';

  @IsNotEmpty()
  @IsEnum(StatusRegistro)
  ativo: StatusRegistro = StatusRegistro.ATIVO;
}
