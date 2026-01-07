import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreatePessoasDadosAdicionaisDto {
  @ApiProperty({
    description: 'ID do tipo de dado adicional',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({
    message: 'O campo id_pessoa_dado_adicional_tipo é obrigatório',
  })
  @IsNumber()
  id_pessoa_dado_adicional_tipo: number;

  @ApiProperty({
    description: 'ID da pessoa',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'O campo id_pessoa é obrigatório' })
  @IsNumber()
  id_pessoa: number;

  @ApiProperty({
    description: 'Descrição do dado adicional',
    example: 'Informação complementar',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'O campo descricao é obrigatório' })
  @IsString()
  @MaxLength(50)
  descricao: string;
}

export class UpdatePessoasDadosAdicionaisDto extends PartialType(
  CreatePessoasDadosAdicionaisDto,
) {}

export class PessoasDadosAdicionaisResponseDto {
  @ApiProperty({ description: 'ID do dado adicional', type: String })
  id: string;

  @ApiProperty({ description: 'ID do tipo de dado adicional', type: String })
  id_pessoa_dado_adicional_tipo: string;

  @ApiProperty({ description: 'ID da pessoa', type: String })
  id_pessoa: string;

  @ApiProperty({ description: 'Descrição' })
  descricao: string;

  @ApiProperty({ description: 'Situação' })
  situacao: number;

  @ApiProperty({ description: 'Motivo', nullable: true })
  motivo: string | null;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', nullable: true })
  updatedAt: Date | null;
}
