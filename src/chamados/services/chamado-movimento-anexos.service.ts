import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateChamadoMovimentoAnexoDto,
  UpdateChamadoMovimentoAnexoDto,
} from '../dto/chamado-movimento-anexo.dto';

@Injectable()
export class ChamadoMovimentoAnexosService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateChamadoMovimentoAnexoDto) {
    return this.prisma.chamadoMovimentoAnexo.create({
      data: {
        id_chamado_movimento: BigInt(createDto.id_chamado_movimento),
        id_pessoa_usuario: BigInt(createDto.id_pessoa_usuario),
        ordem: createDto.ordem,
        descricao: createDto.descricao,
        dataHora: createDto.dataHora ? new Date(createDto.dataHora) : undefined,
        caminho: createDto.caminho,
        situacao: createDto.situacao ?? 1,
        motivo: createDto.motivo,
      },
      include: {
        movimento: true,
        usuario: true,
      },
    });
  }

  async findAll() {
    return this.prisma.chamadoMovimentoAnexo.findMany({
      where: { situacao: 1 },
      include: {
        movimento: true,
        usuario: true,
      },
    });
  }

  async findOne(id: number) {
    const anexo = await this.prisma.chamadoMovimentoAnexo.findUnique({
      where: { id: BigInt(id) },
      include: {
        movimento: true,
        usuario: true,
      },
    });

    if (!anexo) {
      throw new NotFoundException(`Anexo com ID ${id} não encontrado`);
    }

    return anexo;
  }

  async update(id: number, updateDto: UpdateChamadoMovimentoAnexoDto) {
    await this.findOne(id);

    return this.prisma.chamadoMovimentoAnexo.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateDto.id_chamado_movimento && {
          id_chamado_movimento: BigInt(updateDto.id_chamado_movimento),
        }),
        ...(updateDto.id_pessoa_usuario && {
          id_pessoa_usuario: BigInt(updateDto.id_pessoa_usuario),
        }),
        ...(updateDto.ordem !== undefined && { ordem: updateDto.ordem }),
        ...(updateDto.descricao && { descricao: updateDto.descricao }),
        ...(updateDto.dataHora && { dataHora: new Date(updateDto.dataHora) }),
        ...(updateDto.caminho && { caminho: updateDto.caminho }),
        ...(updateDto.situacao !== undefined && {
          situacao: updateDto.situacao,
        }),
        ...(updateDto.motivo && { motivo: updateDto.motivo }),
        updatedAt: new Date(),
      },
      include: {
        movimento: true,
        usuario: true,
      },
    });
  }

  async remove(id: number, motivo: string) {
    await this.findOne(id);

    return this.prisma.chamadoMovimentoAnexo.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo,
        updatedAt: new Date(),
      },
    });
  }
}
