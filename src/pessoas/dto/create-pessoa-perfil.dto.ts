import { ApiProperty } from '@nestjs/swagger';
import { StatusRegistro } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePessoaPerfilDto {
  @ApiProperty({ example: 1, description: 'ID da empresa' })
  @IsNotEmpty()
  @IsNumber()
  empresaId: number;

  @ApiProperty({
    example: 'Cliente',
    description: 'Descrição do Perfil de pessoa',
  })
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsNotEmpty()
  @IsEnum(StatusRegistro)
  ativo: StatusRegistro = StatusRegistro.ATIVO;

  @IsOptional()
  @IsString()
  motivo?: string;
}
