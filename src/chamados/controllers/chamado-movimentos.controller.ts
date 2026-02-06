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
  CreateChamadoMovimentoDto,
  UpdateChamadoMovimentoDto,
} from '../dto/chamado-movimento.dto';
import { ChamadoMovimentosService } from '../services/chamado-movimentos.service';

@ApiTags('Chamados - Movimentos')
@Public()
@Controller('chamados-movimentos')
export class ChamadoMovimentosController {
  constructor(private readonly service: ChamadoMovimentosService) {}

  @Post()
  @ApiBody({
    description: 'Criação de um novo movimento de chamado',
    type: CreateChamadoMovimentoDto,
  })
  create(@Body() createDto: CreateChamadoMovimentoDto) {
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
    @Body() updateDto: UpdateChamadoMovimentoDto,
  ) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.service.remove(+id, deleteData.motivo);
  }
}
