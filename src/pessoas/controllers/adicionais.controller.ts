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
import { FuncionariosAdicionaisTiposService } from '../services/adicionais.service';
import { CreatePessoasDadosAdicionaisTipoDto, DeletePessoasDadosAdicionaisTipoDto, UpdatePessoasDadosAdicionaisTipoDto } from '../dto/pessoa-dados-adicionais-tipo.dto';
import { adicionaisTiposExample} from '../docs/adicionaisTipos.example';
import { LogTablePessoas } from '../../common/decorators/log-table.decorator';

@ApiTags('Pessoas - Tipos Adicionais')
@Controller('pessoas-adicionais')
export class FuncionariosAdicionaisController {
  constructor(private readonly AdicionaisService: FuncionariosAdicionaisTiposService) { }

  @Post()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Inserir tipos de adicionais para pessoas' })
  @ApiBody({
    description: 'Inclusão de tipos de adicionais para pessoas.',
    type: CreatePessoasDadosAdicionaisTipoDto,
    examples: adicionaisTiposExample,
  })
  @ApiResponse({ status: 201, description: 'Adicional criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Recurso não encontrado.' })
  @ApiResponse({ status: 500, description: 'Erro interno de servidor.' })
  create(@Body() createAdicionalTipoDto: CreatePessoasDadosAdicionaisTipoDto[]) {
    return this.AdicionaisService.create(createAdicionalTipoDto);
  }

  @Get()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Listar todos os tipos de adicionais de pessoas' })
  @ApiQuery({
    name: 'id_pessoa',
    required: true,
    type: Number,
  })
  @ApiResponse({
    status: 200, description: 'Lista de adicionais retornada com sucesso.'
  })
  @ApiResponse({
    status: 400, description: 'Dados inválidos.'
  })
  @ApiResponse({
    status: 404, description: 'Recurso não encontrado.'
  })
  @ApiResponse({ status: 500, description: 'Erro interno de servidor.' })
  async findAll(
    @Query('id_pessoa') id_pessoa?: number,
  ) {
    return this.AdicionaisService.findAll(id_pessoa)
  }

  @Get(":id")
  @LogTablePessoas()
  @ApiOperation({
    summary: 'Listar um tipo de adicional de funcionário pelo ID'
  })
  @ApiResponse({
    status: 200, description: 'Lista de adicionais retornada com sucesso.'
  })
  @ApiResponse({
    status: 400, description: 'Dados inválidos.'
  })
  @ApiResponse({
    status: 404, description: 'Recurso não encontrado.'
  })
  @ApiResponse({ status: 500, description: 'Erro interno de servidor.' })
  async findOne(@Param('id') id: number) {
    return this.AdicionaisService.findOne(id);
  }

  @Patch(':id/:id_pessoa')
  @LogTablePessoas()
  @ApiOperation({
    summary: 'Atualizar um tipo de adicional de funcionário pelo ID'
  })
  @ApiResponse({
    status: 200, description: 'Atualização de adicionais realizada com sucesso.'
  })
  @ApiResponse({
    status: 400, description: 'Dados inválidos.'
  })
  @ApiResponse({
    status: 404, description: 'Recurso não encontrado.'
  })
  @ApiResponse({
     status: 500, description: 'Erro interno de servidor.' 
    })
  update(@Param('id') id: number, @Param('id_pessoa') id_pessoa: number, @Body() UpdatePessoasDadosAdicionaisTipoDto: UpdatePessoasDadosAdicionaisTipoDto) {
    return this.AdicionaisService.update(+id, +id_pessoa, UpdatePessoasDadosAdicionaisTipoDto);
  }

  @Delete()
  @LogTablePessoas()
  @ApiOperation({
    summary: 'Listar um tipo de adicional de funcionário pelo ID'
  })
  @ApiResponse({
    status: 200, description: 'Lista de adicionais retornada com sucesso.'
  })
  @ApiResponse({
    status: 400, description: 'Dados inválidos.'
  })
  @ApiResponse({
    status: 404, description: 'Recurso não encontrado.'
  })
  @ApiResponse({
    status: 500, description: 'Erro interno de servidor.'
  })
  remove(@Query() deleteDto: DeletePessoasDadosAdicionaisTipoDto) {
    return this.AdicionaisService.remove(deleteDto);
  }
}
