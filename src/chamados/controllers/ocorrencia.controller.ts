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
import { DeleteDto } from 'src/common/dto/delete.dto';
import {
  CreateOcorrenciaDto,
  QueryOcorrenciaDto,
  UpdateOcorrenciaDto,
} from '../dto/ocorrencia.dto';
import { OcorrenciaService } from '../services/ocorrencia.service';

@ApiTags('Ocorrencias')
@Controller('ocorrencias')
export class OcorrenciaController {
  constructor(private readonly ocorrenciaService: OcorrenciaService) {}

  @Post()
  @ApiBody({
    description: 'Criação de uma nova ocorrência',
    type: CreateOcorrenciaDto,
  })
  @ApiOperation({ summary: 'Criar nova ocorrencia' })
  @ApiResponse({ status: 201, description: 'Ocorrencia criada com sucesso' })
  create(@Body() createOcorrenciaDto: CreateOcorrenciaDto) {
    return this.ocorrenciaService.create(createOcorrenciaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as ocorrencias ativas' })
  @ApiQuery({
    name: 'id',
    required: false,
    type: Number,
    description: 'Filtrar por ID da ocorrencia',
  })
  @ApiQuery({
    name: 'id_ocorrencia_tipo',
    required: false,
    type: Number,
    description: 'Filtrar por ID do tipo de ocorrencia',
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
  @ApiResponse({ status: 200, description: 'Lista de ocorrencias' })
  findAll(@Query() query: QueryOcorrenciaDto) {
    return this.ocorrenciaService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ocorrencia por ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID da ocorrencia' })
  @ApiResponse({ status: 200, description: 'Ocorrencia encontrada' })
  @ApiResponse({ status: 404, description: 'Ocorrencia não encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ocorrenciaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ocorrencia por ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID da ocorrencia' })
  @ApiBody({
    description: 'Dados para atualização da ocorrencia',
    type: UpdateOcorrenciaDto,
  })
  @ApiResponse({ status: 200, description: 'Ocorrencia atualizada' })
  @ApiResponse({ status: 404, description: 'Ocorrencia não encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOcorrenciaDto: UpdateOcorrenciaDto,
  ) {
    return this.ocorrenciaService.update(id, updateOcorrenciaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover ocorrencia por ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID da ocorrencia' })
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  @ApiResponse({ status: 200, description: 'Ocorrencia removida com sucesso' })
  @ApiResponse({ status: 400, description: 'Ocorrencia ja esta desativada' })
  @ApiResponse({ status: 404, description: 'Ocorrencia não encontrada' })
  remove(@Param('id', ParseIntPipe) id: number, @Body() deleteData: DeleteDto) {
    return this.ocorrenciaService.remove(id, deleteData.motivo);
  }
}
