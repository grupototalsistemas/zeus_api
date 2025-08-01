import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }
  async findMe(userId: string) {
    return this.findById(userId);
  }
  async listAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
    });
  }
}
