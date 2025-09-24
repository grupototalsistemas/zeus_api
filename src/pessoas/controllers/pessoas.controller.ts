// pessoas/pessoas.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CreatePessoaDto } from '../dto/create-pessoa.dto';
import { UpdatePessoaDto } from '../dto/update-pessoa.dto';
import { PessoasService } from '../services/pessoas.service';

@ApiTags('Pessoas')
@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pessoa' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pessoa criada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Erro de validação nos dados enviados',
  })
  @ApiBody({ type: CreatePessoaDto })
  create(@Body() dto: CreatePessoaDto) {
    return this.pessoasService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar todas as pessoas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de pessoas retornada com sucesso',
  })
  findAll() {
    return this.pessoasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pessoa por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da pessoa',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pessoa encontrada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pessoa não encontrada',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pessoasService.findOne(BigInt(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pessoa por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da pessoa',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pessoa atualizada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Erro de validação nos dados enviados',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pessoa não encontrada',
  })
  @ApiBody({ type: UpdatePessoaDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePessoaDto) {
    return this.pessoasService.update(BigInt(id), dto);
  }

  @Get('empresa/:id')
  @ApiOperation({ summary: 'Buscar pessoas da mesma empresa' })
  @ApiParam({
    name: 'id',
    description: 'ID da empresa',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pessoas encontradas com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pessoas não encontradas',
  })
  findByEmpresa(@Param('id', ParseIntPipe) id: number) {
    return this.pessoasService.findByEmpresa(BigInt(id));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir pessoa por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID da pessoa',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pessoa excluída com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pessoa não encontrada',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pessoasService.remove(BigInt(id));
  }
}
