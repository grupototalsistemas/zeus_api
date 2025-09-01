import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

import * as mime from 'mime-types';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUsuario } from '../../common/decorators/get-usuario.decorator';
import { CreateChamadoDto } from '../dto/create-chamado.dto';
import { CreateMovimentoDto } from '../dto/create-movimento.dto';
import { UpdateChamadoDto } from '../dto/update-chamado.dto';
import { ChamadosService } from '../services/chamados.service';

@ApiTags('Chamados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chamados')
export class ChamadosController {
  constructor(private readonly chamadosService: ChamadosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo chamado' })
  @ApiBody({ type: CreateChamadoDto })
  @ApiResponse({ status: 201, description: 'Chamado criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  create(@Body() dto: CreateChamadoDto) {
    return this.chamadosService.create({
      ...dto,
    });
  }

  @Post(':id/movimentos')
  @ApiOperation({ summary: 'Adiciona um novo movimento ao chamado' })
  @ApiParam({ name: 'id', type: String, description: 'ID do chamado' })
  @ApiBody({ type: CreateMovimentoDto })
  @ApiResponse({ status: 201, description: 'Movimento criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  createMovimento(
    @Param('id') id: string,
    @Body() dto: CreateMovimentoDto,
    @GetUsuario() usuarioId: number,
  ) {
    return this.chamadosService.criarMovimento({
      ...dto,
      usuarioId,
    });
  }

  @Post('upload-anexos')
  @ApiOperation({ summary: 'Faz upload de anexos para chamados' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivos para upload',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        movimentoId: {
          type: 'number',
        },
        descricao: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/chamados/anexos',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const extension = extname(file.originalname);
          callback(null, `${uniqueName}${extension}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'application/pdf',
          'video/mp4',
          'video/avi',
          'video/quicktime',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new Error(`Tipo de arquivo não permitido: ${file.mimetype}`),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadAnexos(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
        fileIsRequired: true,
      }),
    )
    files: Express.Multer.File[],
    @Body()
    dados: {
      movimentoId: string;
      descricao: string;
    },
    @GetUsuario() usuarioId,
  ) {
    const anexos = files.map((file) => ({
      usuarioId: usuarioId.userId,
      descricao: dados.descricao || file.originalname,
      caminho: file.path,
    }));

    return await this.chamadosService.criarAnexos({
      movimentoId: parseInt(dados.movimentoId),
      anexos: anexos,
    });
  }

  @Get('anexo/:id')
  @ApiOperation({ summary: 'Download de anexo' })
  @ApiParam({ name: 'id', type: String, description: 'ID do anexo' })
  async downloadAnexo(@Param('id') id: string, @Res() res: Response) {
    try {
      const anexo = await this.chamadosService.obterAnexo(BigInt(id));

      if (!anexo) {
        return res.status(404).json({ message: 'Anexo não encontrado' });
      }

      const uploadDir = join(process.cwd(), 'uploads', 'chamados', 'anexos');
      const caminho = anexo.caminho.split('\\').pop();
      const filePath = join(uploadDir, caminho || '');

      if (!existsSync(filePath)) {
        return res
          .status(404)
          .json({ message: 'Arquivo não encontrado no servidor' });
      }

      // Detectar MIME type automaticamente
      const mimeType = mime.lookup(caminho || '') || 'application/octet-stream';

      res.setHeader('Content-Type', mimeType);

      // Para imagens e PDFs, exibir inline
      if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
        res.setHeader(
          'Content-Disposition',
          `inline; filename*=UTF-8''${encodeURIComponent(anexo.descricao)}`,
        );
      } else {
        res.setHeader(
          'Content-Disposition',
          `attachment; filename*=UTF-8''${encodeURIComponent(anexo.descricao)}`,
        );
      }

      const file = createReadStream(filePath);
      file.pipe(res);
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Erro ao baixar arquivo', error: error.message });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os chamados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de chamados retornada com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll() {
    return this.chamadosService.findAll({});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um chamado pelo ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID do chamado' })
  @ApiResponse({ status: 200, description: 'Chamado encontrado.' })
  @ApiResponse({ status: 404, description: 'Chamado não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findOne(@Param('id') id: string) {
    return this.chamadosService.findOne(BigInt(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um chamado' })
  @ApiParam({ name: 'id', type: String, description: 'ID do chamado' })
  @ApiBody({ type: UpdateChamadoDto })
  @ApiResponse({ status: 200, description: 'Chamado atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Chamado não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChamadoDto,
    @GetUsuario() usuarioId: { userId: number },
  ) {
    return this.chamadosService.update(BigInt(id), {
      ...dto,
      usuarioId: usuarioId.userId,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um chamado' })
  @ApiParam({ name: 'id', type: String, description: 'ID do chamado' })
  @ApiResponse({ status: 200, description: 'Chamado removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Chamado não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  remove(@Param('id') id: string) {
    return this.chamadosService.remove(BigInt(id));
  }
}
