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
  Request,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LogTablePessoas } from '../../common/decorators/log-table.decorator';
import {
  funcionarioExample,
  removeFuncionarioExample,
} from '../docs/funcionario.example';
import {
  CreateFuncionariosDto,
  UpdateFuncionarioDto,
} from '../dto/funcionario.dto';
import {
  DeleteFuncionarioDto,
  FuncionariosService,
} from '../services/funcionarios.service';

@ApiTags('Funcionarios')
@Controller('pessoas-fisicas/funcionarios')
export class FuncionariosController {
  constructor(private readonly funcionariosService: FuncionariosService) {}

  @Post()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Criar novo funcionário' })
  @ApiBody({ type: CreateFuncionariosDto })
  @ApiResponse({ status: 201, description: 'Funcionário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() dto: CreateFuncionariosDto) {
    return this.funcionariosService.create(dto);
  }

  @Get('pessoa-juridica/:id_pessoa_juridica')
  @LogTablePessoas()
  @ApiOperation({
    summary: 'Buscar funcionários por pessoa jurídica',
    description:
      'Retorna apenas pessoas do tipo 6 (Funcionários). Filtro opcional por id_pessoa_fisica.',
  })
  @ApiParam({
    name: 'id_pessoa_juridica',
    type: Number,
    description: 'ID da pessoa jurídica',
  })
  @ApiQuery({
    name: 'id_pessoa_fisica',
    type: Number,
    required: false,
    description:
      'ID da pessoa física (opcional) - Filtra por uma pessoa específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Funcionários (tipo 6) encontrados',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum funcionário (tipo 6) encontrado',
  })
  async findByPessoaJuridica(
    @Param('id_pessoa_juridica', ParseIntPipe) id_pessoa_juridica: number,
    @Query('id_pessoa_fisica', new ParseIntPipe({ optional: true }))
    id_pessoa_fisica?: number,
  ) {
    return this.funcionariosService.findByPessoaJuridica(
      id_pessoa_juridica,
      id_pessoa_fisica,
    );
  }

  @Patch(':id')
  @LogTablePessoas()
  @ApiOperation({ summary: 'Atualizar parcialmente um funcionário' })
  @ApiParam({ name: 'id', type: Number, description: 'ID pessoa' })
  @ApiBody({
    description: 'Dados parciais para atualização',
    type: UpdateFuncionarioDto,
    examples: funcionarioExample,
  })
  @ApiResponse({
    status: 200,
    description: 'Funcionário atualizado com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateFuncionarioDto,
  ) {
    return this.funcionariosService.update(id, updateData);
  }

  @Delete(':id')
  @LogTablePessoas()
  @ApiOperation({ summary: 'Remover funcionário (soft delete)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID pessoa fisica' })
  @ApiBody({
    description: 'Motivo da exclusão',
    examples: removeFuncionarioExample,
  })
  @ApiResponse({ status: 200, description: 'Funcionário removido com sucesso' })
  @ApiResponse({ status: 400, description: 'Motivo não informado' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() deleteData: DeleteFuncionarioDto,
    @Request() req: any,
  ) {
    return this.funcionariosService.remove(id, deleteData, req.user);
  }
}
