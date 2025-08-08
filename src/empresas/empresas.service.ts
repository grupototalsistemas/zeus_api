// empresas/empresas.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateEmpresaDto) {
    return this.prisma.empresa.create({ data });
  }

  findAll() {
    return this.prisma.empresa.findMany();
  }

  findOne(id: bigint) {
    return this.prisma.empresa.findUnique({ where: { id } });
  }

  update(id: bigint, data: UpdateEmpresaDto) {
    return this.prisma.empresa.update({ where: { id }, data });
  }

  remove(id: bigint) {
    return this.prisma.empresa.delete({ where: { id } });
  }
}
