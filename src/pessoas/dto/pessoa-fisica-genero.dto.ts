import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePessoasFisicasGeneroDto {
  @ApiPropertyOptional({
    description: 'Gênero',
    example: 'Masculino',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  genero?: string;

  @ApiPropertyOptional({
    description: 'Descrição do gênero',
    example: 'Pessoa do gênero masculino',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descricao?: string;

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

export class UpdatePessoasFisicasGeneroDto extends PartialType(
  CreatePessoasFisicasGeneroDto,
) {}

export class PessoasFisicasGeneroResponseDto {
  @ApiPropertyOptional({ description: 'ID do gênero', type: String })
  id?: string;

  @ApiPropertyOptional({ description: 'Gênero', type: String })
  genero?: string;

  @ApiPropertyOptional({ description: 'Descrição do gênero', type: String })
  descricao?: string;

  @ApiPropertyOptional({
    description: 'Situação (1 = ativo, 0 = inativo)',
    type: Number,
  })
  situacao?: number;

  @ApiPropertyOptional({ description: 'Motivo da situação', type: String })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', nullable: true })
  updatedAt: Date | null;
}
