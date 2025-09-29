import { ConflictException, Injectable } from '@nestjs/common';
import { StatusRegistro } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePerfilDto } from '../dto/pessoa-perfil.dto';

@Injectable()
export class PessoaPerfilService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePerfilDto) {
    const perfil = await this.prisma.perfil.findFirst({
      where: {
        empresaId: data.empresaId,
        descricao: data.descricao,
      },
    });
    if (perfil) {
      throw new ConflictException('Perfil de pessoa ja cadastrado');
    } else {
      return this.prisma.perfil.create({
        data: {
          empresaId: data.empresaId,
          descricao: data.descricao,
          ativo: data.ativo,
          motivo: data.motivo,
        },
      });
    }
  }

  async findAll() {
    try {
      return await this.prisma.perfil.findMany();
    } catch (error) {
      console.error('Erro em findAll PessoaPerfil:', error);
      throw error;
    }
  }

  async findOne(id: bigint) {
    return this.prisma.perfil.findUnique({ where: { id } });
  }

  async update(id: bigint, data: CreatePerfilDto) {
    return this.prisma.perfil.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: bigint) {
    return this.prisma.perfil.update({
      where: { id },
      data: { ativo: StatusRegistro.INATIVO },
    });
  }

  async findByEmpresa(empresaId: bigint) {
    return this.prisma.perfil.findMany({ where: { empresaId } });
  }
}
