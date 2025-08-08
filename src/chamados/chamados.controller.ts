// chamados/chamados.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ChamadosService } from './chamados.service';
import { CreateChamadoDto } from './dto/create-chamado.dto';
import { UpdateChamadoDto } from './dto/update-chamado.dto';

@Controller('chamados')
export class ChamadosController {
  constructor(private readonly chamadosService: ChamadosService) {}

  @Post()
  create(@Body() dto: CreateChamadoDto) {
    return this.chamadosService.create(dto);
  }

  @Get()
  findAll() {
    return this.chamadosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chamadosService.findOne(BigInt(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChamadoDto) {
    return this.chamadosService.update(BigInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chamadosService.remove(BigInt(id));
  }
}
