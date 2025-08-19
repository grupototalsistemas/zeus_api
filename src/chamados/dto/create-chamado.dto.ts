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

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  movimento?: {
    etapaId: number;
    ordem?: number;
    descricaoAcao: string;
    observacaoTec?: string;
    anexos?: {
      usuarioId: number;
      descricao: string;
      caminho: string;
    }[];
    mensagens?: {
      usuarioEnvioId: number;
      usuarioLeituraId: number;
      descricao: string;
    }[];
  };

  @IsOptional()
  anexos?: {
    usuarioId: number;
    descricao: string;
    caminho: string;
  }[];

  @IsNotEmpty()
  @IsEnum(StatusRegistro)
  ativo: StatusRegistro = StatusRegistro.ATIVO;
}
