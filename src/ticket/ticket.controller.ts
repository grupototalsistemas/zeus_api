import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from './entities/ticket-status.enum';
import { TicketsService } from './ticket.service';
@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}
  @Post()
  @ApiOperation({ summary: 'Criar novo chamado' })
  async create(@GetUser() user: any, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(user, dto);
  }
  @Get()
  @ApiOperation({ summary: 'Listar chamados' })
  @ApiQuery({ name: 'status', enum: TicketStatus, required: false })
  @ApiQuery({ name: 'authorId', required: false })
  @ApiQuery({ name: 'assignedToId', required: false })
  async findAll(
    @GetUser() user: any,
    @Query() pagination: PaginationQueryDto,
    @Query('status') status?: TicketStatus,
    @Query('authorId') authorId?: string,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.ticketsService.findAll(user, pagination, {
      status,
      authorId,
      assignedToId,
    });
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obter chamado por ID' })
  async findOne(@GetUser() user: any, @Param('id') id: string) {
    return this.ticketsService.findOne(user, id);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar título/descrição do chamado' })
  async update(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(user, id, dto);
  }
  @Patch(':id/assign')
  @ApiOperation({ summary: 'Transferir responsável pelo chamado' })
  async assign(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
  ) {
    return this.ticketsService.assign(user, id, dto);
  }
  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar status do chamado' })
  async status(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateStatus(user, id, dto);
  }
  @Get(':id/history')
  @ApiOperation({ summary: 'Histórico de atualizações do chamado' })
  async history(@GetUser() user: any, @Param('id') id: string) {
    return this.ticketsService.history(user, id);
  }
}
