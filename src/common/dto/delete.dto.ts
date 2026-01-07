import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DeleteDto {
  @ApiProperty({
    example: 'Motivo da exclusão/desativação',
    description: 'Motivo da exclusão do item',
  })
  @IsNotEmpty({ message: 'O motivo é obrigatório' })
  @IsString({ message: 'O motivo deve ser uma string' })
  @MaxLength(500, { message: 'O motivo deve ter no máximo 500 caracteres' })
  motivo: string;
}
