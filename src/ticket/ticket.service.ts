import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from './entities/ticket-status.enum';
interface RequestUser {
  userId: string;
  role: Role;
}
@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}
  private async ensureTicket(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { author: true, assignedTo: true },
    });
    if (!ticket) throw new NotFoundException('Chamado não encontrado');
    return ticket;
  }
  private canModifyTicket(user: RequestUser, ticket: any): boolean {
    if (user.role === Role.ADMIN) return true;
    if (ticket.authorId === user.userId) return true;
    if (ticket.assignedToId && ticket.assignedToId === user.userId) return true;
    return false;
  }
  private canAssign(user: RequestUser, ticket: any): boolean {
    if (user.role === Role.ADMIN) return true;
    if (ticket.assignedToId === user.userId) return true; // responsável pode transferir
    return false;
  }
  private async logUpdate(
    ticketId: string,
    userId: string,
    message: string,
    previousStatus?: TicketStatus,
    newStatus?: TicketStatus,
  ) {
    await this.prisma.ticketUpdate.create({
      data: { ticketId, userId, message, previousStatus, newStatus },
    });
  }
  async create(user: RequestUser, dto: CreateTicketDto) {
    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        authorId: user.userId,
      },
    });
    await this.logUpdate(
      ticket.id,
      user.userId,
      'Chamado criado',
      undefined,
      TicketStatus.OPEN,
    );
    return ticket;
  }
  async findAll(
    user: RequestUser,
    pagination: PaginationQueryDto,
    filters?: {
      status?: TicketStatus;
      authorId?: string;
      assignedToId?: string;
    },
  ) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.authorId) where.authorId = filters.authorId;
    if (filters?.assignedToId) where.assignedToId = filters.assignedToId;
    // Usuário comum vê somente os próprios ou atribuídos
    if (user.role !== Role.ADMIN && user.role !== Role.SUPPORT) {
      where.OR = [{ authorId: user.userId }, { assignedToId: user.userId }];
    }
    return this.prisma.ticket.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: { author: true, assignedTo: true },
    });
  }
  async findOne(user: RequestUser, id: string) {
    const ticket = await this.ensureTicket(id);
    if (!this.canModifyTicket(user, ticket))
      throw new ForbiddenException('Sem permissão');
    return ticket;
  }
  async update(user: RequestUser, id: string, dto: UpdateTicketDto) {
    const ticket = await this.ensureTicket(id);
    if (!this.canModifyTicket(user, ticket))
      throw new ForbiddenException('Sem permissão');
    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        title: dto.title ?? ticket.title,
        description: dto.description ?? ticket.description,
      },
    });
    await this.logUpdate(id, user.userId, 'Chamado atualizado');
    return updated;
  }
  async assign(user: RequestUser, id: string, dto: AssignTicketDto) {
    const ticket = await this.ensureTicket(id);
    if (!this.canAssign(user, ticket))
      throw new ForbiddenException('Sempermissão para transferir');
    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        assignedToId: dto.userId,
        status: TicketStatus.IN_PROGRESS,
      },
    });
    await this.logUpdate(
      id,
      user.userId,
      `Responsável transferido para ${dto.userId}`,
      ticket.status as TicketStatus,
      TicketStatus.IN_PROGRESS,
    );
    return updated;
  }
  async updateStatus(
    user: RequestUser,
    id: string,
    dto: UpdateTicketStatusDto,
  ) {
    const ticket = await this.ensureTicket(id);
    const next = dto.status;
    // Regras simplificadas; customize conforme seção Regras de Negócio
    switch (next) {
      case TicketStatus.IN_PROGRESS:
        if (!this.canAssign(user, ticket))
          throw new ForbiddenException('Sempermissão');
        break;
      case TicketStatus.RESOLVED:
        if (!(user.role === Role.ADMIN || ticket.assignedToId === user.userId))
          throw new ForbiddenException('Somente responsável ou admin');
        break;
      case TicketStatus.CLOSED:
        if (!(user.role === Role.ADMIN || ticket.authorId === user.userId))
          throw new ForbiddenException('Somente autor ou admin');
        break;
      case TicketStatus.CANCELLED:
        if (user.role !== Role.ADMIN)
          throw new ForbiddenException('Somenteadmin pode cancelar');
        break;
      case TicketStatus.OPEN:
        // reabrir: autor ou admin
        if (!(user.role === Role.ADMIN || ticket.authorId === user.userId))
          throw new ForbiddenException('Somente autor ou admin');
        break;
    }
    const updated = await this.prisma.ticket.update({
      where: { id },
      data: { status: next },
    });
    await this.logUpdate(
      id,
      user.userId,
      `Status alterado para ${next}`,
      ticket.status as TicketStatus,
      next,
    );
    return updated;
  }
  async history(user: RequestUser, id: string) {
    const ticket = await this.ensureTicket(id);
    if (!this.canModifyTicket(user, ticket))
      throw new ForbiddenException('Sem permissão');
    return this.prisma.ticketUpdate.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });
  }
}
