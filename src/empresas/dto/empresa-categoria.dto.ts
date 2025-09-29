// src/dtos/empresa-categoria/create-empresa-categoria.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { EmpresaCategoria } from '../entity/empresa-categoria.entity';

export class CreateEmpresaCategoriaDto {
  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  @Transform(({ value }) => BigInt(value))
  empresaId: bigint;

  @ApiProperty({
    description: 'Descrição da categoria',
    example: 'Tecnologia',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(100, { message: 'Descrição deve ter no máximo 100 caracteres' })
  descricao: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
    default: StatusRegistro.ATIVO,
  })
  @IsEnum(StatusRegistro, { message: 'Status deve ser um valor válido' })
  ativo: StatusRegistro = StatusRegistro.ATIVO;
}

// src/dtos/empresa-categoria/update-empresa-categoria.dto.ts
export class UpdateEmpresaCategoriaDto extends PartialType(EmpresaCategoria) {}

// src/dtos/empresa-categoria/empresa-categoria-response.dto.ts
export class EmpresaCategoriaResponseDto {
  @ApiProperty({ description: 'ID único da categoria', example: '1' })
  @Transform(({ value }) => value.toString())
  id: string;

  @ApiProperty({ description: 'ID da empresa', example: '1' })
  @Transform(({ value }) => value.toString())
  empresaId: string;

  @ApiProperty({ description: 'Descrição da categoria', example: 'Tecnologia' })
  descricao: string;

  @ApiProperty({
    description: 'Status',
    enum: StatusRegistro,
    example: StatusRegistro.ATIVO,
  })
  ativo: StatusRegistro;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', required: false })
  updatedAt?: Date;
}
