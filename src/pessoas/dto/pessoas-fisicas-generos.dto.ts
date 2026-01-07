import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreatePessoasFisicasGenerosDto {
  @ApiProperty({
    description: 'Genero',
    example: 'Masculino',
    type: String,
  })
  @IsNotEmpty({ message: 'O campo genero é obrigatório' })
  @IsString()
  @MaxLength(100)
  genero: string;
  @ApiProperty({
    description: 'Descrição do gênero',
    example: 'Pessoa que se identifica como masculino',
    type: String,
  })
  @IsNotEmpty({ message: 'O campo descricao é obrigatório' })
  @IsString()
  @MaxLength(100)
  descricao: string;
}

export class UpdatePessoasFisicasGenerosDto extends PartialType(
  CreatePessoasFisicasGenerosDto,
) { }

export class DeletePessoasFisicasGenerosDto {

  @ApiProperty({
    description: 'ID do gênero',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'O campo id é obrigatório' })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Situação do gênero (1 = ativo, 0 = inativo)',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'O campo situacao é obrigatório' })
  @IsNumber()
  situacao: number;

  @ApiProperty({
    description: 'Motivo da exclusão do gênero',
    example: 'Gênero descontinuado',
  })
  @IsNotEmpty({ message: 'O campo motivo é obrigatório' })
  @IsString()
  motivo: string;
}

export class PessoasFisicasGenerosResponseDto {
  @ApiProperty({ description: 'ID do gênero', type: String })
  id: string
  @ApiProperty({ description: 'Gênero', type: String })
  genero: string
  @ApiProperty({ description: 'Descrição do gênero' })
  descricao: string
  @ApiProperty({ description: 'Situação do gênero' })
  situacao: number
  @ApiProperty({ description: 'Motivo da situação', nullable: true })
  motivo: string | null
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date | null
  @ApiProperty({ description: 'Data de atualização', nullable: true })
  updatedAt: Date | null
}