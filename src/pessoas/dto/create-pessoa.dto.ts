// pessoas/dto/create-pessoa.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusGenero, StatusRegistro } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePessoaDto {
  @ApiProperty({
    description: 'ID da empresa vinculada',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  empresaId: number;

  @ApiProperty({
    description: 'ID do tipo da pessoa',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  tipoId: number;

  @ApiProperty({
    description: 'Gênero da pessoa',
    enum: StatusGenero,
    example: StatusGenero.NEUTRO,
  })
  @IsNotEmpty()
  @IsEnum(StatusGenero)
  genero: StatusGenero = StatusGenero.NEUTRO;

  @ApiProperty({
    description: 'Nome completo da pessoa',
    example: 'João da Silva',
  })
  @IsNotEmpty()
  @IsString()
  nome: string;

  @ApiPropertyOptional({
    description: 'Nome social da pessoa (opcional)',
    example: 'Joana',
  })
  @IsOptional()
  @IsString()
  nomeSocial?: string;

  @ApiProperty({
    description: 'Status do registro da pessoa',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  @IsNotEmpty()
  @IsEnum(StatusRegistro)
  ativo: StatusRegistro = StatusRegistro.ATIVO;
}
