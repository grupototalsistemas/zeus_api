// auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'dellatorredeveloper@gmail.com',
    description: 'Email do usuário',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  login: string;

  @ApiProperty({
    example: '1234',
    description: 'Senha do usuário',
  })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(4, { message: 'Senha deve ter no mínimo 4 caracteres' })
  senha: string;

  @ApiProperty({
    example: 2,
    description: 'ID do sistema que está sendo acessado',
  })
  @IsNumber({}, { message: 'ID do sistema deve ser um número' })
  @IsNotEmpty({ message: 'ID do sistema é obrigatório' })
  sistema: number;

  //   @ApiProperty({
  //     example: 'web',
  //     description: 'Dispositivo de acesso',
  //     required: false,
  //   })
  //   @IsOptional()
  //   @IsString()
  //   device?: string;
}

// auth/dto/login-response.dto.ts
export class UserDataDto {
  id: number;
  nome_login: string;
  login: string;
  nome_completo: string;
  empresa: string;
  id_pessoa_fisica: number;
  id_pessoa_juridica: number;
  id_perfil: number;
  id_sistema: number;
  juridica_principal: boolean;
  first_access: boolean;
}

export class PermissaoDto {
  insert: boolean;
  update: boolean;
  search: boolean;
  delete: boolean;
  print: boolean;
}

export class ModuloPermissaoDto {
  id_modulo: number;
  modulo: string;
  component_name: string;
  component_text: string;
  permissoes: PermissaoDto;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Token de acesso JWT' })
  accessToken: string;

  @ApiProperty({ description: 'Token para renovação' })
  refreshToken: string;

  @ApiProperty({ description: 'Dados do usuário' })
  user: UserDataDto;

  @ApiProperty({
    description: 'Permissões do usuário',
    type: [ModuloPermissaoDto],
  })
  permissoes: ModuloPermissaoDto[];
}

// auth/dto/refresh-token.dto.ts
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token para renovação',
  })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token é obrigatório' })
  refreshToken: string;
}

// auth/dto/change-password.dto.ts
export class ChangePasswordDto {
  @ApiProperty({
    example: '1234',
    description: 'Senha atual',
  })
  @IsString()
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  oldPassword: string;

  @ApiProperty({
    example: 'NovaSenha@123',
    description: 'Nova senha',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(8, { message: 'Nova senha deve ter no mínimo 8 caracteres' })
  newPassword: string;

  @ApiProperty({
    example: 'NovaSenha@123',
    description: 'Confirmação da nova senha',
  })
  @IsString()
  @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
  confirmPassword: string;
}

// auth/dto/logout.dto.ts
export class LogoutDto {
  @ApiProperty({
    description: 'Token atual para invalidação',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
