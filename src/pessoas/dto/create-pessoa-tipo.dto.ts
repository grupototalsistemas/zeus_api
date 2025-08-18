import { ApiProperty } from '@nestjs/swagger';
import { StatusRegistro } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePessoaTipoDto {
  @ApiProperty({ example: 1, description: 'ID da empresa' })
  @IsNotEmpty()
  @IsNumber()
  empresaId: number;

  @ApiProperty({
    example: 'Cliente',
    description: 'Descrição do tipo de pessoa',
  })
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsNotEmpty()
  @IsEnum(StatusRegistro)
  ativo: StatusRegistro = StatusRegistro.ATIVO;
}
