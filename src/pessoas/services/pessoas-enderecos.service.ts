import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePessoasEnderecosDto,
  DeletePessoasEnderecosDto,
  QueryPessoasEnderecosDto,
  UpdatePessoasEnderecosDto,
} from '../dto/pessoa-endereco.dto';
import { PessoasEnderecosTipoEntity } from '../entities/pessoas-endereco-tipo.entity';
import { PessoasEnderecosEntity } from '../entities/pessoas-endereco.entity';

type EnderecoWithTipo = Prisma.PessoasEnderecosGetPayload<{
  include: { enderecoTipo: true };
}>;
type EnderecoTipoModel = Prisma.PessoasEnderecosTipoGetPayload<{}>;

@Injectable()
export class PessoasEnderecosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreatePessoasEnderecosDto,
  ): Promise<PessoasEnderecosEntity> {
    const idPessoa = this.toBigInt(dto.id_pessoa, 'id_pessoa');
    const idTipo = this.toBigInt(
      dto.id_pessoa_endereco_tipo,
      'id_pessoa_endereco_tipo',
    );

    await this.ensurePessoaExists(idPessoa);
    const tipo = await this.ensureEnderecoTipoExists(idTipo);

    if (tipo.id_pessoa !== idPessoa) {
      throw new BadRequestException(
        'O tipo de endereco informado nao pertence a pessoa selecionada',
      );
    }

    const endereco = await this.prisma.pessoasEnderecos.create({
      data: {
        id_pessoa: idPessoa,
        id_pessoa_endereco_tipo: idTipo,
        logradouro: dto.logradouro,
        endereco: dto.endereco,
        numero: dto.numero ?? null,
        complemento: dto.complemento ?? null,
        bairro: dto.bairro,
        municipio: dto.municipio,
        municipio_ibge: dto.municipio_ibge ?? null,
        estado: dto.estado,
        cep: dto.cep,
      },
      include: {
        enderecoTipo: true,
      },
    });

    return this.mapEndereco(endereco);
  }

  async findAll(
    query?: QueryPessoasEnderecosDto,
  ): Promise<PessoasEnderecosEntity[]> {
    const where: Prisma.PessoasEnderecosWhereInput = {};

    if (query?.id_pessoa) {
      where.id_pessoa = this.toBigInt(query.id_pessoa, 'id_pessoa');
    }

    if (query?.id_pessoa_endereco_tipo) {
      where.id_pessoa_endereco_tipo = this.toBigInt(
        query.id_pessoa_endereco_tipo,
        'id_pessoa_endereco_tipo',
      );
    }

    where.situacao = query?.situacao ?? 1;

    const enderecos = await this.prisma.pessoasEnderecos.findMany({
      where,
      include: {
        enderecoTipo: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return enderecos.map((endereco) => this.mapEndereco(endereco));
  }

  async findOne(id: number): Promise<PessoasEnderecosEntity> {
    const endereco = await this.prisma.pessoasEnderecos.findUnique({
      where: { id: this.toBigInt(id, 'id') },
      include: {
        enderecoTipo: true,
      },
    });

    if (!endereco) {
      throw new NotFoundException('Endereco nao encontrado');
    }

    return this.mapEndereco(endereco);
  }

  async update(
    id: number,
    dto: UpdatePessoasEnderecosDto,
  ): Promise<PessoasEnderecosEntity> {
    const enderecoId = this.toBigInt(id, 'id');

    const existente = await this.prisma.pessoasEnderecos.findUnique({
      where: { id: enderecoId },
    });

    if (!existente) {
      throw new NotFoundException('Endereco nao encontrado');
    }

    const data: Prisma.PessoasEnderecosUncheckedUpdateInput = {};
    let pessoaAlvo = existente.id_pessoa;

    if (dto.id_pessoa) {
      pessoaAlvo = this.toBigInt(dto.id_pessoa, 'id_pessoa');
      await this.ensurePessoaExists(pessoaAlvo);
      data.id_pessoa = pessoaAlvo;
    }

    if (dto.id_pessoa_endereco_tipo) {
      const novoTipoId = this.toBigInt(
        dto.id_pessoa_endereco_tipo,
        'id_pessoa_endereco_tipo',
      );
      const tipo = await this.ensureEnderecoTipoExists(novoTipoId);
      if (tipo.id_pessoa !== pessoaAlvo) {
        throw new BadRequestException(
          'O tipo de endereco informado nao pertence a pessoa selecionada',
        );
      }
      data.id_pessoa_endereco_tipo = novoTipoId;
    } else if (dto.id_pessoa) {
      const tipo = await this.ensureEnderecoTipoExists(
        existente.id_pessoa_endereco_tipo,
      );
      if (tipo.id_pessoa !== pessoaAlvo) {
        throw new BadRequestException(
          'Atualize o tipo de endereco para um registro vinculado a nova pessoa',
        );
      }
    }

    if (dto.logradouro !== undefined) data.logradouro = dto.logradouro;
    if (dto.endereco !== undefined) data.endereco = dto.endereco;
    if (dto.numero !== undefined) data.numero = dto.numero ?? null;
    if (dto.complemento !== undefined)
      data.complemento = dto.complemento ?? null;
    if (dto.bairro !== undefined) data.bairro = dto.bairro;
    if (dto.municipio !== undefined) data.municipio = dto.municipio;
    if (dto.municipio_ibge !== undefined)
      data.municipio_ibge = dto.municipio_ibge ?? null;
    if (dto.estado !== undefined) data.estado = dto.estado;
    if (dto.cep !== undefined) data.cep = dto.cep;
    if (dto.situacao !== undefined) data.situacao = dto.situacao;
    if (dto.motivo !== undefined) data.motivo = dto.motivo ?? null;

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nenhum campo valido para atualizacao');
    }

    data.updatedAt = new Date();

    const atualizado = await this.prisma.pessoasEnderecos.update({
      where: { id: enderecoId },
      data,
      include: {
        enderecoTipo: true,
      },
    });

    return this.mapEndereco(atualizado);
  }

  async remove(id: number, deleteData: DeletePessoasEnderecosDto) {
    const enderecoId = this.toBigInt(id, 'id');

    const existente = await this.prisma.pessoasEnderecos.findUnique({
      where: { id: enderecoId },
    });

    if (!existente) {
      throw new NotFoundException('Endereco nao encontrado');
    }

    // Verifica se está ativo (situacao = 1)
    if (existente.situacao !== 1) {
      throw new BadRequestException('Endereco ja esta desativado');
    }

    // Verifica se não é registro global (id_pessoa = -1)
    if (Number(existente.id_pessoa) === -1) {
      throw new BadRequestException(
        'Nao e permitido remover registros globais (pessoa = -1)',
      );
    }

    if (!deleteData?.motivo) {
      throw new BadRequestException('O motivo da exclusao é obrigatório');
    }

    await this.prisma.pessoasEnderecos.update({
      where: { id: enderecoId },
      data: {
        situacao: 0,
        motivo: deleteData.motivo,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Endereco inativado com sucesso',
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

  private async ensureEnderecoTipoExists(id: bigint) {
    const tipo = await this.prisma.pessoasEnderecosTipo.findUnique({
      where: { id },
    });

    if (!tipo) {
      throw new NotFoundException('Tipo de endereco nao encontrado');
    }

    return tipo;
  }

  private mapEndereco(data: EnderecoWithTipo): PessoasEnderecosEntity {
    return {
      id: Number(data.id),
      id_pessoa: Number(data.id_pessoa),
      id_pessoa_endereco_tipo: Number(data.id_pessoa_endereco_tipo),
      logradouro: data.logradouro,
      endereco: data.endereco,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      municipio: data.municipio,
      municipio_ibge: data.municipio_ibge,
      estado: data.estado,
      cep: data.cep,
      situacao: data.situacao,
      motivo: data.motivo,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      enderecoTipo: data.enderecoTipo
        ? this.mapEnderecoTipo(data.enderecoTipo)
        : undefined,
    };
  }

  private mapEnderecoTipo(data: EnderecoTipoModel): PessoasEnderecosTipoEntity {
    return {
      id: Number(data.id),
      id_pessoa: Number(data.id_pessoa),
      descricao: data.descricao,
      situacao: data.situacao,
      motivo: data.motivo,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
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
