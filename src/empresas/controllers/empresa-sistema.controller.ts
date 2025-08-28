// empresas/empresa-sistema.controller.ts
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
import { CreateEmpresaSistemaDto, EmpresaSistemaResponseDto, UpdateEmpresaSistemaDto } from '../dto/create-empresa-sistema.dto';
import { EmpresaSistemaService } from '../services/empresa-sistema.service';

@ApiTags('Empresa Sistemas')
@ApiBearerAuth()
@Controller('empresas/sistemas')
export class EmpresaSistemaController {
  constructor(
    private readonly empresaSistemaService: EmpresaSistemaService
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Vincular sistema à empresa',
    description: 'Cria um vínculo entre empresa e sistema com versão específica'
  })
  @ApiBody({ type: CreateEmpresaSistemaDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Vínculo criado com sucesso',
    type: EmpresaSistemaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Empresa ou sistema não encontrados',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Vínculo já existe entre esta empresa e sistema',
  })
  create(@Body() dto: CreateEmpresaSistemaDto): Promise<EmpresaSistemaResponseDto> {
    return this.empresaSistemaService.create(dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos os vínculos empresa-sistema',
    description: 'Lista todos os vínculos com filtros opcionais'
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
    name: 'sistemaId', 
    required: false, 
    type: 'number',
    description: 'Filtrar por sistema específico'
  })
  @ApiQuery({ 
    name: 'versao', 
    required: false, 
    description: 'Filtrar por versão específica'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de vínculos retornada com sucesso',
    type: [EmpresaSistemaResponseDto],
  })
  findAll(
    @Query('ativo') ativo?: StatusRegistro,
    @Query('empresaId', new ParseIntPipe({ optional: true })) empresaId?: number,
    @Query('sistemaId', new ParseIntPipe({ optional: true })) sistemaId?: number,
    @Query('versao') versao?: string,
  ): Promise<EmpresaSistemaResponseDto[]> {
    return this.empresaSistemaService.findAll({ 
      ativo, 
      empresaId, 
      sistemaId, 
      versao 
    });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar vínculo por ID',
    description: 'Retorna os dados de um vínculo específico'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do vínculo',
    type: 'number'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vínculo encontrado',
    type: EmpresaSistemaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vínculo não encontrado',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EmpresaSistemaResponseDto> {
    return this.empresaSistemaService.findOne(BigInt(id));
  }

  @Get('empresa/:empresaId')
  @ApiOperation({ 
    summary: 'Buscar sistemas de uma empresa',
    description: 'Lista todos os sistemas vinculados a uma empresa específica'
  })
  @ApiParam({ 
    name: 'empresaId', 
    description: 'ID da empresa',
    type: 'number'
  })
  @ApiQuery({ 
    name: 'ativo', 
    required: false, 
    enum: StatusRegistro,
    description: 'Filtrar por status ativo/inativo'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sistemas da empresa encontrados',
    type: [EmpresaSistemaResponseDto],
  })
  findByEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Query('ativo') ativo?: StatusRegistro,
  ): Promise<EmpresaSistemaResponseDto[]> {
    return this.empresaSistemaService.findByEmpresa(BigInt(empresaId), ativo);
  }

  @Get('sistema/:sistemaId')
  @ApiOperation({ 
    summary: 'Buscar empresas que usam um sistema',
    description: 'Lista todas as empresas que possuem um sistema específico'
  })
  @ApiParam({ 
    name: 'sistemaId', 
    description: 'ID do sistema',
    type: 'number'
  })
  @ApiQuery({ 
    name: 'ativo', 
    required: false, 
    enum: StatusRegistro,
    description: 'Filtrar por status ativo/inativo'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Empresas que usam o sistema encontradas',
    type: [EmpresaSistemaResponseDto],
  })
  findBySistema(
    @Param('sistemaId', ParseIntPipe) sistemaId: number,
    @Query('ativo') ativo?: StatusRegistro,
  ): Promise<EmpresaSistemaResponseDto[]> {
    return this.empresaSistemaService.findBySistema(BigInt(sistemaId), ativo);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar vínculo empresa-sistema',
    description: 'Atualiza os dados de um vínculo existente'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do vínculo',
    type: 'number'
  })
  @ApiBody({ type: UpdateEmpresaSistemaDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vínculo atualizado com sucesso',
    type: EmpresaSistemaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vínculo não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflito na atualização do vínculo',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpresaSistemaDto
  ): Promise<EmpresaSistemaResponseDto> {
    return this.empresaSistemaService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remover vínculo empresa-sistema',
    description: 'Remove o vínculo entre empresa e sistema'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do vínculo',
    type: 'number'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vínculo removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vínculo não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Vínculo possui dependências e não pode ser removido',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.empresaSistemaService.remove(BigInt(id));
  }

  @Patch(':id/activate')
  @ApiOperation({ 
    summary: 'Ativar vínculo empresa-sistema',
    description: 'Ativa um vínculo inativo'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do vínculo',
    type: 'number'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vínculo ativado com sucesso',
    type: EmpresaSistemaResponseDto,
  })
  activate(@Param('id', ParseIntPipe) id: number): Promise<EmpresaSistemaResponseDto> {
    return this.empresaSistemaService.activate(BigInt(id));
  }

  @Patch(':id/deactivate')
  @ApiOperation({ 
    summary: 'Desativar vínculo empresa-sistema',
    description: 'Desativa um vínculo ativo'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do vínculo',
    type: 'number'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        motivo: {
          type: 'string',
          description: 'Motivo da desativação',
          maxLength: 500
        }
      },
      required: ['motivo']
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vínculo desativado com sucesso',
    type: EmpresaSistemaResponseDto,
  })
  deactivate(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string
  ): Promise<EmpresaSistemaResponseDto> {
    return this.empresaSistemaService.deactivate(BigInt(id), motivo);
  }

  @Patch(':id/update-version')
  @ApiOperation({ 
    summary: 'Atualizar versão do sistema',
    description: 'Atualiza apenas a versão de um vínculo empresa-sistema específico'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID do vínculo',
    type: 'number'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        versao: {
          type: 'string',
          description: 'Nova versão do sistema',
          maxLength: 50
        }
      },
      required: ['versao']
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Versão atualizada com sucesso',
    type: EmpresaSistemaResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vínculo não encontrado',
  })
  updateVersion(
    @Param('id', ParseIntPipe) id: number,
    @Body('versao') versao: string
  ): Promise<EmpresaSistemaResponseDto> {
    return this.empresaSistemaService.updateVersion(BigInt(id), versao);
  }
}