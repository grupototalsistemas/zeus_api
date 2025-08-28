// empresas/empresa-categoria.controller.ts
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
import { CreateEmpresaCategoriaDto, EmpresaCategoriaResponseDto, UpdateEmpresaCategoriaDto } from '../dto/create-empresa-categoria.dto';
import { EmpresaCategoriaService } from '../services/categoria.service';

@ApiTags('Empresa Categorias')
@ApiBearerAuth()
@Controller('empresas/categorias')
export class EmpresaCategoriaController {
  constructor(
    private readonly empresaCategoriaService: EmpresaCategoriaService
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Criar nova categoria de empresa',
    description: 'Cria uma nova categoria vinculada a uma empresa'
  })
  @ApiBody({ type: CreateEmpresaCategoriaDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Categoria criada com sucesso',
    type: EmpresaCategoriaResponseDto,
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
    description: 'Categoria com mesma descrição já existe para esta empresa',
  })
  create(@Body() dto: CreateEmpresaCategoriaDto): Promise<EmpresaCategoriaResponseDto> {
    return this.empresaCategoriaService.create(dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todas as categorias de empresa',
    description: 'Lista todas as categorias com filtros opcionais'
  })
  @ApiQuery({ 
    name: 'ativo', 
    required: false, 
    enum: StatusRegistro,
    description: 'Filtrar por status ativo/inativo'
  })
  @ApiQuery({ 
    name: 'empresaId', 
    required: false, 
    type: 'number',
    description: 'Filtrar por empresa específica'
  })
  @ApiQuery({ 
    name: 'descricao', 
    required: false, 
    description: 'Filtrar por descrição (busca parcial)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de categorias retornada com sucesso',
    type: [EmpresaCategoriaResponseDto],
  })
  findAll(
    @Query('ativo') ativo?: StatusRegistro,
    @Query('empresaId', new ParseIntPipe({ optional: true })) empresaId?: number,
    @Query('descricao') descricao?: string,
  ): Promise<EmpresaCategoriaResponseDto[]> {
    return this.empresaCategoriaService.findAll({ ativo, empresaId, descricao });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar categoria por ID',
    description: 'Retorna os dados de uma categoria específica'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID da categoria',
    type: 'number'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoria encontrada',
    type: EmpresaCategoriaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Categoria não encontrada',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EmpresaCategoriaResponseDto> {
    return this.empresaCategoriaService.findOne(BigInt(id));
  }

  @Get('empresa/:empresaId')
  @ApiOperation({ 
    summary: 'Buscar categorias por empresa',
    description: 'Lista todas as categorias de uma empresa específica'
  })
  @ApiParam({ 
    name: 'empresaId', 
    description: 'ID da empresa',
    type: 'number'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categorias da empresa encontradas',
    type: [EmpresaCategoriaResponseDto],
  })
  findByEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number
  ): Promise<EmpresaCategoriaResponseDto[]> {
    return this.empresaCategoriaService.findByEmpresa(BigInt(empresaId));
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar categoria',
    description: 'Atualiza os dados de uma categoria existente'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID da categoria',
    type: 'number'
  })
  @ApiBody({ type: UpdateEmpresaCategoriaDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoria atualizada com sucesso',
    type: EmpresaCategoriaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Categoria não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Descrição da categoria já existe para esta empresa',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpresaCategoriaDto
  ): Promise<EmpresaCategoriaResponseDto> {
    return this.empresaCategoriaService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Excluir categoria',
    description: 'Exclui uma categoria do sistema'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID da categoria',
    type: 'number'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoria excluída com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Categoria não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Categoria está sendo utilizada e não pode ser excluída',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.empresaCategoriaService.remove(BigInt(id));
  }

  @Patch(':id/activate')
  @ApiOperation({ 
    summary: 'Ativar categoria',
    description: 'Ativa uma categoria inativa'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID da categoria',
    type: 'number'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoria ativada com sucesso',
    type: EmpresaCategoriaResponseDto,
  })
  activate(@Param('id', ParseIntPipe) id: number): Promise<EmpresaCategoriaResponseDto> {
    return this.empresaCategoriaService.activate(BigInt(id));
  }

  @Patch(':id/deactivate')
  @ApiOperation({ 
    summary: 'Desativar categoria',
    description: 'Desativa uma categoria ativa'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID da categoria',
    type: 'number'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoria desativada com sucesso',
    type: EmpresaCategoriaResponseDto,
  })
  deactivate(@Param('id', ParseIntPipe) id: number): Promise<EmpresaCategoriaResponseDto> {
    return this.empresaCategoriaService.deactivate(BigInt(id));
  }
}