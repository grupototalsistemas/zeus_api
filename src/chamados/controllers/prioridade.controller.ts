import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { DeleteDto } from 'src/common/dto/delete.dto';
import { CreateOcorrenciaDto } from '../dto/ocorrencia.dto';
import {
  CreatePrioridadeDto,
  UpdatePrioridadeDto,
} from '../dto/prioridade.dto';
import { PrioridadeService } from '../services/prioridade.service';

@ApiTags('Prioridades')
@Public()
@Controller('prioridades')
export class PrioridadeController {
  constructor(private readonly prioridadeService: PrioridadeService) {}

  @Post()
  @ApiBody({
    description: 'Criação de uma nova prioridade',
    type: CreateOcorrenciaDto,
  })
  create(@Body() createPrioridadeDto: CreatePrioridadeDto) {
    return this.prioridadeService.create(createPrioridadeDto);
  }

  @Get()
  findAll() {
    return this.prioridadeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prioridadeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePrioridadeDto: UpdatePrioridadeDto,
  ) {
    return this.prioridadeService.update(+id, updatePrioridadeDto);
  }

  @Delete(':id')
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.prioridadeService.remove(+id, deleteData.motivo);
  }
}
