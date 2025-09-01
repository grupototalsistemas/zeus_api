import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  ChamadoMovimentoMensagemQueryDto,
  ChamadoMovimentoMensagemResponseDto,
  CreateChamadoMovimentoMensagemDto,
  UpdateChamadoMovimentoMensagemDto,
} from '../dto/chamado-movimento-mensagem.dto';
import { ChamadoMovimentoMensagemService } from '../services/chamado-movimento-mensagem.service';

@ApiTags('Mensagens de Movimento de Chamados')
@Controller('chamados-movimentos-mensagens')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ChamadoMovimentoMensagemController {
  constructor(
    private readonly mensagemService: ChamadoMovimentoMensagemService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nova mensagem de movimento',
    description: 'Cria uma nova mensagem associada a um movimento de chamado',
  })
  @ApiBody({
    type: CreateChamadoMovimentoMensagemDto,
    description: 'Dados para criação da mensagem',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Mensagem criada com sucesso',
    type: ChamadoMovimentoMensagemResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos ou movimento não está ativo',
  })
  @ApiNotFoundResponse({
    description: 'Movimento do chamado não encontrado',
  })
  async create(@Body() createDto: CreateChamadoMovimentoMensagemDto) {
    return await this.mensagemService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar mensagens',
    description: 'Lista todas as mensagens com filtros e paginação',
  })
  @ApiQuery({
    name: 'movimentoId',
    required: false,
    description: 'Filtrar por ID do movimento',
    example: 1,
  })
  @ApiQuery({
    name: 'usuarioEnvioId',
    required: false,
    description: 'Filtrar por ID do usuário de envio',
    example: 1,
  })
  @ApiQuery({
    name: 'usuarioLeituraId',
    required: false,
    description: 'Filtrar por ID do usuário de leitura',
    example: 2,
  })
  @ApiQuery({
    name: 'ativo',
    required: false,
    description: 'Filtrar por status do registro',
    enum: ['ATIVO', 'INATIVO', 'EXCLUIDO'],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Itens por página',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de mensagens retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/ChamadoMovimentoMensagemResponseDto',
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  async findAll(@Query() query: ChamadoMovimentoMensagemQueryDto) {
    return await this.mensagemService.findAll(query);
  }

  @Get('movimento/:movimentoId')
  @ApiOperation({
    summary: 'Listar mensagens por movimento',
    description: 'Lista todas as mensagens de um movimento específico',
  })
  @ApiParam({
    name: 'movimentoId',
    description: 'ID do movimento do chamado',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de mensagens do movimento retornada com sucesso',
    type: [ChamadoMovimentoMensagemResponseDto],
  })
  @ApiNotFoundResponse({
    description: 'Movimento do chamado não encontrado',
  })
  async findByMovimento(
    @Param(
      'movimentoId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    movimentoId: number,
  ) {
    return await this.mensagemService.findByMovimento(BigInt(movimentoId));
  }

  @Get('usuario/:usuarioId/nao-lidas')
  @ApiOperation({
    summary: 'Listar mensagens não lidas',
    description: 'Lista todas as mensagens não lidas de um usuário específico',
  })
  @ApiParam({
    name: 'usuarioId',
    description: 'ID do usuário',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de mensagens não lidas retornada com sucesso',
    type: [ChamadoMovimentoMensagemResponseDto],
  })
  async getUnreadMessages(
    @Param(
      'usuarioId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    usuarioId: number,
  ) {
    return await this.mensagemService.getUnreadMessages(BigInt(usuarioId));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar mensagem por ID',
    description: 'Retorna uma mensagem específica pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da mensagem',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mensagem encontrada com sucesso',
    type: ChamadoMovimentoMensagemResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Mensagem não encontrada',
  })
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: number,
  ) {
    return await this.mensagemService.findOne(BigInt(id));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar mensagem',
    description: 'Atualiza os dados de uma mensagem existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da mensagem',
    example: 1,
  })
  @ApiBody({
    type: UpdateChamadoMovimentoMensagemDto,
    description: 'Dados para atualização da mensagem',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mensagem atualizada com sucesso',
    type: ChamadoMovimentoMensagemResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos ou movimento não está ativo',
  })
  @ApiNotFoundResponse({
    description: 'Mensagem ou movimento do chamado não encontrado',
  })
  async update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: number,
    @Body() updateDto: UpdateChamadoMovimentoMensagemDto,
  ) {
    return await this.mensagemService.update(BigInt(id), updateDto);
  }

  @Patch(':id/marcar-como-lida')
  @ApiOperation({
    summary: 'Marcar mensagem como lida',
    description: 'Marca uma mensagem como lida por um usuário específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da mensagem',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        usuarioLeituraId: {
          type: 'number',
          description: 'ID do usuário que está marcando como lida',
          example: 1,
        },
      },
      required: ['usuarioLeituraId'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mensagem marcada como lida com sucesso',
    type: ChamadoMovimentoMensagemResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Mensagem não está ativa',
  })
  @ApiNotFoundResponse({
    description: 'Mensagem não encontrada',
  })
  @ApiConflictResponse({
    description: 'Mensagem já foi marcada como lida',
  })
  async markAsRead(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: number,
    @Body() body: { usuarioLeituraId: number },
  ) {
    return await this.mensagemService.markAsRead(
      BigInt(id),
      BigInt(body.usuarioLeituraId),
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir mensagem',
    description:
      'Exclui uma mensagem (soft delete - altera status para EXCLUIDO)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da mensagem',
    example: 1,
  })
  @ApiQuery({
    name: 'motivo',
    required: false,
    description: 'Motivo da exclusão',
    example: 'Mensagem removida por solicitação do usuário',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mensagem excluída com sucesso',
    type: ChamadoMovimentoMensagemResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Mensagem não encontrada',
  })
  @ApiConflictResponse({
    description: 'Mensagem já foi excluída',
  })
  async remove(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: number,
    @Query('motivo') motivo?: string,
  ) {
    return await this.mensagemService.remove(BigInt(id), motivo);
  }
}
