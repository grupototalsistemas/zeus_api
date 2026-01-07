import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePessoasFisicaDto {
  @ApiProperty({
    description: 'ID da pessoa',
    example: 1,
    type: String,
  })
  @IsNotEmpty({ message: 'O campo id_pessoa é obrigatório' })
  @IsString()
  id_pessoa: string;

  @ApiProperty({
    description: 'ID do gênero',
    example: 1,
    type: String,
  })
  @IsNotEmpty({ message: 'O campo id_pessoa_genero é obrigatório' })
  @IsString()
  id_pessoa_genero: string;

  @ApiProperty({
    description: 'ID do estado civil',
    example: 1,
    type: String,
  })
  @IsNotEmpty({ message: 'O campo id_pessoa_estado_civil é obrigatório' })
  @IsString()
  id_pessoa_estado_civil: string;

  @ApiProperty({
    description: 'Justificativa para ausência de CPF',
    example: 0,
  })
  @IsNotEmpty({ message: 'O campo cpf_justificativa é obrigatório' })
  @IsInt()
  @Type(() => Number)
  cpf_justificativa: number;

  @ApiPropertyOptional({
    description: 'CPF',
    example: '123.456.789-00',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  cpf?: string;

  @ApiProperty({
    description: 'Nome de registro',
    example: 'João da Silva Santos',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'O campo nome_registro é obrigatório' })
  @IsString()
  @MaxLength(150)
  nome_registro: string;

  @ApiPropertyOptional({
    description: 'Nome social',
    example: 'João Silva',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nome_social?: string;

  @ApiPropertyOptional({
    description: 'Número do documento',
    example: '12345678',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  doc_numero?: string;

  @ApiPropertyOptional({
    description: 'Órgão emissor do documento',
    example: 'SSP/RJ',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  doc_emissor?: string;

  @ApiPropertyOptional({
    description: 'Data de emissão do documento',
    example: '2015-01-15',
  })
  @IsOptional()
  @IsDateString()
  doc_data_emissao?: string;

  @ApiPropertyOptional({
    description: 'Nacionalidade',
    example: 'Brasileira',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nacionalidade?: string;

  @ApiPropertyOptional({
    description: 'Naturalidade',
    example: 'Niterói',
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  naturalidade?: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento',
    example: '1990-05-20',
  })
  @IsOptional()
  @IsDateString()
  data_nascimento?: string;

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

export class UpdatePessoasFisicaDto extends PartialType(
  CreatePessoasFisicaDto,
) {}

export class PessoasFisicaResponseDto {
  @ApiProperty({ description: 'ID da pessoa física', type: String })
  id: string;

  @ApiProperty({ description: 'ID da pessoa', type: String })
  id_pessoa: string;

  @ApiProperty({ description: 'ID do gênero', type: String })
  id_pessoa_genero: string;

  @ApiProperty({ description: 'ID do estado civil', type: String })
  id_pessoa_estado_civil: string;

  @ApiProperty({ description: 'Justificativa CPF' })
  cpf_justificativa: number;

  @ApiProperty({ description: 'CPF', nullable: true })
  cpf: string | null;

  @ApiProperty({ description: 'Nome de registro' })
  nome_registro: string;

  @ApiProperty({ description: 'Nome social', nullable: true })
  nome_social: string | null;

  @ApiProperty({ description: 'Número do documento', nullable: true })
  doc_numero: string | null;

  @ApiProperty({ description: 'Órgão emissor', nullable: true })
  doc_emissor: string | null;

  @ApiProperty({ description: 'Data de emissão', nullable: true })
  doc_data_emissao: Date | null;

  @ApiProperty({ description: 'Nacionalidade', nullable: true })
  nacionalidade: string | null;

  @ApiProperty({ description: 'Naturalidade', nullable: true })
  naturalidade: string | null;

  @ApiProperty({ description: 'Data de nascimento', nullable: true })
  data_nascimento: Date | null;

  @ApiProperty({ description: 'Situação' })
  situacao: number;

  @ApiProperty({ description: 'Motivo', nullable: true })
  motivo: string | null;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', nullable: true })
  updatedAt: Date | null;
}
