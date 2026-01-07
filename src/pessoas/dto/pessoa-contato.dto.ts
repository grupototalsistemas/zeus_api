import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreatePessoasContatosDto {
  @ApiProperty({
    description: 'ID do tipo de contato',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'O campo id_pessoa_contato_tipo é obrigatório' })
  @IsNumber()
  id_pessoa_contato_tipo: number;

  @ApiProperty({
    description: 'ID da pessoa',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'O campo id_pessoa é obrigatório' })
  @IsNumber()
  id_pessoa: number;

  @ApiProperty({
    description: 'Descrição do contato',
    example: '(21) 98765-4321',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'O campo descricao é obrigatório' })
  @IsString()
  @MaxLength(50)
  descricao: string;
}

export class UpdatePessoasContatosDto extends PartialType(
  CreatePessoasContatosDto,
) {}

export class PessoasContatosResponseDto {
  @ApiProperty({ description: 'ID do contato', type: String })
  id: string;

  @ApiProperty({ description: 'ID do tipo de contato', type: String })
  id_pessoa_contato_tipo: string;

  @ApiProperty({ description: 'ID da pessoa', type: String })
  id_pessoa: string;

  @ApiProperty({ description: 'Descrição do contato' })
  descricao: string;

  @ApiProperty({ description: 'Situação do contato' })
  situacao: number;

  @ApiProperty({ description: 'Motivo da situação', nullable: true })
  motivo: string | null;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', nullable: true })
  updatedAt: Date | null;
}
