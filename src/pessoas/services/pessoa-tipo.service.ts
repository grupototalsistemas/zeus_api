import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePessoaTipoDto } from '../dto/create-pessoa-tipo.dto';

@Injectable()
export class PessoaTipoService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePessoaTipoDto) {
    const pessoaTipo = await this.prisma.pessoaTipo.findFirst({
      where: {
        empresaId: data.empresaId,
        descricao: data.descricao,
      },
    });
    if (pessoaTipo) {
      throw new ConflictException('Tipo de pessoa ja cadastrado');
    } else {
      return this.prisma.pessoaTipo.create({
        data: {
          empresaId: data.empresaId,
          descricao: data.descricao,
          ativo: data.ativo,
        },
      });
    }
  }

  async findAll() {
    try {
      return await this.prisma.pessoaTipo.findMany();
    } catch (error) {
      console.error('Erro em findAll PessoaTipo:', error);
      throw error;
    }
  }

  async findOne(id: bigint) {
    return this.prisma.pessoaTipo.findUnique({ where: { id } });
  }

  async update(id: bigint, data: CreatePessoaTipoDto) {
    return this.prisma.pessoaTipo.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: bigint) {
    return this.prisma.pessoaTipo.delete({ where: { id } });
  }
}
