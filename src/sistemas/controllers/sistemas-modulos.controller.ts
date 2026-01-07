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
  CreateSistemasModulosDto,
  DeleteSistemaModuloDto,
  UpdateSistemaModuloDto,
} from '../dto/sistemas-modulos.dto';
import { SistemasModulosService } from '../services/sistemas-modulos.service';

@ApiTags('Sistemas - Módulos')
@Controller('sistemas-modulos')
export class SistemasModulosController {
  constructor(
    private readonly sistemasModulosService: SistemasModulosService,
  ) {}

  @Post()
  @LogTableSistemas()
  @ApiOperation({
    summary: 'Criar múltiplos vínculos entre sistemas e módulos',
    description:
      'Permite vincular múltiplos módulos a sistemas de uma vez. Retorna sucessos e falhas.',
  })
  @ApiBody({ type: CreateSistemasModulosDto })
  @ApiResponse({
    status: 201,
    description: 'Vínculos criados com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({
    status: 404,
    description: 'Sistema ou módulo não encontrado',
  })
  @ApiResponse({ status: 409, description: 'Vínculo já existe' })
  async create(@Body() dto: CreateSistemasModulosDto) {
    return this.sistemasModulosService.create(dto);
  }

  @Get()
  @LogTableSistemas()
  @ApiOperation({
    summary: 'Listar todos os vínculos entre sistemas e módulos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de vínculos',
  })
  async findAll() {
    return this.sistemasModulosService.findAll();
  }

  @Get(':id')
  @LogTableSistemas()
  @ApiOperation({ summary: 'Buscar vínculo por ID' })
  @ApiParam({ name: 'id', description: 'ID do vínculo' })
  @ApiResponse({ status: 200, description: 'Vínculo encontrado' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sistemasModulosService.findOne(id);
  }

  @Get('sistema/:id_sistema')
  @LogTableSistemas()
  @ApiOperation({ summary: 'Buscar módulos por sistema' })
  @ApiParam({ name: 'id_sistema', description: 'ID do sistema' })
  @ApiResponse({
    status: 200,
    description: 'Lista de módulos do sistema',
  })
  @ApiResponse({ status: 404, description: 'Nenhum módulo encontrado' })
  async findBySistema(@Param('id_sistema', ParseIntPipe) id_sistema: number) {
    return this.sistemasModulosService.findBySistema(id_sistema);
  }

  @Patch(':id')
  @LogTableSistemas()
  @ApiOperation({ summary: 'Atualizar vínculo entre sistema e módulo' })
  @ApiParam({ name: 'id', description: 'ID do vínculo' })
  @ApiBody({ type: UpdateSistemaModuloDto })
  @ApiResponse({ status: 200, description: 'Vínculo atualizado' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSistemaModuloDto,
  ) {
    return this.sistemasModulosService.update(id, dto);
  }

  @Delete(':id')
  @LogTableSistemas()
  @ApiOperation({
    summary: 'Remover vínculo entre sistema e módulo (exclusão lógica)',
    description:
      'Realiza exclusão lógica alterando situacao para 0 e registrando motivo',
  })
  @ApiParam({ name: 'id', description: 'ID do vínculo' })
  @ApiBody({ type: DeleteSistemaModuloDto })
  @ApiResponse({ status: 200, description: 'Vínculo removido' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteData: DeleteSistemaModuloDto,
  ) {
    return this.sistemasModulosService.remove(id, deleteData);
  }
}
