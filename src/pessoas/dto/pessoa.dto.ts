import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateIf,
} from 'class-validator';

// ==================== ENDEREÇOS, CONTATOS E DADOS ADICIONAIS (MOVIDOS PARA CIMA) ====================
export class PessoaEnderecoDto {
  @ApiProperty()
  @IsInt()
  id_pessoa_endereco_tipo: number;

  @ApiProperty()
  @IsString()
  logradouro: string;

  @ApiProperty()
  @IsString()
  endereco: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiProperty()
  @IsString()
  bairro: string;

  @ApiProperty()
  @IsString()
  municipio: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  municipio_ibge?: string;

  @ApiProperty()
  @IsString()
  estado: string;

  @ApiProperty()
  @IsString()
  cep: string;
  id: any;
}

export class PessoaContatoDto {
  @ApiProperty()
  @IsInt()
  id_pessoa_contato_tipo: number;

  @ApiProperty()
  @IsString()
  descricao: string;
  id: any;
}

export class PessoaDadoAdicionalDto {
  @ApiProperty()
  @IsInt()
  id_pessoa_dado_adicional_tipo: number;

  @ApiProperty()
  @IsString()
  descricao: string;
  id: any;
}

// ==================== PESSOA FÍSICA ====================
export class PessoaFisicaDto {
  @ApiProperty({ example: '12345678900' })
  @IsString()
  cpf: string;

  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  nome_registro: string;

  @ApiProperty({ example: 'João' })
  @IsOptional()
  @IsString()
  nome_social?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  id_pessoa_genero: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  id_pessoa_estado_civil: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  cpf_justificativa: number;

  @ApiProperty({ example: '123456789' })
  @IsString()
  doc_numero: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  doc_emissor: string;

  @ApiProperty({ example: '22/05/1998' })
  @IsString()
  doc_data_emissao: string;

  @ApiProperty({ example: 'Nacionalidade' })
  @IsString()
  nacionalidade: string;

  @ApiProperty({ example: 'Nacionalidade' })
  @IsString()
  naturalidade: string;

  @ApiProperty({ example: '22/05/2000' })
  @IsString()
  data_nascimento: string;
}

// ==================== PESSOA FÍSICA ASSOCIADA ====================
export class PessoaFisicaAssociadaDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  pessoa: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  id_pessoa_tipo?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  id_pessoa_origem?: number;

  @ApiProperty({ example: 'PF001' })
  @IsString()
  codigo: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  situacao?: number;

  @ApiProperty({ type: PessoaFisicaDto })
  @ValidateNested()
  @Type(() => PessoaFisicaDto)
  fisica: PessoaFisicaDto;

  @ApiProperty({ type: [PessoaEnderecoDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PessoaEnderecoDto)
  enderecos?: PessoaEnderecoDto[];

  @ApiProperty({ type: [PessoaContatoDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PessoaContatoDto)
  contatos?: PessoaContatoDto[];

  @ApiProperty({ type: [PessoaDadoAdicionalDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PessoaDadoAdicionalDto)
  dados_adicionais?: PessoaDadoAdicionalDto[];
}

// ==================== PESSOA JURÍDICA ====================
export class PessoaJuridicaDto {
  @ApiProperty({ example: '12345678000190' })
  @IsString()
  cnpj: string;

  @ApiProperty({ example: 'Empresa Exemplo LTDA' })
  @IsString()
  razao_social: string;

  @ApiProperty({ example: 'Exemplo' })
  @IsOptional()
  @IsString()
  nome_fantasia?: string;

  @ApiProperty({
    description: 'ID da pessoa física responsável (opcional)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_pessoa_fisica_responsavel?: number;

  @ApiProperty({ example: '123456789' })
  @IsOptional()
  @IsString()
  insc_estadual?: string | null;

  @ApiProperty({ example: '123456789' })
  @IsOptional()
  @IsString()
  insc_municipal?: string | null;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  filial_principal?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  situacao?: number;

  @ApiProperty({ example: 'Motivo' })
  @IsOptional()
  @IsString()
  motivo?: string | null;

  @ApiProperty({
    type: [PessoaFisicaAssociadaDto],
    required: false,
    description: 'Pessoas físicas associadas à pessoa jurídica',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PessoaFisicaAssociadaDto)
  pessoas_fisicas?: PessoaFisicaAssociadaDto[];
}

// ==================== PESSOA INDIVIDUAL DTO ====================
export class PessoaIndividualDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  pessoa: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  id_pessoa_tipo: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  id_pessoa_origem?: number;

  @ApiProperty({ example: 'CLI001' })
  @IsString()
  codigo: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  situacao?: number;

  @ApiProperty({
    type: PessoaFisicaDto,
    required: false,
    description: 'Dados da pessoa física',
  })
  @ValidateIf((o) => o.id_pessoa_tipo === 1)
  @ValidateNested()
  @Type(() => PessoaFisicaDto)
  @IsOptional()
  fisica?: PessoaFisicaDto;

  @ApiProperty({
    type: PessoaJuridicaDto,
    required: false,
    description: 'Dados da pessoa jurídica',
  })
  @ValidateIf((o) => o.id_pessoa_tipo === 2)
  @ValidateNested()
  @Type(() => PessoaJuridicaDto)
  @IsOptional()
  juridica?: PessoaJuridicaDto;

  @ApiProperty({
    type: [PessoaEnderecoDto],
    required: false,
    description: 'Endereços da pessoa',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PessoaEnderecoDto)
  enderecos?: PessoaEnderecoDto[];

  @ApiProperty({
    type: [PessoaContatoDto],
    required: false,
    description: 'Contatos da pessoa',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PessoaContatoDto)
  contatos?: PessoaContatoDto[];

  @ApiProperty({
    type: [PessoaDadoAdicionalDto],
    required: false,
    description: 'Dados adicionais da pessoa',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PessoaDadoAdicionalDto)
  dados_adicionais?: PessoaDadoAdicionalDto[];
}

// ==================== CREATE DTO PRINCIPAL ====================
export class CreatePessoaDto {
  @ApiProperty({
    type: [PessoaIndividualDto],
    description: 'Array de pessoas a serem cadastradas',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PessoaIndividualDto)
  pessoas: PessoaIndividualDto[];
}

// ==================== UPDATE DTO ====================
export class UpdatePessoaDto extends PartialType(CreatePessoaDto) {}
