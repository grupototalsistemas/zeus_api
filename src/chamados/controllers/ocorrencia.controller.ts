import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateChamadoOcorrenciaDto } from '../dto/ocorrencia.dto';
import { ChamadoOcorrenciaService } from '../services/ocorrencia.service';

@ApiTags('Ocorrencias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chamado-ocorrencia')
export class ChamadoOcorrenciaController {
  constructor(
    private readonly chamadoOcorrenciaService: ChamadoOcorrenciaService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova ocorrencia de chamado' })
  @ApiBody({ type: CreateChamadoOcorrenciaDto })
  @ApiResponse({
    status: 201,
    description: 'Ocorrencia de chamado criado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() dto: CreateChamadoOcorrenciaDto) {
    return this.chamadoOcorrenciaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os Ocorrencias de chamado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Ocorrencias de chamado retornada com sucesso.',
  })
  findAll() {
    return this.chamadoOcorrenciaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lista todos os Ocorrencias de chamado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Ocorrencias de chamado retornada com sucesso.',
  })
  findUnique(@Param('id') id: string) {
    return this.chamadoOcorrenciaService.findOne(BigInt(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cria um novo ocorrencia de chamado' })
  @ApiBody({ type: CreateChamadoOcorrenciaDto })
  @ApiResponse({
    status: 201,
    description: 'Ocorrencia de chamado criado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  update(@Param('id') id: string, @Body() dto: CreateChamadoOcorrenciaDto) {
    return this.chamadoOcorrenciaService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'remover um ocorrencia de chamado' })
  @ApiBody({ type: CreateChamadoOcorrenciaDto })
  @ApiResponse({
    status: 201,
    description: 'Ocorrencia de chamado removido com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  remove(@Param('id') id: string) {
    return this.chamadoOcorrenciaService.remove(BigInt(id));
  }
}
