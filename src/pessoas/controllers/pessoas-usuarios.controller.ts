import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { LogTablePessoas } from '../../common/decorators/log-table.decorator';
import {
  CreatePessoaUsuarioDto,
  QueryPessoaUsuarioDto,
  UpdatePessoaUsuariosDto,
} from '../dto/pessoa-usuario.dto';
import { PessoasUsuariosService } from '../services/pessoas-usuarios.service';

@ApiTags('Pessoas Usuarios')
@Controller('pessoas-usuarios')
export class PessoasUsuariosController {
  constructor(
    private readonly pessoasUsuariosService: PessoasUsuariosService,
  ) {}

  @Post()
  @LogTablePessoas()
  create(@Body() createPessoaUsuarioDto: CreatePessoaUsuarioDto) {
    return this.pessoasUsuariosService.create(createPessoaUsuarioDto);
  }

  @Get()
  @LogTablePessoas()
  @ApiProperty({ default: undefined })
  findAll(@Query() query: QueryPessoaUsuarioDto) {
    return this.pessoasUsuariosService.findAll(query);
  }

  @Get(':id')
  @LogTablePessoas()
  findOne(@Param('id') id: string) {
    return this.pessoasUsuariosService.findOne(+id);
  }

  @Patch(':id')
  @LogTablePessoas()
  update(
    @Param('id') id: string,
    @Body() updatePessoaUsuariosDto: UpdatePessoaUsuariosDto,
  ) {
    return this.pessoasUsuariosService.update(+id, updatePessoaUsuariosDto);
  }

  @Delete(':id')
  @LogTablePessoas()
  remove(@Param('id') id: string) {
    return this.pessoasUsuariosService.remove(+id);
  }

  @Get('/empresas/:usuarioId')
  @LogTablePessoas()
  findEmpresasPorPessoa(@Param('usuarioId') usuarioId: number) {
    return this.pessoasUsuariosService.findEmpresasPorPessoa(usuarioId);
  }

  @Get('/por-empresa/:empresaId')
  @LogTablePessoas()
  findUsuariosPorEmpresa(@Param('empresaId') empresaId: number) {
    return this.pessoasUsuariosService.findUsuariosPorEmpresa(+empresaId);
  }
}
