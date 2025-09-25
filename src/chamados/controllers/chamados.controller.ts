import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Redirect,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { StatusRegistro } from '@prisma/client';
import { GetUsuario } from '../../common/decorators/get-usuario.decorator';
import { BlobStorageService } from '../../common/services/blob-storage.service';
import { CreateChamadoDto } from '../dto/create-chamado.dto';
import { CreateMovimentoDto } from '../dto/create-movimento.dto';
import { UpdateChamadoDto } from '../dto/update-chamado.dto';
import { ChamadosService } from '../services/chamados.service';

@ApiTags('Chamados')
@ApiBearerAuth()
@Controller('chamados')
export class ChamadosController {
  constructor(
    private readonly chamadosService: ChamadosService,
    private readonly blobStorageService: BlobStorageService,
  ) {}

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
    try {
      // Upload dos arquivos para o Blob Storage
      const uploadPromises = files.map(async (file) => {
        const uploadResult = await this.blobStorageService.uploadFile(
          file,
          'chamados/anexos',
        );

        return {
          usuarioId: usuarioId.userId,
          descricao: dados.descricao || file.originalname,
          url: uploadResult.url,
          pathname: uploadResult.pathname,
          nomeOriginal: file.originalname,
          mimeType: file.mimetype,
          tamanho: file.size,
        };
      });

      const anexos = await Promise.all(uploadPromises);

      return await this.chamadosService.criarAnexos({
        movimentoId: parseInt(dados.movimentoId),
        anexos: anexos,
      });
    } catch (error) {
      throw new Error(`Erro ao fazer upload dos anexos: ${error.message}`);
    }
  }

  @Get('anexo/:id')
  @ApiOperation({ summary: 'Acesso a anexo - redireciona para URL do blob' })
  @ApiParam({ name: 'id', type: String, description: 'ID do anexo' })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para URL do arquivo no blob storage',
  })
  @ApiResponse({ status: 404, description: 'Anexo não encontrado' })
  @Redirect()
  async accessAnexo(@Param('id') id: string) {
    try {
      const anexo = await this.chamadosService.obterAnexo(BigInt(id));

      if (!anexo) {
        throw new Error('Anexo não encontrado');
      }

      // Verifica se o arquivo ainda existe no blob storage
      const fileExists = await this.blobStorageService.fileExists(
        anexo.pathname,
      );

      if (!fileExists) {
        throw new Error('Arquivo não encontrado no storage');
      }

      // Retorna o objeto de redirecionamento
      return {
        url: anexo.url,
        statusCode: 302,
      };
    } catch (error) {
      throw new Error(`Erro ao acessar anexo: ${error.message}`);
    }
  }

  @Delete('anexo/:id')
  @ApiOperation({ summary: 'Remove um anexo' })
  @ApiParam({ name: 'id', type: String, description: 'ID do anexo' })
  @ApiResponse({ status: 200, description: 'Anexo removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Anexo não encontrado.' })
  async deleteAnexo(@Param('id') id: string) {
    try {
      const anexo = await this.chamadosService.obterAnexo(BigInt(id));

      if (!anexo) {
        throw new Error('Anexo não encontrado');
      }

      // Remove do blob storage
      await this.blobStorageService.deleteFile(anexo.pathname);

      // Remove do banco de dados
      return await this.chamadosService.excluirAnexo(BigInt(id));
    } catch (error) {
      throw new Error(`Erro ao remover anexo: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os chamados' })
  @ApiQuery({
    name: 'usuarioId',
    type: Number,
    description: 'ID do usuário que criou o chamado',
    required: false,
  })
  @ApiQuery({
    name: 'empresaId',
    type: Number,
    description: 'ID da empresa',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de chamados retornada com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  findAll(
    @Query('empresaId', new ParseIntPipe({ optional: true }))
    empresaId?: number,
    @Query('usuarioId', new ParseIntPipe({ optional: true }))
    usuarioId?: number,
  ) {
    return this.chamadosService.findAll({
      empresaId,
      usuarioId,
    });
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
    // @GetUsuario() usuarioId: { userId: number },
  ) {
    return this.chamadosService.update(BigInt(id), {
      ...dto,
    });
  }

  @Patch(':id/conclude')
  @ApiOperation({ summary: 'Finaliza um chamado' })
  @ApiParam({ name: 'id', type: String, description: 'ID do chamado' })
  @ApiBody({ type: UpdateChamadoDto })
  @ApiResponse({ status: 200, description: 'Chamado concluido com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Chamado não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  conclude(
    @Param('id') id: string,
    @Body() dto: UpdateChamadoDto,
    @GetUsuario() usuarioId: { userId: number },
  ) {
    return this.chamadosService.update(BigInt(id), {
      ...dto,
      ativo: StatusRegistro.INATIVO,

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
