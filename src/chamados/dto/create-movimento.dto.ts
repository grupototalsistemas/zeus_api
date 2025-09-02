// src/chamados/dto/create-movimento.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusRegistro } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateAnexoBlobDto {
  @ApiProperty({
    description: 'ID do usuário que fez upload',
    example: 1,
  })
  @IsNumber()
  usuarioId: number;

  @ApiProperty({
    description: 'Descrição do anexo',
    example: 'Screenshot do erro',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    description: 'URL pública do arquivo no blob storage',
    example: 'https://blob.vercel-storage.com/anexo-123.png',
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Pathname do arquivo para operações de delete/head',
    example: 'chamados/anexos/anexo-123.png',
  })
  @IsString()
  @IsNotEmpty()
  pathname: string;

  @ApiProperty({
    description: 'Nome original do arquivo',
    example: 'screenshot.png',
  })
  @IsString()
  @IsNotEmpty()
  nomeOriginal: string;

  @ApiProperty({
    description: 'Tipo MIME do arquivo',
    example: 'image/png',
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({
    description: 'Tamanho do arquivo em bytes',
    example: 1024,
  })
  @IsNumber()
  tamanho: number;
}

export class CreateMensagemDto {
  @ApiProperty({
    description: 'ID do usuário que enviou a mensagem',
    example: 1,
  })
  @IsNumber()
  usuarioEnvioId: number;

  @ApiProperty({
    description: 'ID do usuário que deve ler a mensagem',
    example: 2,
  })
  @IsNumber()
  usuarioLeituraId: number;

  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Aguardando retorno do cliente',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;
}

export class CreateMovimentoDto {
  @ApiProperty({
    description: 'ID do chamado',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  chamadoId: number;

  @ApiProperty({
    description: 'ID da etapa',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  etapaId: number;

  @ApiProperty({
    description: 'ID do usuário responsável pelo movimento',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  usuarioId: number;

  @ApiPropertyOptional({
    description: 'Ordem do movimento',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  ordem?: number;

  @ApiPropertyOptional({
    description: 'Data/hora de início do movimento',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  inicio?: Date;

  @ApiPropertyOptional({
    description: 'Data/hora de fim do movimento',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fim?: Date;

  @ApiProperty({
    description: 'Descrição da ação realizada',
    example: 'Chamado analisado e encaminhado para desenvolvimento',
  })
  @IsNotEmpty()
  @IsString()
  descricaoAcao: string;

  @ApiPropertyOptional({
    description: 'Observações técnicas',
    example: 'Necessário implementar nova funcionalidade',
  })
  @IsOptional()
  @IsString()
  observacaoTec?: string;

  @ApiProperty({
    description: 'Status do movimento',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  @IsNotEmpty()
  @IsEnum(StatusRegistro)
  ativo: StatusRegistro;

  @ApiPropertyOptional({
    description: 'Motivo da ação',
    example: 'Solicitação do cliente',
  })
  @IsOptional()
  @IsString()
  motivo?: string;

  @ApiPropertyOptional({
    description: 'Mensagens do movimento',
    type: [CreateMensagemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMensagemDto)
  mensagens?: CreateMensagemDto[];

  @ApiPropertyOptional({
    description: 'Anexos do movimento',
    type: [CreateAnexoBlobDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnexoBlobDto)
  anexos?: CreateAnexoBlobDto[];
}
