// pessoa.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { StatusGenero } from '@prisma/client';
import { IsInt, IsString } from 'class-validator';

export class PessoaDto {
  @ApiProperty()
  @IsInt()
  id_empresa: number;

  @ApiProperty()
  @IsInt()
  id_pessoa_tipo: number;

  @ApiProperty()
  @IsString()
  genero: StatusGenero;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsString()
  nome_social: string;
}
