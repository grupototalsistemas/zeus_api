import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetUsuario } from 'src/common/decorators/get-usuario.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateChamadoDto } from '../dto/create-chamado.dto';
import { CreateMovimentoDto } from '../dto/create-movimento.dto';
import { UpdateChamadoDto } from '../dto/update-chamado.dto';
import { ChamadosService } from '../services/chamados.service';

@ApiTags('Chamados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chamados')
export class ChamadosController {
  constructor(private readonly chamadosService: ChamadosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo chamado' })
  @ApiBody({ type: CreateChamadoDto })
  @ApiResponse({ status: 201, description: 'Chamado criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@Body() dto: CreateChamadoDto, @GetUsuario() usuarioId: number) {
    return this.chamadosService.create({
      ...dto,
      usuarioId,
    });
  }

  @Post(':id/movimentos')
  @ApiOperation({ summary: 'Adiciona um novo movimento ao chamado' })
  @ApiParam({ name: 'id', type: String, description: 'ID do chamado' })
  @ApiBody({ type: CreateMovimentoDto })
  @ApiResponse({ status: 201, description: 'Movimento criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  createMovimento(
    @Param('id') id: string,
    @Body() dto: CreateMovimentoDto,
    @GetUsuario() usuarioId: number,
  ) {
    return this.chamadosService.criarMovimento({
      ...dto,
      usuarioId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os chamados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de chamados retornada com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll() {
    return this.chamadosService.findAll({});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um chamado pelo ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID do chamado' })
  @ApiResponse({ status: 200, description: 'Chamado encontrado.' })
  @ApiResponse({ status: 404, description: 'Chamado não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findOne(@Param('id') id: string) {
    return this.chamadosService.findOne(BigInt(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um chamado' })
  @ApiParam({ name: 'id', type: String, description: 'ID do chamado' })
  @ApiBody({ type: UpdateChamadoDto })
  @ApiResponse({ status: 200, description: 'Chamado atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Chamado não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChamadoDto,
    @GetUsuario() usuarioId: number,
  ) {
    return this.chamadosService.update(BigInt(id), {
      ...dto,
      usuarioId,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um chamado' })
  @ApiParam({ name: 'id', type: String, description: 'ID do chamado' })
  @ApiResponse({ status: 200, description: 'Chamado removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Chamado não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  remove(@Param('id') id: string) {
    return this.chamadosService.remove(BigInt(id));
  }
}
