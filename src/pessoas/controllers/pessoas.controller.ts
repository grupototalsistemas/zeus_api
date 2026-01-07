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
import { DeleteDto } from 'src/common/dto/delete.dto';
import { LogTablePessoas } from '../../common/decorators/log-table.decorator';
import { pessoaExample } from '../docs/pessoas.example';
import { CreatePessoaDto, UpdatePessoaDto } from '../dto/pessoa.dto';
import { PessoasService } from '../services/pessoas.service';

@ApiTags('Pessoas')
@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Post()
  @LogTablePessoas()
  @ApiBody({
    description: 'Criação de uma ou mais pessoas (físicas ou jurídicas)',
    type: CreatePessoaDto,
    examples: pessoaExample,
  })
  create(@Body() createPessoaDto: CreatePessoaDto) {
    return this.pessoasService.create(createPessoaDto);
  }

  @Get()
  @LogTablePessoas()
  findAll() {
    return this.pessoasService.findAll();
  }

  @Get(':id')
  @LogTablePessoas()
  findOne(@Param('id') id: string) {
    return this.pessoasService.findOne(+id);
  }

  @Patch(':id')
  @LogTablePessoas()
  update(@Param('id') id: string, @Body() updatePessoaDto: UpdatePessoaDto) {
    return this.pessoasService.update(+id, updatePessoaDto);
  }

  @Delete(':id')
  @LogTablePessoas()
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.pessoasService.remove(+id, deleteData.motivo);
  }
}
