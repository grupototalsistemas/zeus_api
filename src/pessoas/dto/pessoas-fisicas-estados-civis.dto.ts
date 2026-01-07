import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreatePessoasFisicasEstadosCivisDto {
  @ApiProperty({
    description: 'Descrição do estado civil',
    example: 'Solteiro',
    type: String,
  })
  @IsNotEmpty({ message: 'O campo descricao é obrigatório' })
  @IsString()
  descricao: string;
}

export class UpdatePessoasFisicasEstadosCivisDto extends PartialType(
  CreatePessoasFisicasEstadosCivisDto,
) { }

export class DeletePessoasFisicasEstadosCivisDto {

  @ApiProperty({
    description: 'ID do estado civil',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'O campo id é obrigatório' })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Situação do estado civil (1 = ativo, 0 = inativo)',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'O campo situacao é obrigatório' })
  @IsNumber()
  situacao: number;
  
  @ApiProperty({
    description: 'Motivo da exclusão do estado civil',
    example: 'Estado civil descontinuado',
  })
  @IsNotEmpty({ message: 'O campo motivoExclusao é obrigatório' })
  @IsString()
  motivo: string;
}

export class PessoasFisicasEstadosCivisResponseDto {
  @ApiProperty({ description: 'ID do estado civil', type: String })
  id: string;
  @ApiProperty({ description: 'Descrição do estado civil' })
  descricao: string
  @ApiProperty({ description: 'Situação do estado civil' })
  situacao:number
  @ApiProperty({ description: 'Motivo da situação', nullable: true })
  motivo: string | null
  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date | null
  @ApiProperty({ description: 'Data de atualização', nullable: true })
  updatedAt: Date | null
}