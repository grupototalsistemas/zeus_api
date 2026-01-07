import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { DeleteDto } from 'src/common/dto/delete.dto';
import { CreateModuloDto, UpdateModuloDto } from '../dto/modulo.dto';

import { LogTableModulos } from '../../common/decorators/log-table.decorator';
import { Modulo } from '../entities/modulo.entity';
import { ModulosService } from '../services/modulos.service';

@ApiTags('Modulos')
@Controller('modulos')
export class ModulosController {
  constructor(private readonly modulosService: ModulosService) {}

  @Post()
  @LogTableModulos()
  @ApiOperation({ summary: 'Criar novo modulo' })
  @ApiQuery({
    name: 'id_sistema',
    required: false,
    description: 'ID do sistema para vincular o módulo recém-criado',
    type: Number,
  })
  @ApiResponse({
    status: 201,
    description: 'Modulo criado com sucesso',
    type: Modulo,
  })
  create(
    @Body() createModuloDto: CreateModuloDto,
    @Query('id_sistema') id_sistema?: string,
  ) {
    const sistemaId = id_sistema ? BigInt(id_sistema) : undefined;
    return this.modulosService.create(createModuloDto, sistemaId);
  }

  @Public()
  @Get()
  @LogTableModulos()
  @ApiOperation({ summary: 'Listar todos os modulos' })
  @ApiResponse({ status: 200, description: 'Lista de modulos', type: [Modulo] })
  findAll() {
    return this.modulosService.findAll();
  }

  @Get(':id_sistema')
  @LogTableModulos()
  @ApiOperation({
    summary:
      'Listar todos os modulos com seus submodulos a partir do id_sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de modulos com submodulos',
    type: [Modulo],
  })
  findAllWithSubModulos(@Param('id_sistema') id_sistema: string) {
    return this.modulosService.findAllBySistema(BigInt(id_sistema));
  }

  @Get(':id')
  @LogTableModulos()
  @ApiOperation({ summary: 'Buscar modulo por ID' })
  @ApiResponse({ status: 200, description: 'Modulo encontrado', type: Modulo })
  @ApiResponse({ status: 404, description: 'Modulo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.modulosService.findOne(BigInt(id));
  }

  @Patch(':id')
  @LogTableModulos()
  @ApiOperation({ summary: 'Atualizar modulo' })
  @ApiResponse({
    status: 200,
    description: 'Modulo atualizado com sucesso',
    type: Modulo,
  })
  @ApiResponse({ status: 404, description: 'Modulo não encontrado' })
  update(@Param('id') id: string, @Body() updateModuloDto: UpdateModuloDto) {
    return this.modulosService.update(BigInt(id), updateModuloDto);
  }

  @Delete(':id')
  @LogTableModulos()
  @ApiOperation({ summary: 'Remover modulo' })
  @ApiBody({ type: DeleteDto })
  @ApiResponse({ status: 200, description: 'Modulo removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Modulo não encontrado' })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.modulosService.remove(BigInt(id), deleteData.motivo);
  }

  @Delete('childrens/:id')
  @LogTableModulos()
  @ApiOperation({ summary: 'Remover todos os filhos do modulo informado' })
  @ApiBody({ type: DeleteDto })
  @ApiResponse({ status: 200, description: 'Modulos removidos com sucesso' })
  @ApiResponse({ status: 404, description: 'Modulos não encontrados' })
  async removeAllChildrens(
    @Param('id') id: string,
    @Body() deleteData: DeleteDto,
  ) {
    await this.modulosService.removeAllChildrens(BigInt(id), deleteData.motivo);
    return this.modulosService.remove(BigInt(id), deleteData.motivo);
  }
}
