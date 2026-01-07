import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

// ==================== CREATE ====================
export class CreatePessoaJuridicaPerfilDto {
  @ApiProperty({
    description: 'ID da pessoa jurídica',
    example: 1,
  })
  @IsNotEmpty({ message: 'O campo id_pessoa_juridica é obrigatório' })
  id_pessoa_juridica: number;

  @ApiProperty({
    description: 'Descrição do perfil',
    example: 'Administrador',
    maxLength: 100,
  })
  @IsString({ message: 'O campo descricao deve ser uma string' })
  @IsNotEmpty({ message: 'O campo descricao é obrigatório' })
  @MaxLength(100, {
    message: 'O campo descricao deve ter no máximo 100 caracteres',
  })
  descricao: string;

  @ApiPropertyOptional({
    description: 'Status de visualização (0 ou 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'O campo status_view deve ser um número inteiro' })
  status_view?: number;

  @ApiPropertyOptional({
    description: 'Situação (0=inativo, 1=ativo)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: 'O campo situacao deve ser um número inteiro' })
  situacao?: number;

  @ApiPropertyOptional({
    description: 'Motivo da situação',
    example: 'Perfil criado para controle de acesso',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'O campo motivo deve ser uma string' })
  @MaxLength(500, {
    message: 'O campo motivo deve ter no máximo 500 caracteres',
  })
  motivo?: string;
}

// ==================== CREATE MANY ====================
export class CreateManyPessoasJuridicasPerfisDto {
  @ApiProperty({
    description: 'Array de perfis a serem criados',
    type: [CreatePessoaJuridicaPerfilDto],
  })
  @IsArray({ message: 'O campo perfis deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CreatePessoaJuridicaPerfilDto)
  perfis: CreatePessoaJuridicaPerfilDto[];
}

// ==================== UPDATE ====================
export class UpdatePessoaJuridicaPerfilDto extends PartialType(
  CreatePessoaJuridicaPerfilDto,
) { }

// ==================== QUERY ====================
export class QueryPessoaJuridicaPerfilDto extends BaseQueryDto(
  CreatePessoaJuridicaPerfilDto,
) { }

// ==================== RESPONSE ====================
export class PessoaJuridicaPerfilResponseDto {
  @ApiProperty({
    description: 'ID do perfil',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID da pessoa jurídica',
    example: 1,
  })
  id_pessoa_juridica: number;

  @ApiProperty({
    description: 'Descrição do perfil',
    example: 'Administrador',
  })
  descricao: string;

  @ApiProperty({
    description: 'Status de visualização',
    example: 1,
  })
  status_view: number;

  @ApiProperty({
    description: 'Situação',
    example: 1,
  })
  situacao: number;

  @ApiPropertyOptional({
    description: 'Motivo',
    example: 'Perfil ativo',
  })
  motivo?: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-11-26T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Data de atualização',
    example: '2025-11-26T12:00:00.000Z',
  })
  updatedAt?: Date;
}

// ==================== CREATE MANY RESPONSE ====================
export class CreateManyResponseItemDto {
  @ApiProperty({
    description: 'Indica se a criação foi bem-sucedida',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Dados do perfil criado (se bem-sucedido)',
    type: PessoaJuridicaPerfilResponseDto,
  })
  data?: PessoaJuridicaPerfilResponseDto;

  @ApiPropertyOptional({
    description: 'Mensagem de erro (se falhou)',
    example: 'Perfil com esta descrição já existe',
  })
  error?: string;

  @ApiPropertyOptional({
    description: 'Dados originais enviados',
    type: CreatePessoaJuridicaPerfilDto,
  })
  originalData?: CreatePessoaJuridicaPerfilDto;
}

export class CreateManyPessoasJuridicasPerfisResponseDto {
  @ApiProperty({
    description: 'Quantidade de perfis criados com sucesso',
    example: 5,
  })
  successCount: number;

  @ApiProperty({
    description: 'Quantidade de perfis que falharam',
    example: 2,
  })
  errorCount: number;

  @ApiProperty({
    description: 'Total de perfis processados',
    example: 7,
  })
  totalCount: number;

  @ApiProperty({
    description: 'Resultados detalhados de cada operação',
    type: [CreateManyResponseItemDto],
  })
  results: CreateManyResponseItemDto[];
}

// ==================== PERFIL MODULOS E PERMISSOES ====================
export class PerfilModuloPermissaoDto {
  @ApiProperty({
    description: 'ID do módulo',
    example: 1,
  })
  id_modulo: string;

  @ApiProperty({
    description: 'ID do módulo pai',
    example: -1,
  })
  id_parent: string;

  @ApiProperty({
    description: 'Nome da página/formulário',
    example: 'FormUsuarios',
  })
  name_form_page: string;

  @ApiProperty({
    description: 'Índice do componente no menu',
    example: '1.1',
  })
  component_indx: string;

  @ApiProperty({
    description: 'Nome do componente',
    example: 'usuarios',
  })
  component_name: string;

  @ApiProperty({
    description: 'Texto exibido no menu',
    example: 'Usuários',
  })
  component_text: string;

  @ApiProperty({
    description: 'Evento do componente',
    example: 'onUsuarios',
  })
  component_event: string;

  @ApiProperty({
    description: 'Teclas de atalho',
    example: 'Ctrl+U',
  })
  shortcutkeys: string;

  @ApiProperty({
    description: 'Permissão de inserir (0=não, 1=sim)',
    example: 1,
  })
  action_insert: number;

  @ApiProperty({
    description: 'Permissão de atualizar (0=não, 1=sim)',
    example: 1,
  })
  action_update: number;

  @ApiProperty({
    description: 'Permissão de buscar (0=não, 1=sim)',
    example: 1,
  })
  action_search: number;

  @ApiProperty({
    description: 'Permissão de deletar (0=não, 1=sim)',
    example: 1,
  })
  action_delete: number;

  @ApiProperty({
    description: 'Permissão de imprimir (0=não, 1=sim)',
    example: 1,
  })
  action_print: number;
}

export class PerfilModulosPermissoesResponseDto {
  @ApiProperty({
    description: 'ID do perfil',
    example: 1,
  })
  id_perfil: number;

  @ApiProperty({
    description: 'ID do sistema',
    example: 1,
  })
  id_sistema: number;

  @ApiProperty({
    description: 'ID da pessoa jurídica (empresa)',
    example: 1,
  })
  id_pessoa_juridica: number;

  @ApiProperty({
    description: 'Descrição do perfil',
    example: 'Administrador',
  })
  descricao_perfil: string;

  @ApiProperty({
    description: 'Lista de módulos e permissões do perfil',
    type: [PerfilModuloPermissaoDto],
  })
  modulos: PerfilModuloPermissaoDto[];
}
