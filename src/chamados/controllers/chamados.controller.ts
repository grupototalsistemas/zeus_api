import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { DeleteDto } from 'src/common/dto/delete.dto';
import {
  CreateChamadoComAnexoDto,
  CreateChamadoDto,
  UpdateChamadoDto,
} from '../dto/chamado.dto';
import { FindChamadosQueryDto } from '../dto/find-chamados-query.dto';
import {
  ChamadosService,
  ResultadoCriacaoChamados,
} from '../services/chamados.service';

type MulterFile = Express.Multer.File;

@ApiTags('Chamados')
@Public()
@Controller('chamados')
export class ChamadosController {
  constructor(private readonly chamadosService: ChamadosService) {}

  @Post()
  @ApiBody({
    description: 'Criação de um novo chamado',
    type: CreateChamadoDto,
  })
  create(
    @Body() createChamadoDto: CreateChamadoDto[],
  ): Promise<ResultadoCriacaoChamados> {
    return this.chamadosService.create(createChamadoDto);
  }

  @Post('with-attachment')
  @UseInterceptors(FileInterceptor('arquivo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Criação de um novo chamado com anexo opcional',
    type: CreateChamadoComAnexoDto,
  })
  async createWithAttachment(
    @Body() createChamadoComAnexoDto: CreateChamadoComAnexoDto,
    @UploadedFile() file?: MulterFile,
  ) {
    return this.chamadosService.createWithAttachment(
      createChamadoComAnexoDto,
      file,
    );
  }

  @Get()
  findAll(@Query() query: FindChamadosQueryDto) {
    return this.chamadosService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chamadosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChamadoDto: UpdateChamadoDto) {
    return this.chamadosService.update(+id, updateChamadoDto);
  }

  @Delete(':id')
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.chamadosService.remove(+id, deleteData.motivo);
  }

  @Get('metricas-empresa/:id_pessoa_juridica')
  getME(
    @Param('id_pessoa_juridica') id_pessoa_juridica: string,
    @Query('data_inicio') data_inicio?: string,
    @Query('data_fim') data_fim?: string,
  ) {
    return this.chamadosService.getMetricasEmpresa(
      +id_pessoa_juridica,
      data_inicio,
      data_fim,
    );
  }

  @Get('metricas-usuario/:id_usuario')
  getMU(@Param('id_usuario') id_usuario: string) {
    return this.chamadosService.getMetricasUsuario(+id_usuario);
  }
}
