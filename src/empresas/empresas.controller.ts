// empresas/empresas.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { EmpresasService } from './empresas.service';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  create(@Body() dto: CreateEmpresaDto) {
    return this.empresasService.create(dto);
  }

  @Get()
  findAll() {
    return this.empresasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empresasService.findOne(BigInt(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmpresaDto) {
    return this.empresasService.update(BigInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empresasService.remove(BigInt(id));
  }
}
