import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateOcorrenciaDto,
  QueryOcorrenciaDto,
  UpdateOcorrenciaDto,
} from '../dto/ocorrencia.dto';

@Injectable()
export class OcorrenciaService {
  constructor(private prisma: PrismaService) {}

  async create(createOcorrenciaDto: CreateOcorrenciaDto) {
    const descricao = createOcorrenciaDto.descricao.trim();

    const ocorrenciaExistente = await this.prisma.ocorrencia.findFirst({
      where: {
        id_ocorrencia_tipo: BigInt(createOcorrenciaDto.id_ocorrencia_tipo),
        id_pessoa_juridica: BigInt(createOcorrenciaDto.id_pessoa_juridica),
        descricao,
        situacao: 1,
      },
    });

    if (ocorrenciaExistente) {
      throw new BadRequestException('Ocorrencia ja cadastrada');
    }

    return this.prisma.ocorrencia.create({
      data: {
        id_ocorrencia_tipo: BigInt(createOcorrenciaDto.id_ocorrencia_tipo),
        id_pessoa_juridica: BigInt(createOcorrenciaDto.id_pessoa_juridica),
        descricao,
        situacao: createOcorrenciaDto.situacao ?? 1,
        motivo: createOcorrenciaDto.motivo,
      },
    });
  }

  async findAll(query?: QueryOcorrenciaDto) {
    const createdAt = query?.createdAt ? new Date(query.createdAt) : undefined;
    const hasValidCreatedAt = createdAt && !Number.isNaN(createdAt.getTime());

    const ocorrencias = await this.prisma.ocorrencia.findMany({
      where: {
        situacao: query?.situacao ?? 1,
        ...(query?.id && { id: BigInt(query.id) }),
        ...(query?.id_ocorrencia_tipo && {
          id_ocorrencia_tipo: BigInt(query.id_ocorrencia_tipo),
        }),
        ...(query?.id_pessoa_juridica && {
          id_pessoa_juridica: BigInt(query.id_pessoa_juridica),
        }),
        ...(query?.descricao && {
          descricao: { contains: query.descricao, mode: 'insensitive' },
        }),
        ...(hasValidCreatedAt && { createdAt }),
      },
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
    const ocorrenciaAtual = await this.findOne(id);

    const idOcorrenciaTipo =
      updateOcorrenciaDto.id_ocorrencia_tipo !== undefined
        ? BigInt(updateOcorrenciaDto.id_ocorrencia_tipo)
        : ocorrenciaAtual.id_ocorrencia_tipo;

    const idPessoaJuridica =
      updateOcorrenciaDto.id_pessoa_juridica !== undefined
        ? BigInt(updateOcorrenciaDto.id_pessoa_juridica)
        : ocorrenciaAtual.id_pessoa_juridica;

    const descricao =
      updateOcorrenciaDto.descricao?.trim() ?? ocorrenciaAtual.descricao;

    const ocorrenciaDuplicada = await this.prisma.ocorrencia.findFirst({
      where: {
        id: { not: BigInt(id) },
        id_ocorrencia_tipo: idOcorrenciaTipo,
        id_pessoa_juridica: idPessoaJuridica,
        descricao,
        situacao: 1,
      },
    });

    if (ocorrenciaDuplicada) {
      throw new BadRequestException('Ocorrencia ja cadastrada');
    }

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
          descricao,
        }),
        ...(updateOcorrenciaDto.situacao !== undefined && {
          situacao: updateOcorrenciaDto.situacao,
        }),
        ...(updateOcorrenciaDto.motivo && {
          motivo: updateOcorrenciaDto.motivo,
        }),
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: number, motivo: string) {
    const ocorrenciaAtual = await this.findOne(id);

    if (ocorrenciaAtual.situacao !== 1) {
      throw new BadRequestException('Ocorrencia ja esta desativada');
    }

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
