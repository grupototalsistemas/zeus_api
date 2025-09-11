// perfil.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class PerfilDto {
  @ApiProperty()
  @IsInt()
  empresaId: number;

  @ApiProperty()
  @IsString()
  descricao: string;
}
