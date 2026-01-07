import { ApiProperty } from '@nestjs/swagger';

import { IsNumber, IsString } from 'class-validator';

export class Modulo {
  @ApiProperty({ description: 'ID único do módulo', example: 1 })
  id?: bigint;

  @ApiProperty({ description: 'ID do módulo pai', example: -1, default: -1 })
  id_parent: bigint;

  @ApiProperty({ description: 'Nome da pagina', example: 'FormUsuarios' })
  @IsString()
  name_form_page: string;

  @ApiProperty({
    description: 'Índice do menu',
    example: '1.1',
    maxLength: 100,
  })
  component_index: string;

  @ApiProperty({
    description: 'Texto do menu',
    example: 'Usuários',
    maxLength: 100,
  })
  component_text: string;

  @ApiProperty({
    description: 'Nome do menu',
    example: 'usuarios',
    maxLength: 100,
  })
  component_name: string;

  @ApiProperty({
    description: 'Evento do menu',
    example: 'onUsuarios',
    maxLength: 100,
  })
  component_event: string;

  @ApiProperty({
    description: 'Teclas de atalho',
    example: 'Ctrl+U',
    maxLength: 100,
  })
  shortcutkeys: string;

  @ApiProperty({
    description: 'Status de visibilidade',
    example: 1,
    default: 1,
  })
  status_visible?: number;

  @ApiProperty({ description: 'Status do registro', example: 1, default: 1 })
  @IsNumber({}, { message: 'Status do registro deve ser um número' })
  situacao: number;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
