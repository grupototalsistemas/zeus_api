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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePessoaPerfilDto } from '../dto/create-pessoa-perfil.dto';
import { PessoaPerfilService } from '../services/pessoa-perfil.service';

@ApiTags('Pessoa Perfil')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pessoa-perfil')
export class PessoaPerfilController {
  constructor(private readonly pessoaPerfilService: PessoaPerfilService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo perfil de pessoa' })
  @ApiBody({ type: CreatePessoaPerfilDto })
  @ApiResponse({
    status: 201,
    description: 'Perfil de pessoa criado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() dto: CreatePessoaPerfilDto) {
    return this.pessoaPerfilService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os Perfils de pessoa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Perfils de pessoa retornada com sucesso.',
  })
  findAll() {
    return this.pessoaPerfilService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lista todos os Perfils de pessoa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Perfils de pessoa retornada com sucesso.',
  })
  findUnique(@Param('id') id: string) {
    return this.pessoaPerfilService.findOne(BigInt(id));
  }

  @Post(':id')
  @ApiOperation({ summary: 'Cria um novo perfil de pessoa' })
  @ApiBody({ type: CreatePessoaPerfilDto })
  @ApiResponse({
    status: 201,
    description: 'Perfil de pessoa criado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  update(@Param('id') id: string, @Body() dto: CreatePessoaPerfilDto) {
    return this.pessoaPerfilService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'remover um perfil de pessoa' })
  @ApiBody({ type: CreatePessoaPerfilDto })
  @ApiResponse({
    status: 201,
    description: 'Perfil de pessoa removido com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  remove(@Param('id') id: string) {
    return this.pessoaPerfilService.remove(BigInt(id));
  }
}
