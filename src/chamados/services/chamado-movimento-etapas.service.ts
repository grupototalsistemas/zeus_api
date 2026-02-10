import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateChamadoMovimentoEtapaDto,
  UpdateChamadoMovimentoEtapaDto,
} from '../dto/chamado-movimento-etapa.dto';

@Injectable()
export class ChamadoMovimentoEtapasService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateChamadoMovimentoEtapaDto) {
    return this.prisma.chamadoMovimentoEtapa.create({
      data: {
        id_pessoa_juridica: BigInt(createDto.id_pessoa_juridica),
        descricao: createDto.descricao,
        situacao: createDto.situacao ?? 1,
        motivo: createDto.motivo,
      },
      include: {
        empresa: true,
      },
    });
  }

  async findAll() {
    return this.prisma.chamadoMovimentoEtapa.findMany({
      where: { situacao: 1 },
      include: {
        empresa: true,
      },
    });
  }

  async findOne(id: number) {
    const etapa = await this.prisma.chamadoMovimentoEtapa.findUnique({
      where: { id: BigInt(id) },
      include: {
        empresa: true,
        movimentos: true,
      },
    });

    if (!etapa) {
      throw new NotFoundException(`Etapa com ID ${id} não encontrada`);
    }

    return etapa;
  }

  async update(id: number, updateDto: UpdateChamadoMovimentoEtapaDto) {
    await this.findOne(id);

    return this.prisma.chamadoMovimentoEtapa.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateDto.id_pessoa_juridica && {
          id_pessoa_juridica: BigInt(updateDto.id_pessoa_juridica),
        }),
        ...(updateDto.descricao && { descricao: updateDto.descricao }),
        ...(updateDto.situacao !== undefined && {
          situacao: updateDto.situacao,
        }),
        ...(updateDto.motivo && { motivo: updateDto.motivo }),
        updatedAt: new Date(),
      },
      include: {
        empresa: true,
      },
    });
  }

  async remove(id: number, motivo: string) {
    await this.findOne(id);

    return this.prisma.chamadoMovimentoEtapa.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo,
        updatedAt: new Date(),
      },
    });
  }
}
