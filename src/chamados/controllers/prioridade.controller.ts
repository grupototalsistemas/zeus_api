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
import { CreateChamadoPrioridadeDto } from '../dto/prioridade.dto';
import { ChamadoPrioridadeService } from '../services/prioridade.service';

@ApiTags('Chamado Prioridade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chamado-prioridade')
export class ChamadoPrioridadeController {
  constructor(
    private readonly chamadoPrioridadeService: ChamadoPrioridadeService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo prioridade de chamado' })
  @ApiBody({ type: CreateChamadoPrioridadeDto })
  @ApiResponse({
    status: 201,
    description: 'Prioridade de chamado criado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() dto: CreateChamadoPrioridadeDto) {
    return this.chamadoPrioridadeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os Prioridades de chamado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Prioridades de chamado retornada com sucesso.',
  })
  findAll() {
    return this.chamadoPrioridadeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lista todos os Prioridades de chamado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Prioridades de chamado retornada com sucesso.',
  })
  findUnique(@Param('id') id: string) {
    return this.chamadoPrioridadeService.findOne(BigInt(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma prioridade de chamado' })
  @ApiBody({ type: CreateChamadoPrioridadeDto })
  @ApiResponse({
    status: 201,
    description: 'Prioridade de chamado atualizada com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  update(@Param('id') id: string, @Body() dto: CreateChamadoPrioridadeDto) {
    console.log(dto);
    return this.chamadoPrioridadeService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'remover um prioridade de chamado' })
  @ApiBody({ type: CreateChamadoPrioridadeDto })
  @ApiResponse({
    status: 201,
    description: 'Prioridade de chamado removido com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  remove(@Param('id') id: string) {
    return this.chamadoPrioridadeService.remove(BigInt(id));
  }
}
