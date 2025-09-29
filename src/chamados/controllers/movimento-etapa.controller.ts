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
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateMovimentoEtapaDto } from '../dto/movimento-etapa.dto';
import { UpdateMovimentoEtapaDto } from '../dto/update-movimento-etapa.dto';
import { ChamadoMovimentoEtapaService } from '../services/movimento-etapa.service';

@ApiTags('Chamados - Movimento Etapas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chamados-movimento-etapas')
export class ChamadoMovimentoEtapaController {
  constructor(private readonly service: ChamadoMovimentoEtapaService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova etapa de movimento' })
  @ApiResponse({
    status: 201,
    description: 'Etapa de movimento criada com sucesso.',
  })
  create(@Body() createEtapaDto: CreateMovimentoEtapaDto) {
    return this.service.create(createEtapaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as etapas de movimento' })
  @ApiResponse({
    status: 200,
    description: 'Lista de etapas retornada com sucesso.',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma etapa de movimento pelo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Etapa encontrada.' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(BigInt(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma etapa de movimento' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Etapa de movimento atualizada com sucesso.',
  })
  update(
    @Param('id') id: string,
    @Body() updateEtapaDto: UpdateMovimentoEtapaDto,
  ) {
    return this.service.update(BigInt(id), updateEtapaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma etapa de movimento' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Etapa de movimento removida com sucesso.',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(BigInt(id));
  }

  @Get('empresa/:empresaId')
  @ApiOperation({ summary: 'Lista todas as etapas de uma empresa' })
  @ApiParam({ name: 'empresaId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de etapas da empresa retornada com sucesso.',
  })
  findByEmpresa(@Param('empresaId') empresaId: string) {
    return this.service.findByEmpresa(Number(empresaId));
  }
}
