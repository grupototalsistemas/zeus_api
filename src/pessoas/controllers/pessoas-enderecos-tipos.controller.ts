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
import { PessoaEnderecoTipoExamples } from '../docs/pessoa-endereco-tipo.example';
import {
  CreatePessoasEnderecosTipoDto,
  DeletePessoasEnderecosTipoDto,
  QueryPessoasEnderecosTipoDto,
  UpdatePessoasEnderecosTipoDto,
} from '../dto/pessoa-endereco-tipo.dto';
import { PessoasEnderecosTipoEntity } from '../entities/pessoas-endereco-tipo.entity';
import { PessoasEnderecosTiposService } from '../services/pessoas-enderecos-tipos.service';
import { LogTablePessoas } from '../../common/decorators/log-table.decorator';

@ApiTags('Pessoas - Tipos de Endereco')
@Controller('pessoas-enderecos-tipos')
export class PessoasEnderecosTiposController {
  constructor(
    private readonly pessoasEnderecosTiposService: PessoasEnderecosTiposService,
  ) {}

  @Post()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Criar tipo de endereco para uma pessoa' })
  @ApiBody({
    type: CreatePessoasEnderecosTipoDto,
    examples: PessoaEnderecoTipoExamples,
  })
  @ApiResponse({
    status: 201,
    description: 'Tipo criado',
    type: PessoasEnderecosTipoEntity,
  })
  create(@Body() dto: CreatePessoasEnderecosTipoDto) {
    return this.pessoasEnderecosTiposService.create(dto);
  }

  @Get()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Listar tipos de endereco' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos',
    type: [PessoasEnderecosTipoEntity],
  })
  findAll(@Query() query: QueryPessoasEnderecosTipoDto) {
    return this.pessoasEnderecosTiposService.findAll(query);
  }

  @Get(':id')
  @LogTablePessoas()
  @ApiOperation({ summary: 'Buscar tipo por ID' })
  @ApiParam({ name: 'id', description: 'ID do tipo' })
  @ApiResponse({
    status: 200,
    description: 'Tipo encontrado',
    type: PessoasEnderecosTipoEntity,
  })
  @ApiResponse({ status: 404, description: 'Tipo nao encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pessoasEnderecosTiposService.findOne(id);
  }

  @Patch(':id')
  @LogTablePessoas()
  @ApiOperation({ summary: 'Atualizar tipo de endereço' })
  @ApiParam({ name: 'id', description: 'ID do tipo' })
  @ApiBody({
    type: UpdatePessoasEnderecosTipoDto,
    examples: PessoaEnderecoTipoExamples,
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo atualizado',
    type: PessoasEnderecosTipoEntity,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePessoasEnderecosTipoDto,
  ) {
    return this.pessoasEnderecosTiposService.update(id, dto);
  }

  @Delete(':id')
  @LogTablePessoas()
  @ApiOperation({ summary: 'Excluir tipo de endereco (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID do tipo' })
  @ApiBody({ type: DeletePessoasEnderecosTipoDto })
  @ApiResponse({ status: 200, description: 'Tipo inativado' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DeletePessoasEnderecosTipoDto,
  ) {
    return this.pessoasEnderecosTiposService.remove(id, dto);
  }
}
