import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
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
    example: '2024-01-01T10:00:00Z',
    required: false,
    description: 'Data e hora do anexo',
  })
  @IsOptional()
  @IsDateString()
  dataHora?: string;

  @ApiProperty({
    example: '/uploads/anexos/arquivo.pdf',
    description: 'Caminho do arquivo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  caminho: string;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Situação do registro',
  })
  @IsOptional()
  @IsInt()
  situacao?: number;

  @ApiProperty({ example: 'Motivo da alteração', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

export class UpdateChamadoMovimentoAnexoDto extends PartialType(
  CreateChamadoMovimentoAnexoDto,
) {}
