import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 1, description: 'ID da pessoa associada ao usuário' })
  @IsNotEmpty()
  @IsInt()
  pessoaId: number;

  @ApiProperty({ example: 2, description: 'ID do perfil do usuário' })
  @IsNotEmpty()
  @IsInt()
  perfilId: number;

  @ApiProperty({ example: 'joao@email.com', description: 'Email do usuário' })
  @IsEmail()
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
  @MinLength(6)
  senha: string;
}
