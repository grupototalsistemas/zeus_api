import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MovimentoStatus } from '../enums/movimento-status.enum';

export class CreateMovimentoDto {
  @IsNotEmpty()
  @IsNumber()
  chamadoId: number;

  @IsNotEmpty()
  @IsNumber()
  usuarioId: number;

  @IsNotEmpty()
  @IsEnum(MovimentoStatus)
  status: MovimentoStatus;

  @IsOptional()
  @IsNumber()
  ordem: number;

  @IsOptional()
  @IsString()
  descricaoAcao: string;

  @IsOptional()
  @IsString()
  observacaoTec: string;

  @IsNotEmpty()
  @IsString()
  mensagem: string;

  @IsOptional()
  @IsString()
  etapaId: number;

  @IsOptional()
  @IsString({ each: true })
  anexos?: string[];
}
