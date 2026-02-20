import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateOcorrenciaDto,
  UpdateOcorrenciaDto,
} from '../dto/ocorrencia.dto';

@Injectable()
export class OcorrenciaService {
  constructor(private prisma: PrismaService) {}

  async create(createOcorrenciaDto: CreateOcorrenciaDto) {
    return this.prisma.ocorrencia.create({
      data: {
        id_ocorrencia_tipo: BigInt(createOcorrenciaDto.id_ocorrencia_tipo),
        id_pessoa_juridica: BigInt(createOcorrenciaDto.id_pessoa_juridica),
        descricao: createOcorrenciaDto.descricao,
        situacao: createOcorrenciaDto.situacao ?? 1,
        motivo: createOcorrenciaDto.motivo,
      },
      include: {
        tipo: true,
        empresa: true,
      },
    });
  }

  async findAll() {
    const ocorrencias = await this.prisma.ocorrencia.findMany({
      where: { situacao: 1 },
    });
    return ocorrencias;
  }

  async findOne(id: number) {
    const ocorrencia = await this.prisma.ocorrencia.findUnique({
      where: { id: BigInt(id) },
      include: {
        tipo: true,
        empresa: true,
        chamados: true,
      },
    });

    if (!ocorrencia) {
      throw new NotFoundException(`Ocorrência com ID ${id} não encontrada`);
    }

    return ocorrencia;
  }

  async update(id: number, updateOcorrenciaDto: UpdateOcorrenciaDto) {
    await this.findOne(id);

    return this.prisma.ocorrencia.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateOcorrenciaDto.id_ocorrencia_tipo && {
          id_ocorrencia_tipo: BigInt(updateOcorrenciaDto.id_ocorrencia_tipo),
        }),
        ...(updateOcorrenciaDto.id_pessoa_juridica && {
          id_pessoa_juridica: BigInt(updateOcorrenciaDto.id_pessoa_juridica),
        }),
        ...(updateOcorrenciaDto.descricao && {
          descricao: updateOcorrenciaDto.descricao,
        }),
        ...(updateOcorrenciaDto.situacao !== undefined && {
          situacao: updateOcorrenciaDto.situacao,
        }),
        ...(updateOcorrenciaDto.motivo && {
          motivo: updateOcorrenciaDto.motivo,
        }),
        updatedAt: new Date(),
      },
      include: {
        tipo: true,
        empresa: true,
      },
    });
  }

  async remove(id: number, motivo: string) {
    await this.findOne(id);

    return this.prisma.ocorrencia.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo,
        updatedAt: new Date(),
      },
    });
  }
}
