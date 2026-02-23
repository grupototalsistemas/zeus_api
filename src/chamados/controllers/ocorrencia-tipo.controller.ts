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
import { ocorrenciaTipoExample } from '../docs/ocorrencia-tipo.example';
import {
  CreateOcorrenciaTipoDto,
  QueryOcorrenciaTipoDto,
  UpdateOcorrenciaTipoDto,
} from '../dto/ocorrencia-tipo.dto';
import { OcorrenciaTipoService } from '../services/ocorrencia-tipo.service';

@ApiTags('Ocorrencias - Tipos')
@Controller('ocorrencias-tipo')
export class OcorrenciaTipoController {
  constructor(private readonly ocorrenciaTipoService: OcorrenciaTipoService) {}

  @Post()
  @ApiBody({
    description: 'Criacao de um novo tipo de ocorrencia',
    type: CreateOcorrenciaTipoDto,
    examples: ocorrenciaTipoExample.create,
  })
  @ApiOperation({ summary: 'Criar novo tipo de ocorrencia' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de ocorrencia criado com sucesso',
  })
  create(@Body() createOcorrenciaTipoDto: CreateOcorrenciaTipoDto) {
    return this.ocorrenciaTipoService.create(createOcorrenciaTipoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os tipos de ocorrencia ativos' })
  @ApiQuery({
    name: 'id',
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
  @ApiResponse({ status: 200, description: 'Lista de tipos de ocorrencia' })
  findAll(@Query() query: QueryOcorrenciaTipoDto) {
    return this.ocorrenciaTipoService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tipo de ocorrencia por ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID do tipo de ocorrencia' })
  @ApiResponse({ status: 200, description: 'Tipo de ocorrencia encontrado' })
  @ApiResponse({
    status: 404,
    description: 'Tipo de ocorrencia nao encontrado',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ocorrenciaTipoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tipo de ocorrencia por ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID do tipo de ocorrencia' })
  @ApiBody({
    description: 'Dados para atualizacao do tipo de ocorrencia',
    type: UpdateOcorrenciaTipoDto,
    examples: ocorrenciaTipoExample.update,
  })
  @ApiResponse({ status: 200, description: 'Tipo de ocorrencia atualizado' })
  @ApiResponse({
    status: 404,
    description: 'Tipo de ocorrencia nao encontrado',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOcorrenciaTipoDto: UpdateOcorrenciaTipoDto,
  ) {
    return this.ocorrenciaTipoService.update(id, updateOcorrenciaTipoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover tipo de ocorrencia por ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID do tipo de ocorrencia' })
  @ApiBody({
    type: DeleteDto,
    description: 'Motivo da exclusao',
    examples: ocorrenciaTipoExample.delete,
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de ocorrencia removido com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Tipo de ocorrencia ja desativado' })
  @ApiResponse({
    status: 404,
    description: 'Tipo de ocorrencia nao encontrado',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Body() deleteData: DeleteDto) {
    return this.ocorrenciaTipoService.remove(id, deleteData.motivo);
  }
}
