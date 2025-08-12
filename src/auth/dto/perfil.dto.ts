// perfil.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class PerfilDto {
    @ApiProperty()
  @IsInt()
  
  id_empresa: number;

  @ApiProperty()
  @IsString()
  descricao: string;
}
