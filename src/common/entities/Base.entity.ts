import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BaseEntity {
  @ApiProperty({ description: 'ID do registro', required: false })
  @Type(() => Number)
  id?: number;

  @ApiProperty({
    description: 'Situação do registro (1: Ativo, 0: Inativo)',
    required: false,
  })
  @Type(() => Number)
  situacao?: number;

  @ApiProperty({
    description: 'Motivo de alteração',
    required: false,
    nullable: true,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação', required: false })
  createdAt?: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}

export class BaseQueryEntity {
  @ApiProperty({
    description: 'Situação do registro (1: Ativo, 0: Inativo)',
    required: false,
  })
  @Type(() => Number)
  situacao?: number;

  @ApiProperty({ description: 'Data de criação', required: false })
  createdAt?: Date;
}
