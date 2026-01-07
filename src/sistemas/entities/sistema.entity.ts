import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class Sistema {
  @ApiProperty({ description: 'ID único do sistema', example: 1 })
  id?: bigint;

  @ApiProperty({ description: 'ID da pessoa jurídica base', example: 1 })
  @IsNotEmpty({ message: 'ID da pessoa jurídica base é obrigatório' })
  @IsNumber()
  id_pessoa_juridica_base: bigint;

  @ApiProperty({
    description: 'Nome do sistema',
    example: 'Sistema Principal',
    maxLength: 50,
  })
  sistema: string;

  @ApiProperty({
    description: 'Descrição do sistema',
    example: 'Sistema de gestão principal',
    maxLength: 100,
  })
  descricao: string;

  @ApiProperty({
    description: 'Verificação do status web',
    example: '1',
  })
  @IsNotEmpty({ message: 'Status web é obrigatório' })
  @IsNumber()
  status_web: number;

  @ApiProperty({ description: 'Status do registro' })
  @IsNotEmpty({ message: 'Status é obrigatório' })
  @IsNumber()
  situacao: number;

  @ApiProperty({
    description: 'Motivo da alteração',
    required: false,
    maxLength: 500,
  })
  motivo?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
