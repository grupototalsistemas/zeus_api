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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePessoaUsuarioDto } from '../dto/create-pessoa-usuario.dto';
import { PessoaUsuarioService } from '../services/pessoa-usuario.service';

@ApiTags('Pessoa Usuario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pessoa-usuario')
export class PessoaUsuarioController {
  constructor(private readonly pessoaUsuarioService: PessoaUsuarioService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuario de pessoa' })
  @ApiBody({ type: CreatePessoaUsuarioDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario de pessoa criado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() dto: CreatePessoaUsuarioDto) {
    return this.pessoaUsuarioService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os Usuarios de pessoa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Usuarios de pessoa retornada com sucesso.',
  })
  findAll() {
    return this.pessoaUsuarioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lista todos os Usuarios de pessoa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de Usuarios de pessoa retornada com sucesso.',
  })
  findUnique(@Param('id') id: string) {
    return this.pessoaUsuarioService.findOne(BigInt(id));
  }

  @Post(':id')
  @ApiOperation({ summary: 'Cria um novo usuario de pessoa' })
  @ApiBody({ type: CreatePessoaUsuarioDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario de pessoa criado com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  update(@Param('id') id: string, @Body() dto: CreatePessoaUsuarioDto) {
    return this.pessoaUsuarioService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'remover um usuario' })
  @ApiBody({ type: CreatePessoaUsuarioDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario removido com sucesso.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  remove(@Param('id') id: string) {
    return this.pessoaUsuarioService.remove(BigInt(id));
  }
}
