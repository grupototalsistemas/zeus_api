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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PessoaEnderecoExamples } from '../docs/pessoa-endereco.example';
import {
  CreatePessoasEnderecosDto,
  DeletePessoasEnderecosDto,
  QueryPessoasEnderecosDto,
  UpdatePessoasEnderecosDto,
} from '../dto/pessoa-endereco.dto';
import { PessoasEnderecosEntity } from '../entities/pessoas-endereco.entity';
import { PessoasEnderecosService } from '../services/pessoas-enderecos.service';
import { LogTablePessoas } from '../../common/decorators/log-table.decorator';

@ApiTags('Pessoas - Enderecos')
@Controller('pessoas-enderecos')
export class PessoasEnderecosController {
  constructor(
    private readonly pessoasEnderecosService: PessoasEnderecosService,
  ) {}

  @Post()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Criar endereco para uma pessoa' })
  @ApiBody({
    type: CreatePessoasEnderecosDto,
    examples: PessoaEnderecoExamples,
  })
  @ApiResponse({
    status: 201,
    description: 'Endereco criado',
    type: PessoasEnderecosEntity,
  })
  create(@Body() dto: CreatePessoasEnderecosDto) {
    return this.pessoasEnderecosService.create(dto);
  }

  @Get()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Listar enderecos cadastrados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de enderecos',
    type: [PessoasEnderecosEntity],
  })
  findAll(@Query() query: QueryPessoasEnderecosDto) {
    return this.pessoasEnderecosService.findAll(query);
  }

  @Get(':id')
  @LogTablePessoas()
  @ApiOperation({ summary: 'Buscar endereco por ID' })
  @ApiParam({ name: 'id', description: 'ID do endereco' })
  @ApiResponse({
    status: 200,
    description: 'Endereco encontrado',
    type: PessoasEnderecosEntity,
  })
  @ApiResponse({ status: 404, description: 'Endereco nao encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pessoasEnderecosService.findOne(id);
  }

  @Patch(':id')
  @LogTablePessoas()
  @ApiOperation({ summary: 'Atualizar endereço' })
  @ApiParam({ name: 'id', description: 'ID do endereco' })
  @ApiBody({
    type: UpdatePessoasEnderecosDto,
    examples: PessoaEnderecoExamples,
  })
  @ApiResponse({
    status: 200,
    description: 'Endereco atualizado',
    type: PessoasEnderecosEntity,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePessoasEnderecosDto,
  ) {
    return this.pessoasEnderecosService.update(id, dto);
  }

  @Delete(':id')
  @LogTablePessoas()
  @ApiOperation({ summary: 'Excluir endereco (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID do endereco' })
  @ApiBody({ type: DeletePessoasEnderecosDto })
  @ApiResponse({ status: 200, description: 'Endereco inativado' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DeletePessoasEnderecosDto,
  ) {
    return this.pessoasEnderecosService.remove(id, dto);
  }
}
