// pessoa.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { StatusGenero } from '@prisma/client';
import { IsInt, IsString } from 'class-validator';

export class PessoaDto {
  @ApiProperty()
  @IsInt()
  empresaId: number;

  @ApiProperty()
  @IsInt()
  tipoId: number;

  @ApiProperty()
  @IsString()
  genero: StatusGenero;

  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsString()
  nomeSocial?: string;
}
