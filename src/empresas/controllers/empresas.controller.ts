// empresas/empresas.controller.ts
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
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateEmpresaDto, UpdateEmpresaDto } from '../dto/create-empresa.dto';

import { EmpresasService } from '../services/empresas.service';

@ApiTags('Empresas')
@ApiBearerAuth()
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nova empresa',
    description:
      'Cria uma nova empresa no sistema com validações de CNPJ e dados obrigatórios',
  })
  @ApiBody({ type: CreateEmpresaDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Empresa criada com sucesso',
    type: CreateEmpresaDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou CNPJ já cadastrado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tipo ou categoria da empresa não encontrados',
  })
  create(@Body() dto: CreateEmpresaDto): Promise<CreateEmpresaDto> {
    return this.empresasService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Listar todas as empresas',
    description: 'Lista todas as empresas com filtros opcionais',
  })
  @ApiQuery({
    name: 'ativo',
    required: false,
    enum: StatusRegistro,
    description: 'Filtrar por status ativo/inativo',
  })
  @ApiQuery({
    name: 'cnpj',
    required: false,
    description: 'Filtrar por CNPJ específico',
  })
  @ApiQuery({
    name: 'razaoSocial',
    required: false,
    description: 'Filtrar por razão social (busca parcial)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de empresas retornada com sucesso',
    type: [CreateEmpresaDto],
  })
  findAll(
    @Query('ativo') ativo?: StatusRegistro,
    @Query('cnpj') cnpj?: string,
    @Query('razaoSocial') razaoSocial?: string,
  ): Promise<CreateEmpresaDto[]> {
    return this.empresasService.findAll({ ativo, cnpj, razaoSocial });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar empresa por ID',
    description:
      'Retorna os dados de uma empresa específica incluindo relacionamentos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Empresa encontrada',
    type: CreateEmpresaDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Empresa não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID inválido',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CreateEmpresaDto> {
    return this.empresasService.findOne(BigInt(id));
  }

  @Get(':id/complete')
  @ApiOperation({
    summary: 'Buscar empresa completa',
    description:
      'Retorna empresa com todos os relacionamentos (tipos, categorias, sistemas)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Empresa completa encontrada',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Empresa não encontrada',
  })
  findOneComplete(@Param('id', ParseIntPipe) id: number) {
    return this.empresasService.findOneComplete(BigInt(id));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar empresa',
    description: 'Atualiza os dados de uma empresa existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    type: 'number',
  })
  @ApiBody({ type: UpdateEmpresaDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Empresa atualizada com sucesso',
    type: CreateEmpresaDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Empresa não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpresaDto,
  ): Promise<CreateEmpresaDto> {
    return this.empresasService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir empresa',
    description: 'Exclui uma empresa do sistema (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Empresa excluída com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Empresa não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Empresa possui relacionamentos e não pode ser excluída',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.empresasService.remove(BigInt(id));
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Ativar empresa',
    description: 'Ativa uma empresa inativa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Empresa ativada com sucesso',
    type: CreateEmpresaDto,
  })
  activate(@Param('id', ParseIntPipe) id: number): Promise<CreateEmpresaDto> {
    return this.empresasService.activate(BigInt(id));
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Desativar empresa',
    description: 'Desativa uma empresa ativa',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
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
    description: 'Empresa desativada com sucesso',
    type: CreateEmpresaDto,
  })
  deactivate(
    @Param('id', ParseIntPipe) id: number,
    @Body('motivo') motivo: string,
  ): Promise<CreateEmpresaDto> {
    return this.empresasService.deactivate(BigInt(id), motivo);
  }
}
