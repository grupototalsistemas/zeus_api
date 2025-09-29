// empresas/empresa-tipo.controller.ts
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
  CreateEmpresaTipoDto,
  EmpresaTipoResponseDto,
  UpdateEmpresaTipoDto,
} from '../dto/empresa-tipo.dto';
import { EmpresaTipoService } from '../services/empresa-tipo.service';

@ApiTags('Tipos de Empresas')
@ApiBearerAuth()
@Controller('empresas-tipos')
export class EmpresaTipoController {
  constructor(private readonly empresaTipoService: EmpresaTipoService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo tipo de empresa',
    description: 'Cria um novo tipo vinculado a uma empresa',
  })
  @ApiBody({ type: CreateEmpresaTipoDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tipo criado com sucesso',
    type: EmpresaTipoResponseDto,
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
    description: 'Tipo com mesma descrição já existe para esta empresa',
  })
  create(@Body() dto: CreateEmpresaTipoDto): Promise<EmpresaTipoResponseDto> {
    return this.empresaTipoService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os tipos de empresa',
    description: 'Lista todos os tipos com filtros opcionais',
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
    name: 'descricao',
    required: false,
    description: 'Filtrar por descrição (busca parcial)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de tipos retornada com sucesso',
    type: [EmpresaTipoResponseDto],
  })
  findAll(
    @Query('ativo') ativo?: StatusRegistro,
    @Query('empresaId', new ParseIntPipe({ optional: true }))
    empresaId?: number,
    @Query('descricao') descricao?: string,
  ): Promise<EmpresaTipoResponseDto[]> {
    return this.empresaTipoService.findAll({ ativo, empresaId, descricao });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar tipo por ID',
    description: 'Retorna os dados de um tipo específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do tipo',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tipo encontrado',
    type: EmpresaTipoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tipo não encontrado',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmpresaTipoResponseDto> {
    return this.empresaTipoService.findOne(BigInt(id));
  }

  @Get('empresa/:empresaId')
  @ApiOperation({
    summary: 'Buscar tipos por empresa',
    description: 'Lista todos os tipos de uma empresa específica',
  })
  @ApiParam({
    name: 'empresaId',
    description: 'ID da empresa',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tipos da empresa encontrados',
    type: [EmpresaTipoResponseDto],
  })
  findByEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
  ): Promise<EmpresaTipoResponseDto[]> {
    return this.empresaTipoService.findByEmpresa(BigInt(empresaId));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar tipo',
    description: 'Atualiza os dados de um tipo existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do tipo',
    type: 'number',
  })
  @ApiBody({ type: UpdateEmpresaTipoDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tipo atualizado com sucesso',
    type: EmpresaTipoResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tipo não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Descrição do tipo já existe para esta empresa',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpresaTipoDto,
  ): Promise<EmpresaTipoResponseDto> {
    return this.empresaTipoService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir tipo',
    description: 'Exclui um tipo do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do tipo',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tipo excluído com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tipo não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tipo está sendo utilizado e não pode ser excluído',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.empresaTipoService.remove(BigInt(id));
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Ativar tipo',
    description: 'Ativa um tipo inativo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do tipo',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tipo ativado com sucesso',
    type: EmpresaTipoResponseDto,
  })
  activate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmpresaTipoResponseDto> {
    return this.empresaTipoService.activate(BigInt(id));
  }

  @Patch(':id/desactivate')
  @ApiOperation({
    summary: 'Desativar tipo',
    description: 'Desativa um tipo ativo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do tipo',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tipo desativado com sucesso',
    type: EmpresaTipoResponseDto,
  })
  deactivate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EmpresaTipoResponseDto> {
    return this.empresaTipoService.desactivate(BigInt(id));
  }
}
