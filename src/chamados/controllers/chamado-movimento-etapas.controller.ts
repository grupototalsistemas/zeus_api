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
import {
  CreateChamadoMovimentoEtapaDto,
  UpdateChamadoMovimentoEtapaDto,
} from '../dto/chamado-movimento-etapa.dto';
import { ChamadoMovimentoEtapasService } from '../services/chamado-movimento-etapas.service';

@ApiTags('Chamados - Etapas')
@Public()
@Controller('chamados-movimentos-etapas')
export class ChamadoMovimentoEtapasController {
  constructor(private readonly service: ChamadoMovimentoEtapasService) {}

  @Post()
  @ApiBody({
    description: 'Criação de uma nova etapa de movimento',
    type: CreateChamadoMovimentoEtapaDto,
  })
  create(@Body() createDto: CreateChamadoMovimentoEtapaDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChamadoMovimentoEtapaDto,
  ) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.service.remove(+id, deleteData.motivo);
  }
}
