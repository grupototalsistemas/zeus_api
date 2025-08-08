// pessoas/pessoas.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';

@Injectable()
export class PessoasService {
  constructor(private prisma: PrismaService) {}

  create(data: CreatePessoaDto) {
    return this.prisma.pessoa.create({
      data,
      include: { empresa: true, tipo: true, usuarios: true },
    });
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

  remove(id: bigint) {
    return this.prisma.pessoa.delete({ where: { id } });
  }
}
