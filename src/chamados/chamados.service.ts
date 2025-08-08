// chamados/chamados.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChamadoDto } from './dto/create-chamado.dto';
import { UpdateChamadoDto } from './dto/update-chamado.dto';

@Injectable()
export class ChamadosService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateChamadoDto) {
    return this.prisma.chamado.create({
      data,
      include: {
        empresa: true,
        sistema: true,
        ocorrencia: true,
        prioridade: true,
        movimentos: true,
      },
    });
  }

  findAll() {
    return this.prisma.chamado.findMany({
      include: {
        empresa: true,
        sistema: true,
        ocorrencia: true,
        prioridade: true,
        movimentos: true,
      },
    });
  }

  findOne(id: bigint) {
    return this.prisma.chamado.findUnique({
      where: { id },
      include: {
        empresa: true,
        sistema: true,
        ocorrencia: true,
        prioridade: true,
        movimentos: true,
      },
    });
  }

  update(id: bigint, data: UpdateChamadoDto) {
    return this.prisma.chamado.update({
      where: { id },
      data,
      include: {
        empresa: true,
        sistema: true,
        ocorrencia: true,
        prioridade: true,
        movimentos: true,
      },
    });
  }

  remove(id: bigint) {
    return this.prisma.chamado.delete({ where: { id } });
  }
}
