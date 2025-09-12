import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePessoaTipoDto } from '../dto/create-pessoa-tipo.dto';
import { PessoaTipoService } from '../services/pessoa-tipo.service';

@ApiTags('Pessoa Tipo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pessoa-tipos')
export class PessoaTipoController {
  constructor(private readonly pessoaTipoService: PessoaTipoService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo tipo de pessoa' })
  @ApiBody({ type: CreatePessoaTipoDto })
  @ApiResponse({
    status: 201,
    description: 'Tipo de pessoa criado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() dto: CreatePessoaTipoDto) {
    return this.pessoaTipoService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lista todos os tipos de pessoa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de pessoa retornada com sucesso.',
  })
  findAll() {
    return this.pessoaTipoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lista todos os tipos de pessoa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de pessoa retornada com sucesso.',
  })
  findUnique(@Param('id') id: string) {
    return this.pessoaTipoService.findOne(BigInt(id));
  }

  @Post(':id')
  @ApiOperation({ summary: 'Cria um novo tipo de pessoa' })
  @ApiBody({ type: CreatePessoaTipoDto })
  @ApiResponse({
    status: 201,
    description: 'Tipo de pessoa criado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  update(@Param('id') id: string, @Body() dto: CreatePessoaTipoDto) {
    return this.pessoaTipoService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'remover um tipo de pessoa' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de pessoa removido com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  remove(@Param('id') id: string) {
    return this.pessoaTipoService.remove(BigInt(id));
  }
}
