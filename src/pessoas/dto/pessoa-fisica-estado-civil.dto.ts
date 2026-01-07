import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePessoasFisicasEstadoCivilDto {
  @ApiPropertyOptional({
    description: 'Descrição do estado civil',
    example: 'Solteiro(a)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
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

export class UpdatePessoasFisicasEstadoCivilDto extends PartialType(
  CreatePessoasFisicasEstadoCivilDto,
) {}

export class PessoasFisicasEstadoCivilResponseDto {
  @ApiProperty({ description: 'ID do estado civil', type: String })
  id: string;

  @ApiProperty({ description: 'Descrição', nullable: true })
  descricao: string | null;

  @ApiProperty({ description: 'Situação' })
  situacao: number;

  @ApiProperty({ description: 'Motivo', nullable: true })
  motivo: string | null;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', nullable: true })
  updatedAt: Date | null;
}
