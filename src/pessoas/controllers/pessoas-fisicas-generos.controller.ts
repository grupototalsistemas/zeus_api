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
import { PessoasFisicasGenerosService } from '../services/pessoas-fisicas-generos.service';
import {
  CreatePessoasFisicasGenerosDto,
  UpdatePessoasFisicasGenerosDto,
  DeletePessoasFisicasGenerosDto
} from '../dto/pessoas-fisicas-generos.dto';
import { generosExample } from '../docs/pessoas-fisicas-generos.example';
import { LogTablePessoas } from '../../common/decorators/log-table.decorator';

@ApiTags('Pessoas - Gêneros')
@Controller('pessoas-fisicas-generos')
export class PessoasFisicasGenerosController {
  constructor(private readonly generosService: PessoasFisicasGenerosService) { }

  @Post()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Criar novos gêneros para pessoas físicas' })
  @ApiBody({
    description: 'Criação de gêneros para pessoas físicas.',
    type: [CreatePessoasFisicasGenerosDto],
    examples: generosExample.create,
  })
  @ApiResponse({ status: 201, description: 'Gêneros criados com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 500, description: 'Erro interno de servidor.' })
  create(@Body() createGenerosDto: CreatePessoasFisicasGenerosDto[]) {
    return this.generosService.create(createGenerosDto);
  }

  @Get()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Listar todos os gêneros ativos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de gêneros retornada com sucesso.'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno de servidor.'
  })
  async findAll() {
    return this.generosService.findAll();
  }

  @Get(':id')
  @LogTablePessoas()
  @ApiOperation({
    summary: 'Buscar um gênero pelo ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do gênero',
    type: Number,
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Gênero encontrado com sucesso.'
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido.'
  })
  @ApiResponse({
    status: 404,
    description: 'Gênero não encontrado.'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno de servidor.'
  })
  async findOne(@Param('id') id: string) {
    return this.generosService.findOne(+id);
  }

  @Patch(':id')
  @LogTablePessoas()
  @ApiOperation({
    summary: 'Atualizar um gênero pelo ID'
  })
  @ApiParam({
    name: 'id',
    description: 'ID do gênero',
    type: Number,
    example: 1
  })
  @ApiBody({
    description: 'Dados para atualização do gênero.',
    type: UpdatePessoasFisicasGenerosDto,
    examples: generosExample.update,
  })
  @ApiResponse({
    status: 200,
    description: 'Gênero atualizado com sucesso.'
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos.'
  })
  @ApiResponse({
    status: 404,
    description: 'Gênero não encontrado.'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno de servidor.'
  })
  update(@Param('id') id: string, @Body() updateGeneroDto: UpdatePessoasFisicasGenerosDto) {
    return this.generosService.update(+id, updateGeneroDto);
  }

  @Delete()
  @LogTablePessoas()
  @ApiOperation({
    summary: 'Excluir um gênero (soft delete)'
  })
  @ApiBody({
    description: 'Dados para exclusão do gênero.',
    type: DeletePessoasFisicasGenerosDto,
    examples: generosExample.delete,
  })
  @ApiResponse({
    status: 200,
    description: 'Gênero excluído com sucesso.'
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos.'
  })
  @ApiResponse({
    status: 404,
    description: 'Gênero não encontrado.'
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno de servidor.'
  })
  remove(@Body() deleteDto: DeletePessoasFisicasGenerosDto) {
    return this.generosService.remove(deleteDto);
  }
}
