import { ApiProperty } from '@nestjs/swagger';
import { StatusRegistro } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { CreatePessoaDto } from './create-pessoa.dto';

export class CreatePessoaUsuarioDto {
  @ApiProperty({ example: CreatePessoaDto, description: 'Objeto da pessoa' })
  @IsNotEmpty()
  pessoa: CreatePessoaDto;

  @ApiProperty({ example: 2, description: 'ID do perfil do usuário' })
  @IsNotEmpty()
  @IsNumber()
  perfilId: number;

  @ApiProperty({ example: 'joao@email.com', description: 'Email do usuário' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: 'joaosilva', description: 'Login do usuário' })
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty({
    example: 'senhaSegura123',
    description: 'Senha do usuário (mínimo 6 caracteres)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  senha: string;

  @IsNotEmpty()
  @IsEnum(StatusRegistro)
  ativo: StatusRegistro = StatusRegistro.ATIVO;

  @IsOptional()
  @IsString()
  motivo?: string;
}
