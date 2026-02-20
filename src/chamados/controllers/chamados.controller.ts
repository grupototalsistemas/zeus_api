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
import { CreateChamadoDto, UpdateChamadoDto } from '../dto/chamado.dto';
import { ChamadosService } from '../services/chamados.service';

@ApiTags('Chamados')
@Public()
@Controller('chamados')
export class ChamadosController {
  constructor(private readonly chamadosService: ChamadosService) {}

  @Post()
  @ApiBody({
    description: 'Criação de um novo chamado',
    type: CreateChamadoDto,
  })
  create(@Body() createChamadoDto: CreateChamadoDto[]) {
    return this.chamadosService.create(createChamadoDto);
  }

  @Get()
  findAll() {
    return this.chamadosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chamadosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChamadoDto: UpdateChamadoDto) {
    return this.chamadosService.update(+id, updateChamadoDto);
  }

  @Delete(':id')
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.chamadosService.remove(+id, deleteData.motivo);
  }
}
