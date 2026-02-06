import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateChamadoMovimentoMensagemDto {
  @ApiProperty({ example: 1, description: 'ID do movimento do chamado' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_chamado_movimento: number;

  @ApiProperty({ example: 1, description: 'ID do usuário que enviou' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_pessoa_usuario_envio: number;

  @ApiProperty({ example: 1, description: 'ID do usuário que leu' })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  id_pessoa_usuario_leitura: number;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Ordem da mensagem',
  })
  @IsOptional()
  @IsInt()
  ordem?: number;

  @ApiProperty({
    example: 'Mensagem de retorno sobre o chamado',
    description: 'Descrição da mensagem',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  descricao: string;

  @ApiProperty({
    example: '2024-01-01T10:00:00Z',
    required: false,
    description: 'Data e hora de envio',
  })
  @IsOptional()
  @IsDateString()
  dataHoraEnvio?: string;

  @ApiProperty({
    example: '2024-01-01T11:00:00Z',
    required: false,
    description: 'Data e hora de leitura',
  })
  @IsOptional()
  @IsDateString()
  dataHoraLeitura?: string;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Situação do registro',
  })
  @IsOptional()
  @IsInt()
  situacao?: number;

  @ApiProperty({ example: 'Motivo da alteração', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

export class UpdateChamadoMovimentoMensagemDto extends PartialType(
  CreateChamadoMovimentoMensagemDto,
) {}
