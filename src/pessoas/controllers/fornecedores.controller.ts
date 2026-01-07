import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ApiCreateResponses } from 'src/common/decorators/responseCreate.decorator';
import { ApiDeleteResponses } from 'src/common/decorators/responseDelete.decorator';
import { ApiUpdateResponses } from 'src/common/decorators/responseUpdate.decorator';
import { DeleteDto } from 'src/common/dto/delete.dto';
import { LogTablePessoas } from '../../common/decorators/log-table.decorator';
import { FornecedorExamples } from '../docs/fornecedor.example';
import {
  CreateFornecedorDto,
  QueryFornecedorDto,
  ResponseFornecedorDto,
  UpdateFornecedorDto,
} from '../dto/fornecedor.dto';
import { FornecedoresService } from '../services/fornecedores.service';

@ApiTags('Fornecedores')
@Controller('pessoa-juridica/fornecedores')
export class FornecedoresController {
  constructor(private readonly fornecedorService: FornecedoresService) {}

  @Post()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Criar um ou mais novos fornecedores' })
  @ApiBody({
    type: [CreateFornecedorDto],
    isArray: true,
    description: 'Adicionar uma ou mais fornecedores',
    examples: FornecedorExamples,
  })
  @ApiCreateResponses('Empresa', ResponseFornecedorDto)
  async create(@Body() dto: CreateFornecedorDto[], @Res() res: Response) {
    try {
      const result = await this.fornecedorService.create(dto);

      // Se não há erros → HTTP 201 (Created)
      if (result.erros.length === 0) {
        return res.status(HttpStatus.CREATED).json(result);
      }

      // Se há sucessos e erros → HTTP 207 (Multi-Status - criação parcial)
      if (result.sucessos.length > 0 && result.erros.length > 0) {
        return res.status(207).json({
          ...result,
          message: 'Criação parcial realizada com sucesso',
        });
      }

      // Se só há erros → HTTP 400 (Bad Request)
      if (result.erros.length > 0 && result.sucessos.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          ...result,
          message:
            'Falha ao criar fornecedores - todos os registros contém erros',
        });
      }

      // Fallback para caso inesperado
      return res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      throw new BadRequestException({
        message: 'Falha ao criar fornecedores',
        erro: error.message,
      });
    }
  }

  @Get()
  @LogTablePessoas()
  @ApiOperation({ summary: 'Listar todas os fornecedores' })
  findAll(@Query() query: QueryFornecedorDto) {
    return this.fornecedorService.findAll(query);
  }

  @Get('cartorio')
  @LogTablePessoas()
  @ApiOperation({ summary: 'Listar todas os fornecedores e o cartório' })
  findAllWhithCartorio(@Query() query: QueryFornecedorDto) {
    return this.fornecedorService.findAllwhithCartorio(query);
  }

  @Get(':id')
  @LogTablePessoas()
  @ApiOperation({ summary: 'Buscar fornecedor por ID' })
  findOne(@Param('id') id: string) {
    return this.fornecedorService.findOne(Number(id));
  }

  @Patch(':id')
  @LogTablePessoas()
  @ApiOperation({ summary: 'Atualizar dados de um fornecedor' })
  @ApiUpdateResponses('Empresa')
  update(@Param('id') id: string, @Body() dto: UpdateFornecedorDto) {
    return this.fornecedorService.update(Number(id), dto);
  }

  @Delete(':id')
  @LogTablePessoas()
  @ApiDeleteResponses('Empresa')
  @ApiOperation({ summary: 'Inativar fornecedor (soft delete)' })
  @ApiBody({
    type: DeleteDto,
    description: 'Motivo para a inativação do fornecedor',
  })
  remove(@Param('id') id: string, @Body() deleteDto: DeleteDto) {
    return this.fornecedorService.remove(Number(id), deleteDto.motivo);
  }
}
