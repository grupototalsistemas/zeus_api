import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateOcorrenciaTipoDto,
  QueryOcorrenciaTipoDto,
  UpdateOcorrenciaTipoDto,
} from '../dto/ocorrencia-tipo.dto';

@Injectable()
export class OcorrenciaTipoService {
  constructor(private prisma: PrismaService) {}

  async create(createOcorrenciaTipoDto: CreateOcorrenciaTipoDto) {
    const idPessoaJuridica = BigInt(createOcorrenciaTipoDto.id_pessoa_juridica);
    await this.ensureEmpresaExists(idPessoaJuridica);

    const descricao = this.normalizeDescricao(
      createOcorrenciaTipoDto.descricao,
    );
    await this.ensureDescricaoDisponivel(idPessoaJuridica, descricao);

    return this.prisma.ocorrenciaTipo.create({
      data: {
        id_pessoa_juridica: idPessoaJuridica,
        descricao,
        situacao: createOcorrenciaTipoDto.situacao ?? 1,
        motivo: createOcorrenciaTipoDto.motivo,
      },
    });
  }

  async findAll(query?: QueryOcorrenciaTipoDto) {
    const createdAt = query?.createdAt ? new Date(query.createdAt) : undefined;
    const hasValidCreatedAt = createdAt && !Number.isNaN(createdAt.getTime());

    return this.prisma.ocorrenciaTipo.findMany({
      where: {
        situacao: query?.situacao ?? 1,
        ...(query?.id && { id: BigInt(query.id) }),
        ...(query?.id_pessoa_juridica && {
          id_pessoa_juridica: BigInt(query.id_pessoa_juridica),
        }),
        ...(query?.descricao && {
          descricao: { contains: query.descricao, mode: 'insensitive' },
        }),
        ...(hasValidCreatedAt && { createdAt }),
      },
      orderBy: {
        descricao: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const ocorrenciaTipo = await this.prisma.ocorrenciaTipo.findUnique({
      where: { id: BigInt(id) },
      include: {
        ocorrencias: true,
      },
    });

    if (!ocorrenciaTipo) {
      throw new NotFoundException(
        `Tipo de ocorrencia com ID ${id} nao encontrado`,
      );
    }

    return ocorrenciaTipo;
  }

  async update(id: number, updateOcorrenciaTipoDto: UpdateOcorrenciaTipoDto) {
    const hasUpdateFields =
      updateOcorrenciaTipoDto.id_pessoa_juridica !== undefined ||
      updateOcorrenciaTipoDto.descricao !== undefined ||
      updateOcorrenciaTipoDto.situacao !== undefined ||
      updateOcorrenciaTipoDto.motivo !== undefined;

    if (!hasUpdateFields) {
      throw new BadRequestException('Nenhum campo valido para atualizacao');
    }

    const ocorrenciaTipoAtual = await this.findOne(id);
    const tipoId = BigInt(id);

    const idPessoaJuridica =
      updateOcorrenciaTipoDto.id_pessoa_juridica !== undefined
        ? BigInt(updateOcorrenciaTipoDto.id_pessoa_juridica)
        : ocorrenciaTipoAtual.id_pessoa_juridica;

    if (
      updateOcorrenciaTipoDto.id_pessoa_juridica !== undefined &&
      idPessoaJuridica !== ocorrenciaTipoAtual.id_pessoa_juridica
    ) {
      await this.ensureEmpresaExists(idPessoaJuridica);

      const ocorrenciasVinculadas = await this.prisma.ocorrencia.count({
        where: { id_ocorrencia_tipo: tipoId },
      });

      if (ocorrenciasVinculadas > 0) {
        throw new BadRequestException(
          'Nao e permitido alterar a empresa com ocorrencias vinculadas',
        );
      }
    }

    const descricao =
      updateOcorrenciaTipoDto.descricao !== undefined
        ? this.normalizeDescricao(updateOcorrenciaTipoDto.descricao)
        : ocorrenciaTipoAtual.descricao;

    if (
      descricao !== ocorrenciaTipoAtual.descricao ||
      idPessoaJuridica !== ocorrenciaTipoAtual.id_pessoa_juridica
    ) {
      await this.ensureDescricaoDisponivel(idPessoaJuridica, descricao, tipoId);
    }

    return this.prisma.ocorrenciaTipo.update({
      where: { id: tipoId },
      data: {
        ...(updateOcorrenciaTipoDto.id_pessoa_juridica && {
          id_pessoa_juridica: idPessoaJuridica,
        }),
        ...(updateOcorrenciaTipoDto.descricao && {
          descricao,
        }),
        ...(updateOcorrenciaTipoDto.situacao !== undefined && {
          situacao: updateOcorrenciaTipoDto.situacao,
        }),
        ...(updateOcorrenciaTipoDto.motivo !== undefined && {
          motivo: updateOcorrenciaTipoDto.motivo,
        }),
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: number, motivo: string) {
    const ocorrenciaTipoAtual = await this.findOne(id);

    if (ocorrenciaTipoAtual.situacao !== 1) {
      throw new BadRequestException('Tipo de ocorrencia ja esta desativado');
    }

    const ocorrenciasAtivas = await this.prisma.ocorrencia.count({
      where: {
        id_ocorrencia_tipo: BigInt(id),
        situacao: { not: 0 },
      },
    });

    if (ocorrenciasAtivas > 0) {
      throw new ConflictException(
        'Nao e possivel excluir este tipo pois existem ocorrencias ativas vinculadas',
      );
    }

    return this.prisma.ocorrenciaTipo.update({
      where: { id: BigInt(id) },
      data: {
        situacao: 0,
        motivo,
        updatedAt: new Date(),
      },
    });
  }

  private normalizeDescricao(descricao: string) {
    const trimmed = descricao.trim();

    if (!trimmed) {
      throw new BadRequestException('Descricao nao pode ser vazia');
    }

    return trimmed;
  }

  private async ensureEmpresaExists(idPessoaJuridica: bigint) {
    const empresa = await this.prisma.pessoasJuridicas.findUnique({
      where: { id: idPessoaJuridica },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa nao encontrada');
    }
  }

  private async ensureDescricaoDisponivel(
    idPessoaJuridica: bigint,
    descricao: string,
    ignoreId?: bigint,
  ) {
    const ocorrenciaTipoExistente = await this.prisma.ocorrenciaTipo.findFirst({
      where: {
        id_pessoa_juridica: idPessoaJuridica,
        descricao,
        situacao: 1,
        ...(ignoreId && { id: { not: ignoreId } }),
      },
    });

    if (ocorrenciaTipoExistente) {
      throw new BadRequestException('Tipo de ocorrencia ja cadastrado');
    }
  }
}
