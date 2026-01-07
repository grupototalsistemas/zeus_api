import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePessoasEnderecosTipoDto,
  DeletePessoasEnderecosTipoDto,
  QueryPessoasEnderecosTipoDto,
  UpdatePessoasEnderecosTipoDto,
} from '../dto/pessoa-endereco-tipo.dto';
import { PessoasEnderecosTipoEntity } from '../entities/pessoas-endereco-tipo.entity';

@Injectable()
export class PessoasEnderecosTiposService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreatePessoasEnderecosTipoDto,
  ): Promise<PessoasEnderecosTipoEntity> {
    const idPessoa = this.toBigInt(dto.id_pessoa, 'id_pessoa');

    await this.ensurePessoaExists(idPessoa);

    await this.ensureDescricaoDisponivel(idPessoa, dto.descricao);

    const tipo = await this.prisma.pessoasEnderecosTipo.create({
      data: {
        id_pessoa: idPessoa,
        descricao: dto.descricao,
        situacao: dto.situacao ?? 1,
        motivo: dto.motivo ?? null,
      },
    });

    return this.mapTipo(tipo);
  }

  async findAll(
    query?: QueryPessoasEnderecosTipoDto,
  ): Promise<PessoasEnderecosTipoEntity[]> {
    const where: Prisma.PessoasEnderecosTipoWhereInput = {};
    const andConditions: Prisma.PessoasEnderecosTipoWhereInput[] = [];

    const situacaoFilter = query?.situacao !== undefined ? query.situacao : 1;
    andConditions.push({ situacao: situacaoFilter });

    if (query?.descricao) {
      andConditions.push({
        descricao: {
          contains: query.descricao,
          mode: 'insensitive',
        },
      });
    }

    if (query?.id_pessoa) {
      const idPessoa = this.toBigInt(query.id_pessoa, 'id_pessoa');
      const orConditions: Prisma.PessoasEnderecosTipoWhereInput[] = [
        { id_pessoa: idPessoa },
      ];

      if (idPessoa !== BigInt(-1)) {
        orConditions.push({ id_pessoa: BigInt(-1) });
      }

      andConditions.push({ OR: orConditions });
    }

    if (andConditions.length) {
      where.AND = andConditions;
    }

    const tipos = await this.prisma.pessoasEnderecosTipo.findMany({
      where,
      orderBy: {
        descricao: 'asc',
      },
    });

    return tipos.map((tipo) => this.mapTipo(tipo));
  }

  async findOne(id: number): Promise<PessoasEnderecosTipoEntity> {
    const tipo = await this.prisma.pessoasEnderecosTipo.findUnique({
      where: { id: this.toBigInt(id, 'id') },
    });

    if (!tipo) {
      throw new NotFoundException('Tipo de endereco nao encontrado');
    }

    return this.mapTipo(tipo);
  }

  async update(
    id: number,
    dto: UpdatePessoasEnderecosTipoDto,
  ): Promise<PessoasEnderecosTipoEntity> {
    const tipoId = this.toBigInt(id, 'id');

    const existente = await this.prisma.pessoasEnderecosTipo.findUnique({
      where: { id: tipoId },
    });

    if (!existente) {
      throw new NotFoundException('Tipo de endereco nao encontrado');
    }

    const data: Prisma.PessoasEnderecosTipoUncheckedUpdateInput = {};
    let pessoaAlvo = existente.id_pessoa;

    if (dto.id_pessoa) {
      const novoIdPessoa = this.toBigInt(dto.id_pessoa, 'id_pessoa');
      if (novoIdPessoa !== existente.id_pessoa) {
        const enderecosVinculados = await this.prisma.pessoasEnderecos.count({
          where: { id_pessoa_endereco_tipo: tipoId },
        });

        if (enderecosVinculados > 0) {
          throw new BadRequestException(
            'Nao e permitido alterar a pessoa enquanto existem enderecos vinculados ao tipo',
          );
        }
      }

      await this.ensurePessoaExists(novoIdPessoa);
      data.id_pessoa = novoIdPessoa;
      pessoaAlvo = novoIdPessoa;
    }

    if (dto.descricao && dto.descricao !== existente.descricao) {
      await this.ensureDescricaoDisponivel(pessoaAlvo, dto.descricao, tipoId);
      data.descricao = dto.descricao;
    }

    if (dto.situacao !== undefined) {
      data.situacao = dto.situacao;
    }

    if (dto.motivo !== undefined) {
      data.motivo = dto.motivo ?? null;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nenhum campo valido para atualizacao');
    }

    data.updatedAt = new Date();

    const atualizado = await this.prisma.pessoasEnderecosTipo.update({
      where: { id: tipoId },
      data,
    });

    return this.mapTipo(atualizado);
  }

  async remove(id: number, deleteData: DeletePessoasEnderecosTipoDto) {
    const tipoId = this.toBigInt(id, 'id');

    const tipo = await this.prisma.pessoasEnderecosTipo.findUnique({
      where: { id: tipoId },
    });

    if (!tipo) {
      throw new NotFoundException('Tipo de endereco nao encontrado');
    }

    // Verifica se está ativo (situacao = 1)
    if (tipo.situacao !== 1) {
      throw new BadRequestException('Tipo de endereco ja esta desativado');
    }

    // Verifica se não é registro global (id_pessoa = -1)
    if (Number(tipo.id_pessoa) === -1) {
      throw new BadRequestException(
        'Nao e permitido remover registros globais (pessoa = -1)',
      );
    }

    const enderecosAtivos = await this.prisma.pessoasEnderecos.count({
      where: {
        id_pessoa_endereco_tipo: tipoId,
        situacao: { not: 0 },
      },
    });

    if (enderecosAtivos > 0) {
      throw new ConflictException(
        'Nao e possivel excluir este tipo pois existem enderecos ativos vinculados',
      );
    }

    if (!deleteData?.motivo) {
      throw new BadRequestException('O motivo da exclusao é obrigatório');
    }

    await this.prisma.pessoasEnderecosTipo.update({
      where: { id: tipoId },
      data: {
        situacao: 0,
        motivo: deleteData.motivo,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Tipo de endereco inativado com sucesso',
      id,
      motivo: deleteData.motivo,
    };
  }

  private async ensurePessoaExists(id: bigint) {
    const pessoa = await this.prisma.pessoas.findUnique({
      where: { id },
    });

    if (!pessoa) {
      throw new NotFoundException('Pessoa nao encontrada');
    }
  }

  private async ensureDescricaoDisponivel(
    idPessoa: bigint,
    descricao: string,
    ignoreId?: bigint,
  ) {
    const existente = await this.prisma.pessoasEnderecosTipo.findFirst({
      where: {
        id_pessoa: idPessoa,
        descricao,
        ...(ignoreId ? { id: { not: ignoreId } } : {}),
      },
    });

    if (existente) {
      throw new ConflictException(
        'Ja existe um tipo de endereco com esta descricao para a pessoa informada',
      );
    }
  }

  private mapTipo(data: Prisma.PessoasEnderecosTipoGetPayload<{}>) {
    return {
      id: Number(data.id),
      id_pessoa: Number(data.id_pessoa),
      descricao: data.descricao,
      situacao: data.situacao,
      motivo: data.motivo,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as PessoasEnderecosTipoEntity;
  }

  private toBigInt(value: string | number | bigint, field: string): bigint {
    if (value === null || value === undefined || value === ('' as any)) {
      throw new BadRequestException(`Campo ${field} e obrigatorio`);
    }

    try {
      return typeof value === 'bigint' ? value : BigInt(value);
    } catch (error) {
      throw new BadRequestException(`Campo ${field} invalido`);
    }
  }
}
