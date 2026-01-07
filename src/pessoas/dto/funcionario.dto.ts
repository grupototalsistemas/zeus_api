import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class EnderecoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id_pessoa_endereco_tipo: number;

  @ApiProperty()
  @IsString()
  logradouro: string;

  @ApiProperty()
  @IsString()
  endereco: string;

  @ApiProperty()
  @IsString()
  numero: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  complemento: string;

  @ApiProperty()
  @IsString()
  bairro: string;

  @ApiProperty()
  @IsString()
  municipio: string;

  @ApiProperty()
  @IsString()
  municipio_ibge: string;

  @ApiProperty()
  @IsString()
  estado: string;

  @ApiProperty()
  @IsString()
  cep: string;
}

class ContatoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id_pessoa_contato_tipo: number;

  @ApiProperty()
  @IsString()
  descricao: string;
}

class DadoAdicionalDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id_pessoa_dado_adicional_tipo: number;

  @ApiProperty()
  @IsString()
  descricao: string;
}

class PessoaFisicaDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cpf: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nome_registro: string;

  @ApiProperty()
  @IsString()
  nome_social: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id_pessoa_genero: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id_pessoa_estado_civil: number;

  @ApiProperty()
  @IsNumber()
  cpf_justificativa: number;

  @ApiProperty()
  @IsString()
  doc_numero: string;

  @ApiProperty()
  @IsString()
  doc_emissor: string;

  @ApiProperty()
  @IsString()
  doc_data_emissao: string;

  @ApiProperty()
  @IsString()
  nacionalidade: string;

  @ApiProperty()
  @IsString()
  naturalidade: string;

  @ApiProperty()
  @IsString()
  data_nascimento: string;

  @ApiProperty({ type: [EnderecoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnderecoDto)
  @Transform(({ value }) => value || []) // ADICIONE ESTA LINHA
  enderecos: EnderecoDto[];

  @ApiProperty({ type: [ContatoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContatoDto)
  @Transform(({ value }) => value || []) // ADICIONE ESTA LINHA
  contatos: ContatoDto[];

  @ApiProperty({ type: [DadoAdicionalDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DadoAdicionalDto)
  @Transform(({ value }) => value || []) // ADICIONE ESTA LINHA
  dados_adicionais: DadoAdicionalDto[];
}

class FuncionarioDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  id_perfil?: number = 3; // Valor padrão 3

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  id_pessoa_juridica: number;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  pessoa: number;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  id_pessoa_tipo: number;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  id_pessoa_origem: number;

  @ApiProperty()
  @IsString()
  codigo: string;

  @ApiProperty()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  situacao: number;

  @ApiProperty({ type: [PessoaFisicaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PessoaFisicaDto)
  pessoas_fisicas: PessoaFisicaDto[];
}

export class CreateFuncionariosDto {
  @ApiProperty({
    type: [FuncionarioDto],
    example: [
      {
        id_pessoa_juridica: 1,
        pessoa: 1,
        id_pessoa_tipo: 6,
        id_pessoa_origem: 1,
        codigo: 'FUNC001',
        situacao: 1,
        pessoas_fisicas: [
          {
            cpf: '12345678901',
            nome_registro: 'João Silva Santos',
            nome_social: 'João Silva',
            id_pessoa_genero: 1,
            id_pessoa_estado_civil: 1,
            cpf_justificativa: 1,
            doc_numero: 'MG12345678',
            doc_emissor: 'SSP-MG',
            doc_data_emissao: '2020-05-15',
            nacionalidade: 'Brasileira',
            naturalidade: 'Belo Horizonte',
            data_nascimento: '1990-01-01',
            // SEM endereços, contatos e dados adicionais
          },
        ],
      },
      {
        id_pessoa_juridica: 1,
        pessoa: 1,
        id_pessoa_tipo: 6,
        id_pessoa_origem: 1,
        codigo: 'FUNC002',
        situacao: 1,
        pessoas_fisicas: [
          {
            cpf: '98765432100',
            nome_registro: 'Maria Oliveira Costa',
            nome_social: 'Maria Oliveira',
            id_pessoa_genero: 2,
            id_pessoa_estado_civil: 2,
            cpf_justificativa: 1,
            doc_numero: 'SP87654321',
            doc_emissor: 'SSP-SP',
            doc_data_emissao: '2019-08-20',
            nacionalidade: 'Brasileira',
            naturalidade: 'São Paulo',
            data_nascimento: '1985-03-15',
            enderecos: [
              {
                id_pessoa_endereco_tipo: 1,
                logradouro: 'Rua das Acácias',
                endereco: 'Residencial',
                numero: '456',
                complemento: 'Casa 2',
                bairro: 'Jardim Paulista',
                municipio: 'São Paulo',
                municipio_ibge: '3550308',
                estado: 'SP',
                cep: '01408-000',
              },
            ],
            contatos: [
              {
                id_pessoa_contato_tipo: 1,
                descricao: 'maria.oliveira@empresa.com',
              },
              {
                id_pessoa_contato_tipo: 2,
                descricao: '11988887777',
              },
            ],
            // SEM dados adicionais
          },
        ],
      },
    ],
    description: 'Lista de pessoas a serem cadastradas',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FuncionarioDto)
  pessoas: FuncionarioDto[];
}

export class DeleteFuncionarioDto {
  @ApiProperty({
    example: 'Demissão por justa causa',
    description: 'Motivo da exclusão do funcionário',
  })
  @IsNotEmpty()
  @IsString()
  motivo: string;
}

// ... (mantenha os DTOs existentes)

// DTO para atualização parcial do funcionário
class UpdatePessoaFisicaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nome_registro?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nome_social?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  id_pessoa_genero?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  id_pessoa_estado_civil?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  cpf_justificativa?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  doc_numero?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  doc_emissor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  doc_data_emissao?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nacionalidade?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  naturalidade?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  data_nascimento?: string;
}

// DTO para atualização parcial do funcionário
export class UpdateFuncionarioDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  id_perfil?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : value))
  @IsNumber()
  id_pessoa_juridica?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  codigo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  situacao?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePessoaFisicaDto)
  pessoa_fisica?: UpdatePessoaFisicaDto;

  @ApiProperty({ type: [EnderecoDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnderecoDto)
  enderecos?: EnderecoDto[];

  @ApiProperty({ type: [ContatoDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContatoDto)
  contatos?: ContatoDto[];

  @ApiProperty({ type: [DadoAdicionalDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DadoAdicionalDto)
  dados_adicionais?: DadoAdicionalDto[];
}
