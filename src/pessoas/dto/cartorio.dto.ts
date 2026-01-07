import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

// ==================== ENDEREÇO ====================
export class CartorioEnderecoDto {
  @ApiProperty({
    description: 'ID do tipo de endereço',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'O campo id_pessoa_endereco_tipo é obrigatório' })
  id_pessoa_endereco_tipo: number;

  @ApiProperty({
    description: 'Tipo de logradouro',
    example: 'Rua',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo logradouro é obrigatório' })
  @MaxLength(50)
  logradouro: string;

  @ApiProperty({
    description: 'Nome do endereço',
    example: 'Visconde de Sepetiba',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo endereco é obrigatório' })
  @MaxLength(150)
  endereco: string;

  @ApiPropertyOptional({
    description: 'Número do endereço',
    example: '123',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numero?: string;

  @ApiPropertyOptional({
    description: 'Complemento',
    example: 'Sala 201',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  complemento?: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Centro',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo bairro é obrigatório' })
  @MaxLength(100)
  bairro: string;

  @ApiProperty({
    description: 'Município',
    example: 'Niterói',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo municipio é obrigatório' })
  @MaxLength(100)
  municipio: string;

  @ApiPropertyOptional({
    description: 'Código IBGE do município',
    example: '3303302',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  municipio_ibge?: string;

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'RJ',
    maxLength: 2,
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo estado é obrigatório' })
  @MaxLength(2)
  estado: string;

  @ApiProperty({
    description: 'CEP',
    example: '24020-040',
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo cep é obrigatório' })
  @MaxLength(10)
  cep: string;
}

// ==================== CONTATO ====================
export class CartorioContatoDto {
  @ApiProperty({
    description: 'ID do tipo de contato',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'O campo id_pessoa_contato_tipo é obrigatório' })
  id_pessoa_contato_tipo: number;

  @ApiProperty({
    description: 'Descrição do contato (telefone, email, etc)',
    example: '(21) 98765-4321',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo descricao é obrigatório' })
  @MaxLength(50)
  descricao: string;
}

// ==================== PESSOA FÍSICA RESPONSÁVEL ====================
class CartorioAdicionaisDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id_pessoa_dado_adicional_tipo: number;

  @ApiProperty()
  @IsString()
  descricao: string;
}

export class CartorioPessoaFisicaDto {
  @ApiProperty({
    description: 'CPF da pessoa física',
    example: '123.456.789-00',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo cpf é obrigatório' })
  @MaxLength(50)
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato 000.000.000-00',
  })
  cpf: string;

  @ApiProperty({
    description: 'Nome de registro completo',
    example: 'João da Silva Santos',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo nome_registro é obrigatório' })
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

  @ApiProperty({
    description: 'ID do gênero',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'O campo id_pessoa_genero é obrigatório' })
  id_pessoa_genero: number;

  @ApiProperty({
    description: 'ID do estado civil',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: 'O campo id_pessoa_estado_civil é obrigatório' })
  id_pessoa_estado_civil: number;

  @ApiProperty({
    description:
      'Justificativa para ausência de CPF (0 = possui CPF, 1 = não possui)',
    example: 0,
  })
  @IsInt()
  cpf_justificativa: number;

  @ApiPropertyOptional({
    description: 'Número do documento (RG)',
    example: '12.345.678-9',
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
    description: 'Data de emissão do documento (ISO 8601)',
    example: '2015-01-15',
  })
  @IsOptional()
  @ValidateIf(
    (object, value) => value !== '' && value !== null && value !== undefined,
  )
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
    description: 'Data de nascimento (ISO 8601)',
    example: '1990-05-20',
  })
  @IsOptional()
  @ValidateIf(
    (object, value) => value !== '' && value !== null && value !== undefined,
  )
  @IsDateString()
  data_nascimento?: string;

  @ApiPropertyOptional({
    description: 'Endereços da pessoa física',
    type: [CartorioEnderecoDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartorioEnderecoDto)
  enderecos?: CartorioEnderecoDto[];

  @ApiPropertyOptional({
    description: 'Contatos da pessoa física',
    type: [CartorioContatoDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartorioContatoDto)
  contatos?: CartorioContatoDto[];

  @ApiPropertyOptional({
    description: 'Adicionais da pessoa física',
    type: [CartorioAdicionaisDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartorioAdicionaisDto)
  @Transform(({ value }) => value || [])
  adicionais?: CartorioAdicionaisDto[];
}

// ==================== PESSOA JURÍDICA (CARTÓRIO) ====================
export class CartorioPessoaJuridicaDto {
  @ApiProperty({
    description: 'CNPJ do cartório',
    example: '12.345.678/0001-90',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo cnpj é obrigatório' })
  @MaxLength(50)
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato 00.000.000/0000-00',
  })
  cnpj: string;

  @ApiProperty({
    description: 'Razão social do cartório',
    example: 'CARTÓRIO DO 1º OFÍCIO DE NITERÓI',
    maxLength: 250,
  })
  @IsString()
  @IsNotEmpty({ message: 'O campo razao_social é obrigatório' })
  @MaxLength(250)
  razao_social: string;

  @ApiPropertyOptional({
    description: 'Nome fantasia do cartório',
    example: '1º Ofício',
    maxLength: 250,
  })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  nome_fantasia?: string;

  @ApiPropertyOptional({
    description: 'Inscrição estadual',
    example: '123456789',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  insc_estadual?: string;

  @ApiPropertyOptional({
    description: 'Inscrição municipal',
    example: '987654321',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  insc_municipal?: string;

  @ApiProperty({
    description: 'Indica se é filial principal (1 = sim, 0 = não)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  filial_principal?: number;

  @ApiPropertyOptional({
    description: 'Endereços do cartório',
    type: [CartorioEnderecoDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartorioEnderecoDto)
  enderecos?: CartorioEnderecoDto[];

  @ApiPropertyOptional({
    description: 'Contatos do cartório',
    type: [CartorioContatoDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartorioContatoDto)
  contatos?: CartorioContatoDto[];

  @ApiPropertyOptional({
    description: 'Adicionais do cartório',
    type: [CartorioAdicionaisDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartorioAdicionaisDto)
  @Transform(({ value }) => value || [])
  adicionais?: CartorioAdicionaisDto[];
}

// ==================== CREATE DTO PRINCIPAL ====================
export class CreateCartorioDto {
  @ApiPropertyOptional({
    description: 'Código de identificação do cartório',
    example: 'CART001',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo?: string;

  @ApiProperty({
    description: 'Dados da pessoa jurídica do cartório',
    type: CartorioPessoaJuridicaDto,
  })
  @ValidateNested()
  @Type(() => CartorioPessoaJuridicaDto)
  @IsNotEmpty({ message: 'Os dados da pessoa jurídica são obrigatórios' })
  pessoa_juridica: CartorioPessoaJuridicaDto;

  @ApiProperty({
    description: 'Dados do responsável (pessoa física) pelo cartório',
    type: CartorioPessoaFisicaDto,
  })
  @ValidateNested()
  @Type(() => CartorioPessoaFisicaDto)
  @IsNotEmpty({ message: 'Os dados do responsável são obrigatórios' })
  responsavel: CartorioPessoaFisicaDto;
}

// ==================== UPDATE DTO ====================
export class UpdateCartorioDto extends PartialType(CreateCartorioDto) { }

// ==================== QUERY DTO ====================
export class QueryCartorioDto {
  @ApiPropertyOptional({
    description: 'Filtrar por CNPJ',
    example: '12.345.678/0001-90',
  })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por razão social',
    example: 'CARTÓRIO',
  })
  @IsOptional()
  @IsString()
  razao_social?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por código',
    example: 'CART001',
  })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por situação (1 = ativo, 0 = inativo)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  situacao?: number;
}

// ==================== RESPONSE DTO ====================
export class ResponsavelResponseDto {
  @ApiProperty({ description: 'ID do responsável' })
  id: number;

  @ApiProperty({ description: 'Nome de registro completo' })
  nome_registro: string;

  @ApiPropertyOptional({ description: 'Nome social' })
  nome_social?: string;

  @ApiProperty({ description: 'CPF formatado' })
  cpf: string;

  @ApiPropertyOptional({ description: 'Número do documento' })
  doc_numero?: string;

  @ApiPropertyOptional({ description: 'Órgão emissor do documento' })
  doc_emissor?: string;

  @ApiPropertyOptional({ description: 'Data de emissão do documento' })
  doc_data_emissao?: Date;

  @ApiPropertyOptional({ description: 'Nacionalidade' })
  nacionalidade?: string;

  @ApiPropertyOptional({ description: 'Naturalidade' })
  naturalidade?: string;

  @ApiPropertyOptional({ description: 'Data de nascimento' })
  data_nascimento?: Date;

  @ApiPropertyOptional({ description: 'Descrição do gênero' })
  genero?: string;

  @ApiPropertyOptional({ description: 'Descrição do estado civil' })
  estado_civil?: string;

  @ApiPropertyOptional({ description: 'Descrição do perfil' })
  perfil?: string;

  @ApiPropertyOptional({ description: 'Endereços do responsável', type: Array })
  enderecos?: any[];

  @ApiPropertyOptional({ description: 'Contatos do responsável', type: Array })
  contatos?: any[];
}

export class ResponseCartorioDto {
  @ApiProperty({ description: 'ID da pessoa jurídica' })
  id: number;

  @ApiProperty({ description: 'ID da pessoa' })
  id_pessoa: number;

  @ApiPropertyOptional({ description: 'Código do cartório' })
  codigo?: string;

  @ApiProperty({ description: 'CNPJ formatado' })
  cnpj: string;

  @ApiProperty({ description: 'Razão social' })
  razao_social: string;

  @ApiPropertyOptional({ description: 'Nome fantasia' })
  nome_fantasia?: string;

  @ApiPropertyOptional({ description: 'Inscrição estadual' })
  insc_estadual?: string;

  @ApiPropertyOptional({ description: 'Inscrição municipal' })
  insc_municipal?: string;

  @ApiProperty({ description: 'Filial principal (1 = sim, 0 = não)' })
  filial_principal: number;

  @ApiPropertyOptional({ description: 'Endereços do cartório', type: Array })
  enderecos?: any[];

  @ApiPropertyOptional({ description: 'Contatos do cartório', type: Array })
  contatos?: any[];

  @ApiPropertyOptional({
    description: 'Dados do responsável pelo cartório',
    type: ResponsavelResponseDto,
  })
  responsavel?: ResponsavelResponseDto;

  @ApiProperty({ description: 'Situação (1 = ativo, 0 = inativo)' })
  situacao: number;

  @ApiPropertyOptional({ description: 'Motivo da desativação' })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Data de atualização' })
  updatedAt?: Date;
}

// ==================== DELETE DTO ====================
export class DeleteCartorioDto {
  @ApiProperty({
    example: 'Cartório fechado por irregularidades',
    description: 'Motivo da exclusão do cartório',
  })
  @IsNotEmpty({ message: 'O motivo é obrigatório' })
  @IsString({ message: 'O motivo deve ser uma string' })
  @MaxLength(500, { message: 'O motivo deve ter no máximo 500 caracteres' })
  motivo: string;
}
