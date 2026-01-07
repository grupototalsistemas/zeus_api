import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LogTablePessoas } from '../../common/decorators/log-table.decorator';
import { DeleteDto } from '../../common/dto/delete.dto';
import {
  CreatePessoasFisicaDto,
  UpdatePessoasFisicaDto,
} from '../dto/pessoa-fisica.dto';
import { PessoasFisicasService } from '../services/pessoas-fisicas.service';

@ApiTags('Pessoas Físicas')
@Controller('pessoas-fisicas')
export class PessoasFisicasController {
  constructor(private readonly pessoasFisicasService: PessoasFisicasService) {}

  @Post()
  @LogTablePessoas()
  create(@Body() createPessoaFisicaDto: CreatePessoasFisicaDto) {
    return this.pessoasFisicasService.create(createPessoaFisicaDto);
  }

  @Get()
  @LogTablePessoas()
  findAll(@Query() query?: any) {
    return this.pessoasFisicasService.findAll(query);
  }

  @Get(':id')
  @LogTablePessoas()
  findOne(@Param('id') id: string) {
    return this.pessoasFisicasService.findOne(+id);
  }

  @Patch(':id')
  @LogTablePessoas()
  update(
    @Param('id') id: string,
    @Body() updatePessoaFisicaDto: UpdatePessoasFisicaDto,
  ) {
    return this.pessoasFisicasService.update(+id, updatePessoaFisicaDto);
  }

  @Delete(':id')
  @LogTablePessoas()
  @ApiOperation({ summary: 'Remove uma pessoa física' })
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  @ApiResponse({
    status: 200,
    description: 'Pessoa física removida com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Motivo não informado ou registro global',
  })
  @ApiResponse({ status: 404, description: 'Pessoa física não encontrada' })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.pessoasFisicasService.remove(+id, deleteData.motivo);
  }
}
