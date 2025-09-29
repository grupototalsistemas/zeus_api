// src/dtos/chamado-movimento-anexo/create-chamado-movimento-anexo.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';

export class CreateChamadoMovimentoAnexoDto {
  @ApiProperty({ description: 'ID do movimento', example: '1' })
  @IsNotEmpty({ message: 'ID do movimento é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  movimentoId: bigint;

  @ApiProperty({ description: 'ID do usuário', example: '1' })
  @IsNotEmpty({ message: 'ID do usuário é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  usuarioId: bigint;

  @ApiProperty({ description: 'Ordem do anexo', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Ordem deve ser um número inteiro' })
  ordem?: number;

  @ApiProperty({
    description: 'Descrição do anexo',
    example: 'Print da tela de erro',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(100, { message: 'Descrição deve ter no máximo 100 caracteres' })
  descricao: string;

  @ApiProperty({
    description: 'Data e hora do anexo',
    example: '2024-01-01T10:30:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data e hora deve ser uma data válida' })
  dataHora?: Date;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
    default: StatusRegistro.ATIVO,
  })
  @IsEnum(StatusRegistro, { message: 'Status deve ser um valor válido' })
  ativo: StatusRegistro = StatusRegistro.ATIVO;

  @ApiProperty({
    description: 'Motivo da inativação',
    example: 'Anexo removido',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Motivo deve ser uma string' })
  @MaxLength(500, { message: 'Motivo deve ter no máximo 500 caracteres' })
  motivo?: string;

  @ApiProperty({
    description: 'Tipo MIME do arquivo',
    example: 'image/png',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Tipo MIME é obrigatório' })
  @IsString({ message: 'Tipo MIME deve ser uma string' })
  @MaxLength(100, { message: 'Tipo MIME deve ter no máximo 100 caracteres' })
  mimeType: string;

  @ApiProperty({
    description: 'Nome original do arquivo',
    example: 'erro_tela.png',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Nome original é obrigatório' })
  @IsString({ message: 'Nome original deve ser uma string' })
  @MaxLength(255, {
    message: 'Nome original deve ter no máximo 255 caracteres',
  })
  nomeOriginal: string;

  @ApiProperty({
    description: 'Caminho do arquivo no servidor',
    example: '/uploads/2024/01/arquivo.png',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Caminho é obrigatório' })
  @IsString({ message: 'Caminho deve ser uma string' })
  @MaxLength(500, { message: 'Caminho deve ter no máximo 500 caracteres' })
  pathname: string;

  @ApiProperty({
    description: 'Tamanho do arquivo em bytes',
    example: 102400,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tamanho deve ser um número inteiro' })
  @Min(0, { message: 'Tamanho deve ser maior ou igual a 0' })
  tamanho?: number;

  @ApiProperty({
    description: 'URL de acesso ao arquivo',
    example: 'https://exemplo.com/uploads/arquivo.png',
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'URL é obrigatória' })
  @IsString({ message: 'URL deve ser uma string' })
  @MaxLength(1000, { message: 'URL deve ter no máximo 1000 caracteres' })
  url: string;
}

// src/dtos/chamado-movimento-anexo/update-chamado-movimento-anexo.dto.ts
export class UpdateChamadoMovimentoAnexoDto extends PartialType(
  CreateChamadoMovimentoAnexoDto,
) {}

// src/dtos/chamado-movimento-anexo/chamado-movimento-anexo-response.dto.ts
export class ChamadoMovimentoAnexoResponseDto {
  @ApiProperty({ description: 'ID único do anexo', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID do movimento', example: '1' })
  @Transform(({ value }) => value.toString())
  movimentoId: string;

  @ApiProperty({ description: 'ID do usuário', example: '1' })
  @Transform(({ value }) => value.toString())
  usuarioId: string;

  @ApiProperty({ description: 'Ordem do anexo', example: 1, required: false })
  ordem?: number;

  @ApiProperty({
    description: 'Descrição do anexo',
    example: 'Print da tela de erro',
  })
  descricao: string;

  @ApiProperty({
    description: 'Data e hora do anexo',
    example: '2024-01-01T10:30:00.000Z',
    required: false,
  })
  dataHora?: Date;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({
    description: 'Motivo da inativação',
    example: 'Anexo removido',
    required: false,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;

  @ApiProperty({ description: 'Tipo MIME do arquivo', example: 'image/png' })
  mimeType: string;

  @ApiProperty({
    description: 'Nome original do arquivo',
    example: 'erro_tela.png',
  })
  nomeOriginal: string;

  @ApiProperty({
    description: 'Caminho do arquivo no servidor',
    example: '/uploads/2024/01/arquivo.png',
  })
  pathname: string;

  @ApiProperty({
    description: 'Tamanho do arquivo em bytes',
    example: 102400,
    required: false,
  })
  tamanho?: number;

  @ApiProperty({
    description: 'URL de acesso ao arquivo',
    example: 'https://exemplo.com/uploads/arquivo.png',
  })
  url: string;
}
