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

export class CreatePessoasEnderecosTipoDto {
  @ApiProperty({
    description: 'ID da pessoa',
    example: 1,
    type: String,
  })
  @IsNotEmpty({ message: 'O campo id_pessoa é obrigatório' })
  @IsString()
  id_pessoa: string;

  @ApiProperty({
    description: 'Descrição do tipo de endereço',
    example: 'Residencial',
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

export class UpdatePessoasEnderecosTipoDto extends PartialType(
  CreatePessoasEnderecosTipoDto,
) {}

export class PessoasEnderecosTipoResponseDto {
  @ApiProperty({ description: 'ID do tipo', type: String })
  id: string;

  @ApiProperty({ description: 'ID da pessoa', type: String })
  id_pessoa: string;

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

export class QueryPessoasEnderecosTipoDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID da pessoa',
    example: '1',
    type: String,
  })
  @IsOptional()
  @IsString()
  id_pessoa?: string;

  @ApiPropertyOptional({
    description: 'Filtrar pela descrição',
    example: 'Residencial',
  })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({
    description: 'Filtrar pela situação (1 = ativo, 0 = inativo)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  situacao?: number;
}

export class DeletePessoasEnderecosTipoDto {
  @ApiProperty({
    description: 'Motivo da exclusão (obrigatório)',
    example: 'Tipo não utilizado',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'O campo motivo é obrigatório' })
  @IsString()
  @MaxLength(500)
  motivo: string;
}
