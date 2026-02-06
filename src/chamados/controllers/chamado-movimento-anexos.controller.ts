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
  CreateChamadoMovimentoAnexoDto,
  UpdateChamadoMovimentoAnexoDto,
} from '../dto/chamado-movimento-anexo.dto';
import { ChamadoMovimentoAnexosService } from '../services/chamado-movimento-anexos.service';

@ApiTags('Chamados - Anexos')
@Public()
@Controller('chamados-movimentos-anexos')
export class ChamadoMovimentoAnexosController {
  constructor(private readonly service: ChamadoMovimentoAnexosService) {}

  @Post()
  @ApiBody({
    description: 'Upload de um novo anexo no movimento',
    type: CreateChamadoMovimentoAnexoDto,
  })
  create(@Body() createDto: CreateChamadoMovimentoAnexoDto) {
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
    @Body() updateDto: UpdateChamadoMovimentoAnexoDto,
  ) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.service.remove(+id, deleteData.motivo);
  }
}
