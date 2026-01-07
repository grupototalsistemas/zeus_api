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
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PessoasFisicasEstadosCivisService } from '../services/pessoas-fisicas-estados-civis.service';
import {
  CreatePessoasFisicasEstadosCivisDto,
  UpdatePessoasFisicasEstadosCivisDto,
  DeletePessoasFisicasEstadosCivisDto
} from '../dto/pessoas-fisicas-estados-civis.dto';
import { estadosCivisExample } from '../docs/pessoas-fisicas-estados-civis.example';
import { LogTablePessoas } from '../../common/decorators/log-table.decorator';

@ApiTags('Pessoas - Estados Civis')
@Controller('pessoas-fisicas-estados-civis')
export class PessoasFisicasEstadosCivisController {
  constructor(private readonly estadosCivisService: PessoasFisicasEstadosCivisService) { }

  @Post()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Criar novos estados civis para pessoas físicas' })
  @ApiBody({
    description: 'Criação de estados civis para pessoas físicas.',
    type: [CreatePessoasFisicasEstadosCivisDto],
    examples: estadosCivisExample.create,
  })
  @ApiResponse({ status: 201, description: 'Estados civis criados com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 500, description: 'Erro interno de servidor.' })
  create(@Body() createEstadosCivisDto: CreatePessoasFisicasEstadosCivisDto[]) {
    return this.estadosCivisService.create(createEstadosCivisDto);
  }

  @Get()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Listar todos os estados civis ativos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados civis retornada com sucesso.'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno de servidor.'
  })
  async findAll() {
    return this.estadosCivisService.findAll();
  }

  @Get(':id')
  @LogTablePessoas()
  @ApiOperation({
    summary: 'Buscar um estado civil pelo ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do estado civil',
    type: Number,
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Estado civil encontrado com sucesso.'
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido.'
  })
  @ApiResponse({
    status: 404,
    description: 'Estado civil não encontrado.'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno de servidor.'
  })
  async findOne(@Param('id') id: string) {
    return this.estadosCivisService.findOne(+id);
  }

  @Patch(':id')
  @LogTablePessoas()
  @ApiOperation({
    summary: 'Atualizar um estado civil pelo ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do estado civil',
    type: Number,
    example: 1
  })
  @ApiBody({
    description: 'Dados para atualização do estado civil.',
    type: UpdatePessoasFisicasEstadosCivisDto,
    examples: estadosCivisExample.update,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado civil atualizado com sucesso.'
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos.'
  })
  @ApiResponse({
    status: 404,
    description: 'Estado civil não encontrado.'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno de servidor.'
  })
  update(@Param('id') id: string, @Body() updateEstadoCivilDto: UpdatePessoasFisicasEstadosCivisDto) {
    return this.estadosCivisService.update(+id, updateEstadoCivilDto);
  }

  @Delete()
  @LogTablePessoas()
  @ApiOperation({
    summary: 'Excluir um estado civil (soft delete)'
  })
  @ApiBody({
    description: 'Dados para exclusão do estado civil.',
    type: DeletePessoasFisicasEstadosCivisDto,
    examples: estadosCivisExample.delete,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado civil excluído com sucesso.'
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos.'
  })
  @ApiResponse({
    status: 404,
    description: 'Estado civil não encontrado.'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno de servidor.'
  })
  remove(@Body() deleteDto: DeletePessoasFisicasEstadosCivisDto) {
    return this.estadosCivisService.remove(deleteDto);
  }
}