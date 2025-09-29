// sistemas/sistemas.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { StatusRegistro } from '@prisma/client';
import {
  CreateSistemaDto,
  SistemaResponseDto,
  UpdateSistemaDto,
} from '../dto/sistema.dto';
import { SistemasService } from '../services/sistemas.service';

@ApiTags('Sistemas')
@ApiBearerAuth()
@Controller('sistemas')
export class SistemasController {
  constructor(private readonly sistemasService: SistemasService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo sistema',
    description: 'Cria um novo sistema vinculado a uma empresa',
  })
  @ApiBody({ type: CreateSistemaDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sistema criado com sucesso',
    type: SistemaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Empresa não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Sistema com mesmo nome já existe para esta empresa',
  })
  create(@Body() dto: CreateSistemaDto): Promise<SistemaResponseDto> {
    return this.sistemasService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os sistemas',
    description: 'Lista todos os sistemas com filtros opcionais',
  })
  @ApiQuery({
    name: 'ativo',
    required: false,
    enum: StatusRegistro,
    description: 'Filtrar por status ativo/inativo',
  })
  @ApiQuery({
    name: 'empresaId',
    required: false,
    type: 'number',
    description: 'Filtrar por empresa específica',
  })
  @ApiQuery({
    name: 'nome',
    required: false,
    description: 'Filtrar por nome do sistema (busca parcial)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de sistemas retornada com sucesso',
    type: [SistemaResponseDto],
  })
  findAll(
    @Query('ativo') ativo?: StatusRegistro,
    @Query('empresaId', new ParseIntPipe({ optional: true }))
    empresaId?: number,
    @Query('nome') nome?: string,
  ): Promise<SistemaResponseDto[]> {
    return this.sistemasService.findAll({ ativo, empresaId, nome });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar sistema por ID',
    description: 'Retorna os dados de um sistema específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do sistema',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sistema encontrado',
    type: SistemaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sistema não encontrado',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SistemaResponseDto> {
    return this.sistemasService.findOne(BigInt(id));
  }

  @Get('empresa/:empresaId')
  @ApiOperation({
    summary: 'Buscar sistemas por empresa',
    description: 'Lista todos os sistemas de uma empresa específica',
  })
  @ApiParam({
    name: 'empresaId',
    description: 'ID da empresa',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sistemas da empresa encontrados',
    type: [SistemaResponseDto],
  })
  findByEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ): Promise<SistemaResponseDto[]> {
    return this.sistemasService.findByEmpresa(BigInt(empresaId));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar sistema',
    description: 'Atualiza os dados de um sistema existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do sistema',
    type: 'number',
  })
  @ApiBody({ type: UpdateSistemaDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sistema atualizado com sucesso',
    type: SistemaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sistema não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Nome do sistema já existe para esta empresa',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSistemaDto,
  ): Promise<SistemaResponseDto> {
    return this.sistemasService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir sistema',
    description: 'Exclui um sistema do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do sistema',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sistema excluído com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sistema não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Sistema possui relacionamentos e não pode ser excluído',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sistemasService.remove(BigInt(id));
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Ativar sistema',
    description: 'Ativa um sistema inativo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do sistema',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sistema ativado com sucesso',
    type: SistemaResponseDto,
  })
  activate(@Param('id', ParseIntPipe) id: number): Promise<SistemaResponseDto> {
    return this.sistemasService.activate(BigInt(id));
  }

  @Patch(':id/desactivate')
  @ApiOperation({
    summary: 'Desativar sistema',
    description: 'Desativa um sistema ativo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do sistema',
    type: 'number',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        motivo: {
          type: 'string',
          description: 'Motivo da desativação',
          maxLength: 500,
        },
      },
      required: ['motivo'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sistema desativado com sucesso',
    type: SistemaResponseDto,
  })
  deactivate(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
  ): Promise<SistemaResponseDto> {
    return this.sistemasService.desactivate(BigInt(id), motivo);
  }
}
