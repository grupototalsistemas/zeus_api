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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiCreateResponses } from 'src/common/decorators/responseCreate.decorator';
import { LogTableCartorios } from '../../common/decorators/log-table.decorator';
import { cartorioExamples } from '../docs/cartorio.example';
import {
  CreateCartorioDto,
  DeleteCartorioDto,
  QueryCartorioDto,
  ResponseCartorioDto,
  UpdateCartorioDto,
} from '../dto/cartorio.dto';
import { CartorioService } from '../services/cartorio.service';

@ApiTags('Cartório')
// @ApiExcludeController()
@Controller('cartorio')
export class CartorioController {
  constructor(private readonly cartorioService: CartorioService) {}

  @Post()
  @LogTableCartorios()
  @ApiOperation({
    summary: 'Cadastrar um novo cartório com todas as validações necessárias',
    description:
      'Cadastra um cartório completo incluindo: pessoa jurídica, endereços, contatos, responsável (pessoa física), usuário do sistema e vínculos. Realiza validações de CNPJ e CPF únicos, cria automaticamente vínculo com empresa matriz e sistema Gerencial.',
  })
  @ApiCreateResponses('Cartório', ResponseCartorioDto)
  @ApiBody({
    type: CreateCartorioDto,
    description: 'Dados completos do cartório a ser cadastrado',
    examples: cartorioExamples,
  })
  create(@Body() createCartorioDto: CreateCartorioDto) {
    return this.cartorioService.create(createCartorioDto);
  }

  @Get()
  @LogTableCartorios()
  @ApiOperation({
    summary: 'Listar todos os cartórios',
    description:
      'Lista todos os cartórios cadastrados com possibilidade de filtros por CNPJ, razão social, código e situação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cartórios listados com sucesso',
    type: [ResponseCartorioDto],
  })
  @ApiResponse({ status: 404, description: 'Nenhum cartório encontrado' })
  findAll(@Query() query: QueryCartorioDto) {
    return this.cartorioService.findAll(query);
  }

  @Get(':id')
  @LogTableCartorios()
  @ApiOperation({
    summary: 'Buscar um cartório específico',
    description:
      'Retorna todos os dados de um cartório incluindo endereços, contatos e informações do responsável.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cartório encontrado',
    type: ResponseCartorioDto,
  })
  @ApiResponse({ status: 404, description: 'Cartório não encontrado' })
  findOne(@Param('id') id: string) {
    return this.cartorioService.findOne(+id);
  }

  @Patch(':id')
  @LogTableCartorios()
  @ApiOperation({
    summary: 'Atualizar dados de um cartório',
    description:
      'Atualiza os dados do cartório e/ou do responsável. Realiza validações de CNPJ e CPF únicos.',
  })
  @ApiResponse({ status: 200, description: 'Cartório atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cartório não encontrado' })
  @ApiBody({
    type: UpdateCartorioDto,
    description: 'Dados a serem atualizados (parciais)',
  })
  update(
    @Param('id') id: string,
    @Body() updateCartorioDto: UpdateCartorioDto,
  ) {
    return this.cartorioService.update(+id, updateCartorioDto);
  }

  @Delete(':id')
  @LogTableCartorios()
  @ApiOperation({
    summary: 'Desativar um cartório',
    description:
      'Realiza exclusão lógica do cartório, desativando a pessoa jurídica, pessoa física e vínculos relacionados.',
  })
  @ApiBody({
    type: DeleteCartorioDto,
    description: 'Motivo da exclusão do cartório',
  })
  @ApiResponse({ status: 200, description: 'Cartório desativado com sucesso' })
  @ApiResponse({ status: 400, description: 'Motivo não informado' })
  @ApiResponse({
    status: 404,
    description: 'Cartório não encontrado ou já desativado',
  })
  remove(@Param('id') id: string, @Body() deleteData: DeleteCartorioDto) {
    return this.cartorioService.remove(+id, deleteData);
  }
}
