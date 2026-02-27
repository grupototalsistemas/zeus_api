import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength
} from 'class-validator';

export class CreateChamadoMovimentoAnexoDto {
  @ApiProperty({ example: 1, description: 'ID do movimento do chamado' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_chamado_movimento: number;

  @ApiProperty({ example: 1, description: 'ID do usuário' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_pessoa_usuario: number;

  @ApiProperty({ example: 1, required: false, description: 'Ordem do anexo' })
  @IsOptional()
  @IsInt()
  ordem?: number;

  @ApiProperty({
    example: 'Screenshot do erro',
    description: 'Descrição do anexo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descricao: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo para upload',
    required: true,
  })
  arquivo: any;
}

export class UpdateChamadoMovimentoAnexoDto {
  @ApiProperty({ example: 1, required: false, description: 'Ordem do anexo' })
  @IsOptional()
  @IsInt()
  ordem?: number;

  @ApiProperty({
    example: 'Screenshot atualizado',
    required: false,
    description: 'Descrição do anexo',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Novo arquivo para upload (opcional)',
    required: false,
  })
  arquivo?: any;
}

export class FindAnexosByMovimentoDto {
  @ApiProperty({ example: 1, description: 'ID do movimento do chamado' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_chamado_movimento: number;
}

