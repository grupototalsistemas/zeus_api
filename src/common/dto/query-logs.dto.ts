import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class QueryLogsDto {
  @ApiProperty({
    description: 'ID do usuário para filtrar logs',
    required: false,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  id_usuario?: number;

  @ApiProperty({
    description: 'Nome do endpoint para filtrar',
    required: false,
    example: 'lancamentos',
  })
  @IsOptional()
  @IsString()
  endpoint_name?: string;

  @ApiProperty({
    description: 'Ação para filtrar (CREATE, READ, UPDATE, DELETE)',
    required: false,
    example: 'CREATE',
  })
  @IsOptional()
  @IsString()
  action_page?: string;

  @ApiProperty({
    description: 'Nome da tabela para filtrar',
    required: false,
    example: 'lancamentos',
  })
  @IsOptional()
  @IsString()
  table_name?: string;

  @ApiProperty({
    description: 'Data de início para filtrar (ISO 8601)',
    required: false,
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @ApiProperty({
    description: 'Data de fim para filtrar (ISO 8601)',
    required: false,
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  data_fim?: string;

  @ApiProperty({
    description: 'Mostrar apenas logs com erro',
    required: false,
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  apenas_erros?: boolean;

  @ApiProperty({
    description: 'Página para paginação',
    required: false,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Itens por página',
    required: false,
    example: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;
}
