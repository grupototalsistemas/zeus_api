import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

export enum FirstAccessEnum {
  NAO = 0,
  SIM = 1,
}

export class BasePessoaUsuarioDto {
  @ApiProperty({
    description: 'ID da pessoa física vinculada ao usuário. Ex: 123',
  })
  @Type(() => Number)
  @IsInt()
  id_pessoa_fisica: number;

  @ApiProperty({
    description: 'Nome de login usado para autenticação. Ex: jdoe',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  nome_login: string;

  @ApiProperty({
    description: 'E-mail do usuário. Ex: jdoe@example.com',
  })
  @IsString()
  @IsEmail()
  login: string;

  @ApiProperty({
    description: 'Indica se é o primeiro acesso do usuário (0 = Não, 1 = Sim)',
    enum: FirstAccessEnum,
  })
  @IsEnum(FirstAccessEnum)
  @Type(() => Number)
  first_access: FirstAccessEnum;
}

export class CreatePessoaUsuarioDto extends PickType(BasePessoaUsuarioDto, [
  'id_pessoa_fisica',
  'nome_login',
  'login',
  'first_access',
] as const) {
  @ApiPropertyOptional({
    description: 'Senha de acesso do usuário (mínimo 4 caracteres)',
  })
  @IsString()
  @IsOptional()
  @IsStrongPassword({
    minLength: 4,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  senha?: string;

  @ApiPropertyOptional({
    description: 'Senha master (nível de permissão superior)',
  })
  @IsString()
  @IsOptional()
  @IsStrongPassword({
    minLength: 4,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  senha_master?: string;
}

export class ResponsePessoaUsuarioDto extends BasePessoaUsuarioDto {
  @ApiProperty({
    description: 'Data de criação do registro (ISO). Ex: 2025-10-10T12:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  created_at?: string;

  @ApiProperty({
    description: 'Data da última atualização (ISO). Ex: 2025-10-10T13:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  updated_at?: string;
}

export class UpdatePessoaUsuariosDto extends PartialType(
  CreatePessoaUsuarioDto,
) {
  @ApiProperty({
    description: 'Nova senha (opcional, mínimo 4 caracteres)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsStrongPassword({
    minLength: 4,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  senha?: string;

  @ApiProperty({
    description: 'Nova senha master (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsStrongPassword({
    minLength: 4,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  senha_master?: string;
}

export class QueryPessoaUsuarioDto extends BaseQueryDto(
  ResponsePessoaUsuarioDto,
) {
  @ApiProperty({
    description: 'Filtrar pelo nome de login (exato ou parcial). Ex: jdoe',
    required: false,
  })
  @IsOptional()
  @IsString()
  nome_login?: string;

  @ApiProperty({
    description: 'Filtrar por e-mail exato. Ex: jdoe@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  login?: string;

  @ApiProperty({
    description: 'Filtrar por flag de primeiro acesso (0 = Não, 1 = Sim)',
    enum: FirstAccessEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(FirstAccessEnum)
  @Type(() => Number)
  first_access?: FirstAccessEnum;
}
