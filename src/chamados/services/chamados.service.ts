import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PLimitUtil } from 'src/common/utils/p-limit.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChamadoDto, UpdateChamadoDto } from '../dto/chamado.dto';

@Injectable()
export class ChamadosService {
  constructor(private prisma: PrismaService) {}

  async create(createChamadoDto: CreateChamadoDto[]) {
    const erros: any[] = [];
    const sucessos: any[] = [];

    const total = createChamadoDto.length;

    if (!Array.isArray(createChamadoDto) || total === 0) {
      throw new BadRequestException(
        'O corpo da requisição deve ser um array de chamados e não pode estar vazio.',
      );
    }

    // limita o uso de conexoes simultaneas
    const limit = await PLimitUtil.create(50);

    const validacoes = await Promise.all(
      createChamadoDto.map((dto) => limit(() => this.verificaDados(dto))),
    );

    const chamadosCriados = await Promise.all(
      createChamadoDto.map((dto, index) =>
        limit(async () => {
          if (!validacoes[index]) {
            erros.push({ index, dto });
            return null;
          }
          const chamado = await this.prisma.chamado.create({
            data: {
              id_pessoa_juridica: BigInt(dto.id_pessoa_juridica),
              id_sistema: BigInt(dto.id_sistema),
              id_pessoa_fisica: BigInt(dto.id_pessoa_empresa),
              id_pessoa_usuario: BigInt(dto.id_pessoa_usuario),
              id_ocorrencia: BigInt(dto.id_ocorrencia),
              id_prioridade: BigInt(dto.id_prioridade),
              ...(dto.protocolo !== undefined && {
                protocolo: dto.protocolo,
              }),
              titulo: dto.titulo,
              descricao: dto.descricao,
              observacao: dto.observacao || '',
              situacao: dto.situacao ?? 1,
              motivo: dto.motivo,
            },
          });
          sucessos.push(chamado);
          return chamado;
        }),
      ),
    );

    return {
      total,
      criados: sucessos.length,
      erros: erros.length,
      detalhesErros: erros,
      chamadosCriados,
    };
  }

  private async verificaDados(
    createChamadoDto: CreateChamadoDto,
  ): Promise<boolean> {
    const empresa = await this.prisma.pessoasJuridicas.findUnique({
      where: { id: BigInt(createChamadoDto.id_pessoa_juridica) },
    });
    const sistema = await this.prisma.sistemas.findUnique({
      where: { id: BigInt(createChamadoDto.id_sistema) },
    });
    const pessoaEmpresa = await this.prisma.pessoas.findUnique({
      where: { id: BigInt(createChamadoDto.id_pessoa_empresa) },
    });
    const pessoaUsuario = await this.prisma.pessoas.findUnique({
      where: { id: BigInt(createChamadoDto.id_pessoa_usuario) },
    });
    const ocorrencia = await this.prisma.ocorrencia.findUnique({
      where: { id: BigInt(createChamadoDto.id_ocorrencia) },
    });
    const prioridade = await this.prisma.prioridade.findUnique({
      where: { id: BigInt(createChamadoDto.id_prioridade) },
    });

    return !!(
      empresa &&
      sistema &&
      pessoaEmpresa &&
      pessoaUsuario &&
      ocorrencia &&
      prioridade
    );
  }

  async findAll() {
    return this.prisma.chamado.findMany({
      where: { situacao: 1 },
      include: {
        empresa: true,
        sistema: true,
        usuario: true,
        ocorrencia: true,
        prioridade: true,
        movimentos: true,
      },
    });
  }

  async findOne(id: number) {
    const chamado = await this.prisma.chamado.findUnique({
      where: { id: BigInt(id) },
      include: {
        empresa: true,
        sistema: true,
        usuario: true,
        ocorrencia: true,
        prioridade: true,
        movimentos: {
          include: {
            etapa: true,
            usuario: true,
            anexos: true,
            mensagens: true,
          },
        },
      },
    });

    if (!chamado) {
      throw new NotFoundException(`Chamado com ID ${id} não encontrado`);
    }

    return chamado;
  }

  async update(id: number, updateChamadoDto: UpdateChamadoDto) {
    await this.findOne(id);

    return this.prisma.chamado.update({
      where: { id: BigInt(id) },
      data: {
        ...(updateChamadoDto.id_pessoa_juridica && {
          id_pessoa_juridica: BigInt(updateChamadoDto.id_pessoa_juridica),
        }),
        ...(updateChamadoDto.id_sistema && {
          id_sistema: BigInt(updateChamadoDto.id_sistema),
        }),
        ...(updateChamadoDto.id_pessoa_empresa && {
          id_pessoa_empresa: BigInt(updateChamadoDto.id_pessoa_empresa),
        }),
        ...(updateChamadoDto.id_pessoa_usuario && {
          id_pessoa_usuario: BigInt(updateChamadoDto.id_pessoa_usuario),
        }),
        ...(updateChamadoDto.id_ocorrencia && {
          id_ocorrencia: BigInt(updateChamadoDto.id_ocorrencia),
        }),
        ...(updateChamadoDto.id_prioridade && {
          id_prioridade: BigInt(updateChamadoDto.id_prioridade),
        }),
        ...(updateChamadoDto.protocolo !== undefined && {
          protocolo: updateChamadoDto.protocolo,
        }),
        ...(updateChamadoDto.titulo && { titulo: updateChamadoDto.titulo }),
        ...(updateChamadoDto.descricao && {
          descricao: updateChamadoDto.descricao,
        }),
        ...(updateChamadoDto.observacao && {
          observacao: updateChamadoDto.observacao,
        }),
        ...(updateChamadoDto.situacao !== undefined && {
          situacao: updateChamadoDto.situacao,
        }),
        ...(updateChamadoDto.motivo && { motivo: updateChamadoDto.motivo }),
        updatedAt: new Date(),
      },
      include: {
        empresa: true,
        sistema: true,
        usuario: true,
        ocorrencia: true,
        prioridade: true,
      },
    });
  }

  async remove(id: number, motivo: string) {
    await this.findOne(id);

    return this.prisma.chamado.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo,
        updatedAt: new Date(),
      },
    });
  }

  async getMetricasEmpresa(
    id_pessoa_usuario: number,
    data_inicio?: string,
    data_fim?: string,
  ) {
    const totalChamados = await this.prisma.chamado.count({
      where: {
        situacao: 1,
        id_pessoa_usuario: BigInt(id_pessoa_usuario),
        ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
        ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
      },
    });
    console.log('Total de chamados:', totalChamados);

    const chamadosAbertos = await this.prisma.chamado.count({
      where: {
        situacao: 1,
        id_pessoa_usuario: BigInt(id_pessoa_usuario),
        ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
        ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
        movimentos: {
          none: {
            etapa: { id: 1 }, // etapa: CONCLUÍDO
          },
        },
      },
    });

    const chamadosFechados = totalChamados - chamadosAbertos;

    const chamadosPorSistema = await this.prisma.chamado.groupBy({
      by: ['id_sistema'],
      where: {
        situacao: 1,
        id_pessoa_usuario: BigInt(id_pessoa_usuario),
        ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
        ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
      },
      _count: { id: true },
    });

    const chamadosPorPrioridade = await this.prisma.chamado.groupBy({
      by: ['id_prioridade'],
      where: {
        situacao: 1,
        id_pessoa_usuario: BigInt(id_pessoa_usuario),
        ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
        ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
      },
      _count: { id: true },
    });

    // const tempoMedioResolucao = await this.prisma.chamado.aggregate({
    //   where: {
    //     situacao: 1,
    //     id_pessoa_juridica: BigInt(id_pessoa_juridica),
    //     ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
    //     ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
    //     movimentos: {
    //       some: {
    //         etapa: { id: 1 }, // etapa: CONCLUÍDO
    //       },
    //     },
    //   },
    //   _avg: {
    //     // calcula a média em horas entre a data de criação do chamado e a data do movimento de conclusão
    //   },
    // });

    const chamadosAbertosPorDia = await this.prisma.chamado.groupBy({
      by: ['createdAt'],
      where: {
        situacao: 1,
        id_pessoa_usuario: BigInt(id_pessoa_usuario),
        ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
        ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
        movimentos: {
          none: {
            etapa: { id: 1 }, // etapa: CONCLUÍDO
          },
        },
      },
      _count: { id: true },
    });

    const chamadosFechadosPorDia = await this.prisma.chamado.groupBy({
      by: ['createdAt'],
      where: {
        situacao: 1,
        id_pessoa_usuario: BigInt(id_pessoa_usuario),
        ...(data_inicio && { createdAt: { gte: new Date(data_inicio) } }),
        ...(data_fim && { createdAt: { lte: new Date(data_fim) } }),
        movimentos: {
          some: {
            etapa: { id: 1 }, // etapa: CONCLUÍDO
          },
        },
      },
      _count: { id: true },
    });

    const resultado = {
      totalChamados,
      chamadosAbertos,
      chamadosFechados,
      chamadosPorSistema,
      chamadosPorPrioridade,
      chamadosAbertosPorDia,
      chamadosFechadosPorDia,
    };

    return resultado;
  }

  async getMetricasUsuario(id_usuario: number) {
    const totalChamados = await this.prisma.chamado.count({
      where: {
        id_pessoa_usuario: BigInt(id_usuario),
      },
    });
  }
}
