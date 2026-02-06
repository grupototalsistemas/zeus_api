import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePrioridadeDto,
  UpdatePrioridadeDto,
} from '../dto/prioridade.dto';

@Injectable()
export class PrioridadeService {
  constructor(private prisma: PrismaService) {}

  async create(createPrioridadeDto: CreatePrioridadeDto) {
    return this.prisma.prioridade.create({
      data: {
        id_empresa: BigInt(createPrioridadeDto.id_empresa),
        descricao: createPrioridadeDto.descricao,
        cor: createPrioridadeDto.cor,
        tempoResolucao: new Date(createPrioridadeDto.tempoResolucao),
        situacao: createPrioridadeDto.situacao ?? 1,
        motivo: createPrioridadeDto.motivo,
      },
      include: {
        empresa: true,
      },
    });
  }

  async findAll() {
    return this.prisma.prioridade.findMany({
      where: { situacao: 1 },
      include: {
        empresa: true,
      },
    });
  }

  async findOne(id: number) {
    const prioridade = await this.prisma.prioridade.findUnique({
      where: { id: BigInt(id) },
      include: {
        empresa: true,
        chamados: true,
      },
    });

    if (!prioridade) {
      throw new NotFoundException(`Prioridade com ID ${id} não encontrada`);
    }

    return prioridade;
  }

  async update(id: number, updatePrioridadeDto: UpdatePrioridadeDto) {
    await this.findOne(id);

    return this.prisma.prioridade.update({
      where: { id: BigInt(id) },
      data: {
        ...(updatePrioridadeDto.id_empresa && {
          id_empresa: BigInt(updatePrioridadeDto.id_empresa),
        }),
        ...(updatePrioridadeDto.descricao && {
          descricao: updatePrioridadeDto.descricao,
        }),
        ...(updatePrioridadeDto.cor && {
          cor: updatePrioridadeDto.cor,
        }),
        ...(updatePrioridadeDto.tempoResolucao && {
          tempoResolucao: new Date(updatePrioridadeDto.tempoResolucao),
        }),
        ...(updatePrioridadeDto.situacao !== undefined && {
          situacao: updatePrioridadeDto.situacao,
        }),
        ...(updatePrioridadeDto.motivo && {
          motivo: updatePrioridadeDto.motivo,
        }),
        updatedAt: new Date(),
      },
      include: {
        empresa: true,
      },
    });
  }

  async remove(id: number, motivo: string) {
    await this.findOne(id);

    return this.prisma.prioridade.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo,
        updatedAt: new Date(),
      },
    });
  }
}
