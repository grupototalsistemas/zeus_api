import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateChamadoMovimentoMensagemDto,
  UpdateChamadoMovimentoMensagemDto,
} from '../dto/chamado-movimento-mensagem.dto';

@Injectable()
export class ChamadoMovimentoMensagensService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateChamadoMovimentoMensagemDto) {
    return this.prisma.chamadoMovimentoMensagem.create({
      data: {
        id_chamado_movimento: BigInt(createDto.id_chamado_movimento),
        id_pessoa_usuario_envio: BigInt(createDto.id_pessoa_usuario_envio),
        id_pessoa_usuario_leitura: BigInt(createDto.id_pessoa_usuario_leitura),
        ordem: createDto.ordem,
        descricao: createDto.descricao,
        dataHoraEnvio: createDto.dataHoraEnvio
          ? new Date(createDto.dataHoraEnvio)
          : undefined,
        dataHoraLeitura: createDto.dataHoraLeitura
          ? new Date(createDto.dataHoraLeitura)
          : undefined,
        situacao: createDto.situacao ?? 1,
        motivo: createDto.motivo,
      },
      include: {
        movimento: true,
        usuarioEnvio: true,
        usuarioLeitura: true,
      },
    });
  }

  async findAll() {
    return this.prisma.chamadoMovimentoMensagem.findMany({
      where: { situacao: 1 },
      include: {
        movimento: true,
        usuarioEnvio: true,
        usuarioLeitura: true,
      },
    });
  }

  async findOne(id: number) {
    const mensagem = await this.prisma.chamadoMovimentoMensagem.findUnique({
      where: { id: BigInt(id) },
      include: {
        movimento: true,
        usuarioEnvio: true,
        usuarioLeitura: true,
      },
    });

    if (!mensagem) {
      throw new NotFoundException(`Mensagem com ID ${id} não encontrada`);
    }

    return mensagem;
  }

  async update(id: number, updateDto: UpdateChamadoMovimentoMensagemDto) {
    await this.findOne(id);

    return this.prisma.chamadoMovimentoMensagem.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateDto.id_chamado_movimento && {
          id_chamado_movimento: BigInt(updateDto.id_chamado_movimento),
        }),
        ...(updateDto.id_pessoa_usuario_envio && {
          id_pessoa_usuario_envio: BigInt(updateDto.id_pessoa_usuario_envio),
        }),
        ...(updateDto.id_pessoa_usuario_leitura && {
          id_pessoa_usuario_leitura: BigInt(
            updateDto.id_pessoa_usuario_leitura,
          ),
        }),
        ...(updateDto.ordem !== undefined && { ordem: updateDto.ordem }),
        ...(updateDto.descricao && { descricao: updateDto.descricao }),
        ...(updateDto.dataHoraEnvio && {
          dataHoraEnvio: new Date(updateDto.dataHoraEnvio),
        }),
        ...(updateDto.dataHoraLeitura && {
          dataHoraLeitura: new Date(updateDto.dataHoraLeitura),
        }),
        ...(updateDto.situacao !== undefined && {
          situacao: updateDto.situacao,
        }),
        ...(updateDto.motivo && { motivo: updateDto.motivo }),
        updatedAt: new Date(),
      },
      include: {
        movimento: true,
        usuarioEnvio: true,
        usuarioLeitura: true,
      },
    });
  }

  async remove(id: number, motivo: string) {
    await this.findOne(id);

    return this.prisma.chamadoMovimentoMensagem.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo,
        updatedAt: new Date(),
      },
    });
  }
}
