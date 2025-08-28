import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusRegistro } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateChamadoDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  empresaId: number;

  @ApiProperty({
    description: 'ID do sistema',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  sistemaId: number;

  @ApiProperty({
    description: 'ID da pessoa',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  pessoaId: number;

  @ApiProperty({
    description: 'ID do usuário',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  usuarioId: number;

  @ApiProperty({
    description: 'ID da ocorrência',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  ocorrenciaId: number;

  @ApiProperty({
    description: 'ID da prioridade',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  prioridadeId: number;

  @ApiPropertyOptional({
    description: 'Protocolo do chamado',
    example: 'CHM-2024-001',
  })
  @IsOptional()
  @IsString()
  protocolo?: string;

  @ApiProperty({
    description: 'Título do chamado',
    example: 'Problema de acesso ao sistema',
  })
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @ApiProperty({
    description: 'Descrição detalhada do chamado',
    example: 'Usuário não consegue acessar o sistema com suas credenciais',
  })
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @ApiPropertyOptional({
    description: 'Observações adicionais',
    example: 'Usuário relatou que problema ocorre desde ontem',
  })
  @IsOptional()
  @IsString()
  observacao?: string;

  @ApiPropertyOptional({
    description: 'Movimento inicial do chamado',
    type: 'object',
    properties: {
      etapaId: { type: 'number', example: 1 },
      ordem: { type: 'number', example: 1, required: false },
      descricaoAcao: { type: 'string', example: 'Chamado aberto' },
      observacaoTec: {
        type: 'string',
        example: 'Encaminhado para análise',
        required: false,
      },
      anexos: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            usuarioId: { type: 'number', example: 1 },
            descricao: { type: 'string', example: 'Print do erro' },
            caminho: { type: 'string', example: '/uploads/print.png' },
          },
        },
        required: false,
      },
      mensagens: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            usuarioEnvioId: { type: 'number', example: 1 },
            usuarioLeituraId: { type: 'number', example: 2 },
            descricao: { type: 'string', example: 'Mensagem inicial' },
          },
        },
        required: false,
      },
    },
  })
  @IsOptional()
  movimento?: {
    etapaId: number;
    ordem?: number;
    descricaoAcao: string;
    observacaoTec?: string;
    anexos?: {
      usuarioId: number;
      descricao: string;
      caminho: string;
    }[];
    mensagens?: {
      usuarioEnvioId: number;
      usuarioLeituraId: number;
      descricao: string;
    }[];
  };

  @ApiPropertyOptional({
    description: 'Anexos do chamado',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        usuarioId: { type: 'number', example: 1 },
        descricao: { type: 'string', example: 'Documentação' },
        caminho: { type: 'string', example: '/uploads/doc.pdf' },
      },
    },
  })
  @IsOptional()
  anexos?: {
    usuarioId: number;
    descricao: string;
    caminho: string;
  }[];

  @ApiProperty({
    description: 'Status do registro',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  @IsNotEmpty()
  @IsEnum(StatusRegistro)
  ativo: StatusRegistro = StatusRegistro.ATIVO;
}
