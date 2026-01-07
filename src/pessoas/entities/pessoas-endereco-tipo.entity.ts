import { ApiProperty } from '@nestjs/swagger';

export class PessoasEnderecosTipoEntity {
  @ApiProperty({ description: 'ID do tipo de endereco', example: 1 })
  id: number;

  @ApiProperty({
    description: 'ID da pessoa proprietaria do tipo',
    example: 10,
  })
  id_pessoa: number;

  @ApiProperty({
    description: 'Descricao do tipo de endereco',
    example: 'Residencial',
  })
  descricao: string;

  @ApiProperty({ description: 'Situacao do registro (1 = ativo)', example: 1 })
  situacao: number;

  @ApiProperty({ description: 'Motivo da situacao', nullable: true })
  motivo: string | null;

  @ApiProperty({ description: 'Data de criacao' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da ultima atualizacao', nullable: true })
  updatedAt: Date | null;
}
