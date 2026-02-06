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
import { Public } from 'src/common/decorators/public.decorator';
import { DeleteDto } from 'src/common/dto/delete.dto';
import {
  CreateChamadoMovimentoMensagemDto,
  UpdateChamadoMovimentoMensagemDto,
} from '../dto/chamado-movimento-mensagem.dto';
import { ChamadoMovimentoMensagensService } from '../services/chamado-movimento-mensagens.service';

@ApiTags('Chamados - Mensagens')
@Public()
@Controller('chamados-movimentos-mensagens')
export class ChamadoMovimentoMensagensController {
  constructor(private readonly service: ChamadoMovimentoMensagensService) {}

  @Post()
  @ApiBody({
    description: 'Envio de uma nova mensagem no movimento',
    type: CreateChamadoMovimentoMensagemDto,
  })
  create(@Body() createDto: CreateChamadoMovimentoMensagemDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChamadoMovimentoMensagemDto,
  ) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiBody({ type: DeleteDto, description: 'Motivo da exclusão' })
  remove(@Param('id') id: string, @Body() deleteData: DeleteDto) {
    return this.service.remove(+id, deleteData.motivo);
  }
}
