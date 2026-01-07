import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { DeleteDto } from 'src/common/dto/delete.dto';
import { CreateSistemaDto, UpdateSistemaDto } from './dto/sistema.dto';

import { LogTableSistemas } from '../common/decorators/log-table.decorator';
import { Sistema } from './entities/sistema.entity';
import { SistemasService } from './sistemas.service';

@ApiTags('Sistemas')
@Controller('sistemas')
export class SistemasController {
  constructor(private readonly sistemasService: SistemasService) {}

  @Post()
  @LogTableSistemas()
  @ApiOperation({ summary: 'Criar novo sistema' })
  @ApiResponse({
    status: 201,
    description: 'Sistema criado com sucesso',
    type: Sistema,
  })
  create(@Body() createSistemaDto: CreateSistemaDto) {
    return this.sistemasService.create(createSistemaDto);
  }

  @Public()
  @Get()
  @LogTableSistemas()
  @ApiOperation({ summary: 'Listar todos os sistemas' })
  @ApiResponse({ status: 200, type: [Sistema] })
  findAll() {
    return this.sistemasService.findAll();
  }

  @Get(':id')
  @LogTableSistemas()
  @ApiOperation({ summary: 'Buscar sistema por ID' })
  @ApiResponse({ status: 200, type: Sistema })
  findOne(@Param('id') id: string) {
    return this.sistemasService.findOne(+id);
  }

  @Patch(':id')
  @LogTableSistemas()
  @ApiOperation({ summary: 'Atualizar sistema por ID' })
  @ApiResponse({ status: 200, type: Sistema })
  update(@Param('id') id: string, @Body() updateSistemaDto: UpdateSistemaDto) {
    return this.sistemasService.update(+id, updateSistemaDto);
  }

  @Delete(':id')
  @LogTableSistemas()
  @ApiOperation({ summary: 'Remover sistema por ID' })
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  @ApiResponse({ status: 200, description: 'Sistema removido com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Motivo não informado ou registro global',
  })
  @ApiResponse({ status: 404, description: 'Sistema não encontrado' })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.sistemasService.remove(+id, deleteData.motivo);
  }
}
