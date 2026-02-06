import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateChamadoMovimentoDto,
  UpdateChamadoMovimentoDto,
} from '../dto/chamado-movimento.dto';

@Injectable()
export class ChamadoMovimentosService {
  constructor(private prisma: PrismaService) {}

  async create(createChamadoMovimentoDto: CreateChamadoMovimentoDto) {
    return this.prisma.chamadoMovimento.create({
      data: {
        id_chamado: BigInt(createChamadoMovimentoDto.id_chamado),
        id_chamado_movimento_etapa: BigInt(
          createChamadoMovimentoDto.id_chamado_movimento_etapa,
        ),
        id_pessoa_usuario: BigInt(createChamadoMovimentoDto.id_pessoa_usuario),
        ordem: createChamadoMovimentoDto.ordem,
        dataHoraInicio: createChamadoMovimentoDto.dataHoraInicio
          ? new Date(createChamadoMovimentoDto.dataHoraInicio)
          : undefined,
        dataHoraFim: createChamadoMovimentoDto.dataHoraFim
          ? new Date(createChamadoMovimentoDto.dataHoraFim)
          : undefined,
        descricaoAcao: createChamadoMovimentoDto.descricaoAcao,
        observacaoTecnica: createChamadoMovimentoDto.observacaoTecnica,
        situacao: createChamadoMovimentoDto.situacao ?? 1,
        motivo: createChamadoMovimentoDto.motivo,
      },
      include: {
        chamado: true,
        etapa: true,
        usuario: true,
      },
    });
  }

  async findAll() {
    return this.prisma.chamadoMovimento.findMany({
      where: { situacao: 1 },
      include: {
        chamado: true,
        etapa: true,
        usuario: true,
        anexos: true,
        mensagens: true,
      },
    });
  }

  async findOne(id: number) {
    const movimento = await this.prisma.chamadoMovimento.findUnique({
      where: { id: BigInt(id) },
      include: {
        chamado: true,
        etapa: true,
        usuario: true,
        anexos: true,
        mensagens: true,
      },
    });

    if (!movimento) {
      throw new NotFoundException(`Movimento com ID ${id} não encontrado`);
    }

    return movimento;
  }

  async update(
    id: number,
    updateChamadoMovimentoDto: UpdateChamadoMovimentoDto,
  ) {
    await this.findOne(id);

    return this.prisma.chamadoMovimento.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateChamadoMovimentoDto.id_chamado && {
          id_chamado: BigInt(updateChamadoMovimentoDto.id_chamado),
        }),
        ...(updateChamadoMovimentoDto.id_chamado_movimento_etapa && {
          id_chamado_movimento_etapa: BigInt(
            updateChamadoMovimentoDto.id_chamado_movimento_etapa,
          ),
        }),
        ...(updateChamadoMovimentoDto.id_pessoa_usuario && {
          id_pessoa_usuario: BigInt(
            updateChamadoMovimentoDto.id_pessoa_usuario,
          ),
        }),
        ...(updateChamadoMovimentoDto.ordem !== undefined && {
          ordem: updateChamadoMovimentoDto.ordem,
        }),
        ...(updateChamadoMovimentoDto.dataHoraInicio && {
          dataHoraInicio: new Date(updateChamadoMovimentoDto.dataHoraInicio),
        }),
        ...(updateChamadoMovimentoDto.dataHoraFim && {
          dataHoraFim: new Date(updateChamadoMovimentoDto.dataHoraFim),
        }),
        ...(updateChamadoMovimentoDto.descricaoAcao && {
          descricaoAcao: updateChamadoMovimentoDto.descricaoAcao,
        }),
        ...(updateChamadoMovimentoDto.observacaoTecnica && {
          observacaoTecnica: updateChamadoMovimentoDto.observacaoTecnica,
        }),
        ...(updateChamadoMovimentoDto.situacao !== undefined && {
          situacao: updateChamadoMovimentoDto.situacao,
        }),
        ...(updateChamadoMovimentoDto.motivo && {
          motivo: updateChamadoMovimentoDto.motivo,
        }),
        updatedAt: new Date(),
      },
      include: {
        chamado: true,
        etapa: true,
        usuario: true,
      },
    });
  }

  async remove(id: number, motivo: string) {
    await this.findOne(id);

    return this.prisma.chamadoMovimento.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo,
        updatedAt: new Date(),
      },
    });
  }
}
