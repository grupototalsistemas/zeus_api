// empresas/dto/create-empresa.dto.ts
import { SiglaEstado, StatusRegistro } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEmpresaDto {
  @IsNotEmpty()
  @IsString()
  cnpj: string;

  @IsNotEmpty()
  @IsString()
  razaoSocial: string;

  @IsNotEmpty()
  @IsString()
  nomeFantasia: string;

  @IsOptional()
  @IsEnum(SiglaEstado)
  estado?: SiglaEstado;

  @IsNotEmpty()
  @IsEnum(StatusRegistro)
  ativo: StatusRegistro = StatusRegistro.ATIVO;

  @IsNotEmpty()
  @IsNumber()
  tipoId: number;

  @IsNotEmpty()
  @IsNumber()
  categoriaId: number;
}
