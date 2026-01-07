import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePessoasDadosAdicionaisTipoDto {
  @ApiProperty({
    description: 'ID da pessoa',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'O campo id_pessoa é obrigatório' })
  @IsInt()
  id_pessoa: number;

  @ApiProperty({
    description: 'Descrição do tipo de dado adicional',
    example: 'Observações',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'O campo descricao é obrigatório' })
  @IsString()
  @MaxLength(50)
  descricao: string;

  @ApiPropertyOptional({
    description: 'Situação (1 = ativo, 0 = inativo)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  situacao?: number;

  @ApiPropertyOptional({
    description: 'Motivo da situação',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

export class UpdatePessoasDadosAdicionaisTipoDto extends PartialType(
  CreatePessoasDadosAdicionaisTipoDto,
) { }

export class DeletePessoasDadosAdicionaisTipoDto {
  @ApiProperty({
    description: 'ID do adicional',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  id: number;

  @ApiProperty({
    description: 'ID da pessoa',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  id_pessoa: number;

  @ApiProperty({
    description: 'Motivo da exclusão',
  })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  motivo: string;
}

export class PessoasDadosAdicionaisTipoResponseDto {
  @ApiProperty({ description: 'ID do tipo', type: Number })
  id: number;

  @ApiProperty({ description: 'ID da pessoa', type: Number })
  id_pessoa: number;

  @ApiProperty({ description: 'Descrição' })
  descricao: string;

  @ApiProperty({ description: 'Situação' })
  situacao: number;

  @ApiProperty({ description: 'Motivo', nullable: true })
  motivo: string | null;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', nullable: true })
  updatedAt: Date | null;
}
