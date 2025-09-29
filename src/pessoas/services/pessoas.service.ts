// pessoas/pessoas.service.ts
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePessoaDto, UpdatePessoaDto } from '../dto/pessoa.dto';

import { PessoaTipoService } from './pessoa-tipo.service';

@Injectable()
export class PessoasService {
  constructor(
    private prisma: PrismaService,
    private pessoaTipoService: PessoaTipoService,
  ) {}

  async create(data: CreatePessoaDto) {
    let pessoaTipoId: bigint;
    // Verifica se tem a pessoa no banco, se não tiver cria
    const pessoa = await this.prisma.pessoa.findFirst({
      where: {
        nome: data.nome,
        nomeSocial: data.nomeSocial,
        genero: data.genero,
        ativo: 'ATIVO',
      },
    });

    console.log('pessoa: ', pessoa);

    if (!pessoa) {
      const save_pessoa = await this.prisma.pessoa.create({
        data: {
          empresaId: data.empresaId,
          tipoId: data.tipoId,
          genero: data.genero,
          nome: data.nome,
          nomeSocial: data.nomeSocial,
          ativo: 'ATIVO',
        },
      });
      if (!save_pessoa) {
        // Mostra erro ao salvar, pois não foi possivel salvar
        throw new InternalServerErrorException('Erro ao salvar pessoa');
      }
      return save_pessoa;
    } else {
      // Mostra erro ao salvar, pois a pessoa ja existe
      throw new ConflictException('Pessoa ja cadastrada');
    }
  }

  findAll() {
    return this.prisma.pessoa.findMany({
      include: { empresa: true, tipo: true, usuarios: true },
    });
  }

  findOne(id: bigint) {
    return this.prisma.pessoa.findUnique({
      where: { id },
      include: { empresa: true, tipo: true, usuarios: true },
    });
  }

  update(id: bigint, data: UpdatePessoaDto) {
    return this.prisma.pessoa.update({
      where: { id },
      data,
      include: { empresa: true, tipo: true, usuarios: true },
    });
  }

  async remove(id: bigint) {
    const chamadosCount = await this.prisma.chamado.count({
      where: { pessoaId: id },
    });

    if (chamadosCount > 0) {
      throw new ConflictException(
        'Não é possível excluir pessoa que possui chamados vinculados',
      );
    }

    return this.prisma.pessoa.update({
      where: { id },
      data: { ativo: StatusRegistro.INATIVO },
    });
  }

  async findByEmpresa(empresaId: bigint) {
    return this.prisma.pessoa.findMany({
      where: { empresaId },
      include: { empresa: true, tipo: true, usuarios: true },
    });
  }
}
