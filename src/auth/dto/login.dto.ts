import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class NaoAutorizado {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'usuario Teste',
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'teste@gmail.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  login: string;

  @ApiProperty({
    description: 'ID do sistema',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'O campo id_sistema é obrigatório' })
  @IsInt({ message: 'O campo id_sistema deve ser um número inteiro' })
  @IsPositive({ message: 'O campo id_sistema deve ser positivo' })
  @Type(() => Number)
  sistema: number;
}

export class LoginSenhaDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'teste@gmail.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  login: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha',
    minLength: 4,
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(4, { message: 'A senha deve ter no mínimo 4 caracteres' })
  senha: string;

  @ApiProperty({
    description: 'ID do sistema',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'O campo id_sistema é obrigatório' })
  @IsInt({ message: 'O campo id_sistema deve ser um número inteiro' })
  @IsPositive({ message: 'O campo id_sistema deve ser positivo' })
  @Type(() => Number)
  sistema: number;
}

export class ChaveSenhaApiDto {
  @ApiProperty({
    description: 'Chave informada pelo administrador',
  })
  @IsString({ message: 'A chave deve ser uma string' })
  @MinLength(4, { message: 'A chave deve ter no mínimo 4 caracteres' })
  @IsNotEmpty({ message: 'A chave é obrigatória' })
  chave: string;

  @ApiProperty({
    description: 'Senha informado pelo administrador',
    example: '123456',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(4, { message: 'A senha deve ter no mínimo 4 caracteres' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  senha: string;

  @ApiPropertyOptional({
    description: 'ID do sistema',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'O campo id_sistema deve ser um número inteiro' })
  @IsPositive({ message: 'O campo id_sistema deve ser positivo' })
  @Type(() => Number)
  sistema?: number;
}

export class FirstUpdateSenhaLoginDto {
  @ApiPropertyOptional({
    description: 'Senha master informado pelo administrador',
    example: '123456',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(4, { message: 'A senha master deve ter no mínimo 4 caracteres' })
  @IsOptional()
  senha_master?: string;

  @ApiProperty({
    description: 'Crie uma Senha do usuário',
    example: 'nova senha',
    minLength: 4,
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(4, { message: 'A senha deve ter no mínimo 4 caracteres' })
  nova_senha: string;

  @ApiProperty({
    description: 'Confirme a senha do usuário',
    example: 'confirmar a senha',
    minLength: 4,
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(4, { message: 'A senha deve ter no mínimo 4 caracteres' })
  confirmacao_nova_senha: string;

  @ApiPropertyOptional({
    description: 'novo email do usuário',
    example: 'novoemail@gmail.com',
    type: String,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;
}

export class CriarChaveDto {
  @ApiProperty({
    description: 'CNPJ da pessoa jurídica',
    example: '23389805000174',
  })
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @ApiProperty({
    description: 'Serventia (descrição tipo 1)',
    example: '8888',
  })
  @IsString()
  @IsNotEmpty()
  serventia: string;

  @ApiProperty({
    description: 'CNS (descrição tipo 2)',
    example: '888888',
  })
  @IsString()
  @IsNotEmpty()
  cns: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'ID do usuário' })
  id_pessoa_usuario: number;

  @ApiProperty({ description: 'Nome de login do usuário' })
  nome_login: string;

  @ApiProperty({ description: 'Indica se é o primeiro acesso' })
  first_access: boolean;

  @ApiProperty({ description: 'ID da pessoa' })
  id_pessoa: number;

  @ApiProperty({ description: 'ID da pessoa física' })
  id_pessoa_fisica: number;

  @ApiProperty({ description: 'CPF da pessoa física' })
  cpf: string;

  @ApiProperty({ description: 'Nome de registro da pessoa' })
  nome_registro: string;

  @ApiProperty({ description: 'Nome social da pessoa', nullable: true })
  nome_social: string | null;

  @ApiProperty({ description: 'Token JWT de acesso' })
  access_token: string;
}
