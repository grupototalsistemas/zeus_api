import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { DeleteDto } from 'src/common/dto/delete.dto';
import {
  CreateChamadoMovimentoAnexoDto,
  UpdateChamadoMovimentoAnexoDto,
} from '../dto/chamado-movimento-anexo.dto';
import { ChamadoMovimentoAnexosService } from '../services/chamado-movimento-anexos.service';

type MulterFile = Express.Multer.File;

@ApiTags('Chamados - Anexos')
@Public()
@Controller('chamados-movimentos-anexos')
export class ChamadoMovimentoAnexosController {
  constructor(private readonly service: ChamadoMovimentoAnexosService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('arquivo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload de um novo anexo no movimento',
    description:
      'Faz upload de um arquivo e cria o registro de anexo associado ao movimento do chamado',
  })
  @ApiBody({
    description: 'Dados do anexo e arquivo',
    type: CreateChamadoMovimentoAnexoDto,
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Anexo criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo não fornecido ou dados inválidos',
  })
  async create(
    @Body() createDto: CreateChamadoMovimentoAnexoDto,
    @UploadedFile() file: MulterFile,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    return this.service.create(createDto, file);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista todos os anexos ativos',
    description: 'Retorna todos os anexos que não foram excluídos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de anexos retornada com sucesso',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get('movimento/:id')
  @ApiOperation({
    summary: 'Lista anexos de um movimento específico',
    description: 'Retorna todos os anexos de um movimento de chamado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de anexos do movimento retornada com sucesso',
  })
  findByMovimento(@Param('id') id: string) {
    return this.service.findByMovimento(+id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca um anexo específico',
    description: 'Retorna os dados de um anexo (sem o arquivo)',
  })
  @ApiResponse({
    status: 200,
    description: 'Anexo encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Anexo não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Download do arquivo de um anexo',
    description: 'Faz download do arquivo associado ao anexo',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo retornado com sucesso',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Anexo ou arquivo não encontrado',
  })
  async download(@Param('id') id: string, @Res() res: Response) {
    const { buffer, mimeType, filename } = await this.service.downloadFile(+id);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('arquivo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Atualiza um anexo',
    description:
      'Atualiza descrição, ordem ou substitui o arquivo de um anexo',
  })
  @ApiBody({
    description: 'Dados a atualizar (arquivo é opcional)',
    type: UpdateChamadoMovimentoAnexoDto,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Anexo atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Anexo não encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChamadoMovimentoAnexoDto,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.service.update(+id, updateDto, file);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove um anexo',
    description: 'Remove o anexo e deleta o arquivo do sistema',
  })
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  @ApiResponse({
    status: 200,
    description: 'Anexo removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Anexo não encontrado',
  })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.service.remove(+id, deleteData.motivo);
  }
}
