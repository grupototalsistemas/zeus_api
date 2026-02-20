import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { DeleteDto } from 'src/common/dto/delete.dto';
import {
  CreatePrioridadeDto,
  QueryPrioridadeDto,
  UpdatePrioridadeDto,
} from '../dto/prioridade.dto';
import { PrioridadeService } from '../services/prioridade.service';

@ApiTags('Prioridades')
@Public()
@Controller('prioridades')
export class PrioridadeController {
  constructor(private readonly prioridadeService: PrioridadeService) {}

  @Post()
  @ApiBody({
    description: 'Criação de uma nova prioridade',
    type: CreatePrioridadeDto,
  })
  @ApiOperation({ summary: 'Criar nova prioridade' })
  @ApiResponse({ status: 201, description: 'Prioridade criada com sucesso' })
  create(@Body() createPrioridadeDto: CreatePrioridadeDto) {
    return this.prioridadeService.create(createPrioridadeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as prioridades ativas' })
  @ApiQuery({
    name: 'id',
    required: false,
    type: Number,
    description: 'Filtrar por ID da prioridade',
  })
  @ApiQuery({
    name: 'id_pessoa_juridica',
    required: false,
    type: Number,
    description: 'Filtrar por ID da empresa',
  })
  @ApiQuery({
    name: 'descricao',
    required: false,
    type: String,
    description: 'Filtrar por descricao (parcial)',
  })
  @ApiQuery({
    name: 'cor',
    required: false,
    type: String,
    description: 'Filtrar por cor hexadecimal',
  })
  @ApiQuery({
    name: 'tempoResolucao',
    required: false,
    type: Number,
    description: 'Filtrar por tempo de resolucao exato (minutos)',
  })
  @ApiQuery({
    name: 'tempoResolucaoMin',
    required: false,
    type: Number,
    description: 'Filtrar por tempo de resolucao minimo (minutos)',
  })
  @ApiQuery({
    name: 'tempoResolucaoMax',
    required: false,
    type: Number,
    description: 'Filtrar por tempo de resolucao maximo (minutos)',
  })
  @ApiQuery({
    name: 'situacao',
    required: false,
    type: Number,
    description: 'Filtrar por situacao (1 ativo, 0 inativo)',
  })
  @ApiQuery({
    name: 'createdAt',
    required: false,
    type: String,
    description: 'Filtrar por data de criacao (ISO)',
  })
  @ApiResponse({ status: 200, description: 'Lista de prioridades' })
  findAll(@Query() query: QueryPrioridadeDto) {
    return this.prioridadeService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar prioridade por ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID da prioridade' })
  @ApiResponse({ status: 200, description: 'Prioridade encontrada' })
  @ApiResponse({ status: 404, description: 'Prioridade não encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prioridadeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar prioridade por ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID da prioridade' })
  @ApiBody({
    description: 'Dados para atualização da prioridade',
    type: UpdatePrioridadeDto,
  })
  @ApiResponse({ status: 200, description: 'Prioridade atualizada' })
  @ApiResponse({ status: 404, description: 'Prioridade não encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePrioridadeDto: UpdatePrioridadeDto,
  ) {
    return this.prioridadeService.update(id, updatePrioridadeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover prioridade por ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID da prioridade' })
  @ApiBody({
    type: DeleteDto,
    description: 'Motivo da exclusão',
  })
  @ApiResponse({ status: 200, description: 'Prioridade removida com sucesso' })
  @ApiResponse({ status: 400, description: 'Prioridade já está desativada' })
  @ApiResponse({ status: 404, description: 'Prioridade não encontrada' })
  remove(@Param('id', ParseIntPipe) id: number, @Body() deleteData: DeleteDto) {
    return this.prioridadeService.remove(id, deleteData.motivo);
  }
}
