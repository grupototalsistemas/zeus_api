import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LogTableSistemas } from '../../common/decorators/log-table.decorator';
import {
  CreateModuloPerfilPermissaoDto,
  DeleteModuloPerfilPermissaoDto,
  UpdateModuloPerfilPermissaoDto,
} from '../dto/modulos-perfis-permissoes.dto';
import { ModulosPerfisPermissoesService } from '../services/modulos-perfis-permissoes.service';

@ApiTags('Módulos - Perfis e Permissões')
@Controller('modulos-perfis-permissoes')
export class ModulosPerfisPermissoesController {
  constructor(
    private readonly modulosPerfisPermissoesService: ModulosPerfisPermissoesService,
  ) {}

  @Post()
  @LogTableSistemas()
  @ApiOperation({
    summary: 'Criar múltiplas permissões de módulos para perfis',
    description:
      'Permite criar múltiplas permissões de acesso a módulos para perfis de uma vez. Retorna sucessos e falhas.',
  })
  @ApiBody({ type: [CreateModuloPerfilPermissaoDto] })
  @ApiResponse({
    status: 201,
    description: 'Permissões criadas com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({
    status: 404,
    description: 'Módulo ou perfil não encontrado',
  })
  @ApiResponse({ status: 409, description: 'Permissão já existe' })
  async create(@Body() permissoes: CreateModuloPerfilPermissaoDto[]) {
    return this.modulosPerfisPermissoesService.create(permissoes);
  }

  @Get()
  @LogTableSistemas()
  @ApiOperation({ summary: 'Listar todas as permissões de módulos e perfis' })
  @ApiResponse({
    status: 200,
    description: 'Lista de permissões',
  })
  async findAll() {
    return this.modulosPerfisPermissoesService.findAll();
  }

  @Get(':id')
  @LogTableSistemas()
  @ApiOperation({ summary: 'Buscar permissão por ID' })
  @ApiParam({ name: 'id', description: 'ID da permissão' })
  @ApiResponse({ status: 200, description: 'Permissão encontrada' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.modulosPerfisPermissoesService.findOne(id);
  }

  @Get('perfil/:id_pessoa_juridica_perfil')
  @LogTableSistemas()
  @ApiOperation({ summary: 'Buscar permissões por perfil' })
  @ApiParam({
    name: 'id_pessoa_juridica_perfil',
    description: 'ID do perfil',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de permissões do perfil',
  })
  @ApiResponse({ status: 404, description: 'Nenhuma permissão encontrada' })
  async findByPerfil(
    @Param('id_pessoa_juridica_perfil', ParseIntPipe)
    id_pessoa_juridica_perfil: number,
  ) {
    return this.modulosPerfisPermissoesService.findByPerfil(
      id_pessoa_juridica_perfil,
    );
  }

  @Get('modulo/:id_modulo')
  @LogTableSistemas()
  @ApiOperation({ summary: 'Buscar permissões por módulo' })
  @ApiParam({ name: 'id_modulo', description: 'ID do módulo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de permissões do módulo',
  })
  @ApiResponse({ status: 404, description: 'Nenhuma permissão encontrada' })
  async findByModulo(@Param('id_modulo', ParseIntPipe) id_modulo: number) {
    return this.modulosPerfisPermissoesService.findByModulo(id_modulo);
  }

  @Patch(':id')
  @LogTableSistemas()
  @ApiOperation({ summary: 'Atualizar permissões de módulo para perfil' })
  @ApiParam({ name: 'id', description: 'ID da permissão' })
  @ApiBody({ type: UpdateModuloPerfilPermissaoDto })
  @ApiResponse({ status: 200, description: 'Permissão atualizada' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModuloPerfilPermissaoDto,
  ) {
    return this.modulosPerfisPermissoesService.update(id, dto);
  }

  @Delete(':id')
  @LogTableSistemas()
  @ApiOperation({
    summary: 'Remover permissão (exclusão lógica)',
    description:
      'Realiza exclusão lógica alterando situacao para 0 e registrando motivo',
  })
  @ApiParam({ name: 'id', description: 'ID da permissão' })
  @ApiBody({ type: DeleteModuloPerfilPermissaoDto })
  @ApiResponse({ status: 200, description: 'Permissão removida' })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteData: DeleteModuloPerfilPermissaoDto,
  ) {
    return this.modulosPerfisPermissoesService.remove(id, deleteData);
  }
}
