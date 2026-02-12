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
import {
  CreateOcorrenciaDto,
  UpdateOcorrenciaDto,
} from '../dto/ocorrencia.dto';
import { OcorrenciaService } from '../services/ocorrencia.service';

@ApiTags('Ocorrencias')
@Controller('ocorrencias')
export class OcorrenciaController {
  constructor(private readonly ocorrenciaService: OcorrenciaService) {}

  @Post()
  @ApiBody({
    description: 'Criação de uma nova ocorrência',
    type: CreateOcorrenciaDto,
  })
  create(@Body() createOcorrenciaDto: CreateOcorrenciaDto) {
    return this.ocorrenciaService.create(createOcorrenciaDto);
  }

  @Get()
  findAll() {
    return this.ocorrenciaService.findAll() || [];
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ocorrenciaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOcorrenciaDto: UpdateOcorrenciaDto,
  ) {
    return this.ocorrenciaService.update(+id, updateOcorrenciaDto);
  }

  @Delete(':id')
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.ocorrenciaService.remove(+id, deleteData.motivo);
  }
}
