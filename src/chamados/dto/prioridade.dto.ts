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

export class CreatePrioridadeDto {
  @ApiProperty({ example: 1, description: 'ID da empresa' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_empresa: number;

  @ApiProperty({ example: 'Alta', description: 'Descrição da prioridade' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  descricao: string;

  @ApiProperty({
    example: '#FF0000',
    description: 'Cor da prioridade em hexadecimal',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  cor: string;

  @ApiProperty({
    example: '2024-01-07T10:00:00Z',
    description: 'Tempo de resolução esperado',
  })
  @IsDateString()
  @IsNotEmpty()
  tempoResolucao: string;

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

export class UpdatePrioridadeDto extends PartialType(CreatePrioridadeDto) {}
