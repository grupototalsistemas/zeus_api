import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class FindChamadosQueryDto {
  @ApiPropertyOptional({
    description: 'Número de registros a pular (paginação)',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  skip?: number;

  @ApiPropertyOptional({
    description: 'Número de registros a retornar (paginação)',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  take?: number;

  @ApiPropertyOptional({
    description: 'Campo para ordenação (ex: id, titulo, criado_em)',
    example: 'id',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({
    description: 'Direção da ordenação (asc ou desc)',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  orderDirection?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Filtrar por ID do sistema',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_sistema?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID da empresa',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_pessoa_juridica?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID da prioridade',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_prioridade?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID do usuário',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_pessoa_usuario?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por situação (1=ativo, 0=inativo)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  situacao?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por texto no título ou descrição',
    example: 'problema',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
