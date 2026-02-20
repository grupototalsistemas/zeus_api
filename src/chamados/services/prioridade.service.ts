import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePrioridadeDto,
  QueryPrioridadeDto,
  UpdatePrioridadeDto,
} from '../dto/prioridade.dto';

@Injectable()
export class PrioridadeService {
  constructor(private prisma: PrismaService) {}

  async create(createPrioridadeDto: CreatePrioridadeDto) {
    const descricao = createPrioridadeDto.descricao.trim();
    const cor = createPrioridadeDto.cor.trim();

    const prioridadeExistente = await this.prisma.prioridade.findFirst({
      where: {
        id_pessoa_juridica: BigInt(createPrioridadeDto.id_pessoa_juridica),
        descricao,
        cor,
        tempoResolucao: createPrioridadeDto.tempoResolucao,
        situacao: 1,
      },
    });

    if (prioridadeExistente) {
      throw new BadRequestException('Prioridade ja cadastrada');
    }

    return this.prisma.prioridade.create({
      data: {
        id_pessoa_juridica: BigInt(createPrioridadeDto.id_pessoa_juridica),
        descricao,
        cor,
        tempoResolucao: createPrioridadeDto.tempoResolucao,
        situacao: createPrioridadeDto.situacao ?? 1,
        motivo: createPrioridadeDto.motivo,
      },
      include: {
        empresa: true,
      },
    });
  }

  async findAll(query?: QueryPrioridadeDto) {
    const tempoResolucaoFilter: { gte?: number; lte?: number } = {};

    if (query?.tempoResolucaoMin !== undefined) {
      tempoResolucaoFilter.gte = query.tempoResolucaoMin;
    }

    if (query?.tempoResolucaoMax !== undefined) {
      tempoResolucaoFilter.lte = query.tempoResolucaoMax;
    }

    const createdAt = query?.createdAt ? new Date(query.createdAt) : undefined;
    const hasValidCreatedAt = createdAt && !Number.isNaN(createdAt.getTime());

    const prioridades = await this.prisma.prioridade.findMany({
      where: {
        situacao: query?.situacao ?? 1,
        ...(query?.id && { id: BigInt(query.id) }),
        ...(query?.id_pessoa_juridica && {
          id_pessoa_juridica: BigInt(query.id_pessoa_juridica),
        }),
        ...(query?.descricao && {
          descricao: { contains: query.descricao, mode: 'insensitive' },
        }),
        ...(query?.cor && {
          cor: { equals: query.cor, mode: 'insensitive' },
        }),
        ...(query?.tempoResolucao !== undefined && {
          tempoResolucao: query.tempoResolucao,
        }),
        ...((query?.tempoResolucao === undefined &&
          (tempoResolucaoFilter.gte !== undefined ||
            tempoResolucaoFilter.lte !== undefined) && {
            tempoResolucao: tempoResolucaoFilter,
          }) ||
          {}),
        ...(hasValidCreatedAt && { createdAt }),
      },
    });
    return prioridades;
  }

  async findOne(id: number) {
    const prioridade = await this.prisma.prioridade.findUnique({
      where: { id: BigInt(id) },
    });

    if (!prioridade) {
      throw new NotFoundException(`Prioridade com ID ${id} não encontrada`);
    }

    return prioridade;
  }

  async update(id: number, updatePrioridadeDto: UpdatePrioridadeDto) {
    const prioridadeAtual = await this.findOne(id);

    const idPessoaJuridica =
      updatePrioridadeDto.id_pessoa_juridica !== undefined
        ? BigInt(updatePrioridadeDto.id_pessoa_juridica)
        : prioridadeAtual.id_pessoa_juridica;

    const descricao =
      updatePrioridadeDto.descricao?.trim() ?? prioridadeAtual.descricao;
    const cor = updatePrioridadeDto.cor?.trim() ?? prioridadeAtual.cor;
    const tempoResolucao =
      updatePrioridadeDto.tempoResolucao ?? prioridadeAtual.tempoResolucao;

    const prioridadeDuplicada = await this.prisma.prioridade.findFirst({
      where: {
        id: { not: BigInt(id) },
        id_pessoa_juridica: idPessoaJuridica,
        descricao,
        cor,
        tempoResolucao,
        situacao: 1,
      },
    });

    if (prioridadeDuplicada) {
      throw new BadRequestException('Prioridade ja cadastrada');
    }

    return this.prisma.prioridade.update({
      where: { id: BigInt(id) },
      data: {
        ...(updatePrioridadeDto.id_pessoa_juridica && {
          id_pessoa_juridica: BigInt(updatePrioridadeDto.id_pessoa_juridica),
        }),
        ...(updatePrioridadeDto.descricao && {
          descricao,
        }),
        ...(updatePrioridadeDto.cor && {
          cor,
        }),
        ...(updatePrioridadeDto.tempoResolucao && {
          tempoResolucao,
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
    const prioridadeAtual = await this.findOne(id);

    if (prioridadeAtual.situacao !== 1) {
      throw new BadRequestException('Prioridade ja esta desativada');
    }

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
