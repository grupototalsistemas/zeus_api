// pessoas/pessoas.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreatePessoaDto } from '../dto/create-pessoa.dto';
import { UpdatePessoaDto } from '../dto/update-pessoa.dto';
import { PessoasService } from '../services/pessoas.service';

@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Post()
  create(@Body() dto: CreatePessoaDto) {
    return this.pessoasService.create(dto);
  }

  @Public()
  @Get()
  findAll() {
    return this.pessoasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pessoasService.findOne(BigInt(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePessoaDto) {
    return this.pessoasService.update(BigInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pessoasService.remove(BigInt(id));
  }
}
