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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteDto } from 'src/common/dto/delete.dto';
import { pessoasJuridicasPerfisExamples } from '../docs/pessoas-juridicas-perfis.example';
import {
  CreateManyPessoasJuridicasPerfisDto,
  CreateManyPessoasJuridicasPerfisResponseDto,
  CreatePessoaJuridicaPerfilDto,
  PerfilModulosPermissoesResponseDto,
  PessoaJuridicaPerfilResponseDto,
  QueryPessoaJuridicaPerfilDto,
  UpdatePessoaJuridicaPerfilDto,
} from '../dto/pessoas-juridicas-perfis.dto';
import { PessoasJuridicasPerfisService } from '../services/pessoas-juridicas-perfis.service';

@ApiTags('Pessoas Jurídicas - Perfis')
@Controller('pessoas-juridicas-perfis')
export class PessoasJuridicasPerfisController {
  constructor(
    private readonly pessoasJuridicasPerfisService: PessoasJuridicasPerfisService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar um novo perfil',
    description:
      'Cria um novo perfil de pessoa jurídica com validações de duplicidade de descrição.',
  })
  @ApiResponse({
    status: 201,
    description: 'Perfil criado com sucesso',
    type: PessoaJuridicaPerfilResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou perfil duplicado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pessoa jurídica não encontrada',
  })
  @ApiBody({
    type: CreatePessoaJuridicaPerfilDto,
    description: 'Dados do perfil a ser criado',
    examples: {
      'Criação de Perfil Único':
        pessoasJuridicasPerfisExamples['Criação de Perfil Único'],
      'Criação de Perfil Mínimo':
        pessoasJuridicasPerfisExamples['Criação de Perfil Mínimo'],
    },
  })
  create(@Body() createDto: CreatePessoaJuridicaPerfilDto) {
    return this.pessoasJuridicasPerfisService.create(createDto);
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Criar múltiplos perfis em lote',
    description:
      'Cria vários perfis de uma vez. Retorna detalhes de sucessos e erros para cada perfil individualmente.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Perfis processados (pode conter sucessos e erros individuais)',
    type: CreateManyPessoasJuridicasPerfisResponseDto,
  })
  @ApiBody({
    type: CreateManyPessoasJuridicasPerfisDto,
    description: 'Array de perfis a serem criados',
    examples: {
      'Criação de Múltiplos Perfis':
        pessoasJuridicasPerfisExamples['Criação de Múltiplos Perfis'],
      'Resposta com Sucessos e Erros':
        pessoasJuridicasPerfisExamples[
          'Resposta de Criação Múltipla com Sucesso e Erros'
        ],
    },
  })
  createMany(@Body() createManyDto: CreateManyPessoasJuridicasPerfisDto) {
    return this.pessoasJuridicasPerfisService.createMany(createManyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os perfis',
    description:
      'Lista todos os perfis com possibilidade de filtros por pessoa jurídica, descrição, status e situação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de perfis retornada com sucesso',
    type: [PessoaJuridicaPerfilResponseDto],
  })
  findAll(@Query() queryDto?: QueryPessoaJuridicaPerfilDto) {
    return this.pessoasJuridicasPerfisService.findAll(queryDto);
  }
  
  @Get('pessoa-juridica/:idPessoaJuridica')
  @ApiOperation({
    summary: 'Listar perfis de uma pessoa jurídica',
    description:
      'Lista todos os perfis ativos de uma pessoa jurídica específica.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de perfis da pessoa jurídica',
    type: [PessoaJuridicaPerfilResponseDto],
  })
  findByPessoaJuridica(@Param('idPessoaJuridica') idPessoaJuridica: string) {
    return this.pessoasJuridicasPerfisService.findByPessoaJuridica(
      +idPessoaJuridica,
    );
  }

  @Get(':id/modulos-permissoes')
  @ApiOperation({
    summary: 'Buscar módulos e permissões de um perfil',
    description:
      'Retorna todos os módulos e permissões de um perfil específico filtrados por sistema e empresa.',
  })
  @ApiResponse({
    status: 200,
    description: 'Módulos e permissões do perfil',
    type: PerfilModulosPermissoesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Empresa sem acesso ao sistema',
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil não encontrado',
  })
  getModulosPermissoes(
    @Param('id') id: string,
    @Query('id_sistema') idSistema: string,
    @Query('id_pessoa_juridica') idPessoaJuridica: string,
  ) {
    return this.pessoasJuridicasPerfisService.getModulosPermissoesBySistemaEmpresa(
      +id,
      +idSistema,
      +idPessoaJuridica,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar um perfil específico',
    description: 'Retorna os dados de um perfil pelo seu ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil encontrado',
    type: PessoaJuridicaPerfilResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.pessoasJuridicasPerfisService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar um perfil',
    description:
      'Atualiza os dados de um perfil. Valida duplicidade de descrição.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso',
    type: PessoaJuridicaPerfilResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou perfil duplicado',
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil não encontrado',
  })
  @ApiBody({
    type: UpdatePessoaJuridicaPerfilDto,
    description: 'Dados a serem atualizados (parciais)',
    examples: {
      'Atualização de Perfil':
        pessoasJuridicasPerfisExamples['Atualização de Perfil'],
      'Desativação de Perfil':
        pessoasJuridicasPerfisExamples['Desativação de Perfil'],
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePessoaJuridicaPerfilDto,
  ) {
    return this.pessoasJuridicasPerfisService.update(+id, updateDto);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Ativar um perfil desativado',
    description: 'Reativa um perfil que foi previamente desativado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil ativado com sucesso',
    type: PessoaJuridicaPerfilResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Perfil já está ativo',
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil não encontrado',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        motivo: {
          type: 'string',
          description: 'Motivo da ativação',
          example: 'Perfil reativado após revisão',
        },
      },
      required: ['motivo'],
    },
  })
  activate(@Param('id') id: string, @Body('motivo') motivo: string) {
    return this.pessoasJuridicasPerfisService.activate(+id, motivo);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover (desativar) um perfil',
    description:
      'Realiza exclusão lógica do perfil. Verifica se o perfil não está em uso antes de remover.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil desativado com sucesso',
    type: PessoaJuridicaPerfilResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Perfil em uso ou com permissões vinculadas não pode ser removido',
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil não encontrado',
  })
  @ApiBody({
    type: DeleteDto,
    description: 'Motivo da exclusão do perfil',
    examples: {
      'Exclusão de Perfil':
        pessoasJuridicasPerfisExamples['Exclusão de Perfil'],
    },
  })
  remove(@Param('id') id: string, @Body() deleteDto: DeleteDto) {
    return this.pessoasJuridicasPerfisService.remove(+id, deleteDto);
  }
}
