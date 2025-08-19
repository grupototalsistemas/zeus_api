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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateChamadoOcorrenciaTipoDto } from '../dto/ocorrencia-tipo.dto';
import { CreateChamadoOcorrenciaDto } from '../dto/ocorrencia.dto';
import { ChamadoOcorrenciaTipoService } from '../services/ocorrencia-tipo.service';

@ApiTags('Tipos de Ocorrencias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chamado-ocorrencia-tipo')
export class ChamadoOcorrenciaTipoController {
  constructor(
    private readonly chamadoOcorrenciaTipoService: ChamadoOcorrenciaTipoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo tipo de ocorrencia de chamado' })
  @ApiBody({ type: CreateChamadoOcorrenciaTipoDto })
  @ApiResponse({
    status: 201,
    description: 'Ocorrencia de chamado criado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() dto: CreateChamadoOcorrenciaTipoDto) {
    return this.chamadoOcorrenciaTipoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os Ocorrencias de chamado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Ocorrencias de chamado retornada com sucesso.',
  })
  findAll() {
    return this.chamadoOcorrenciaTipoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lista todos os Ocorrencias de chamado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Ocorrencias de chamado retornada com sucesso.',
  })
  findUnique(@Param('id') id: string) {
    return this.chamadoOcorrenciaTipoService.findOne(BigInt(id));
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
    return this.chamadoOcorrenciaTipoService.update(BigInt(id), dto);
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
    return this.chamadoOcorrenciaTipoService.remove(BigInt(id));
  }
}
