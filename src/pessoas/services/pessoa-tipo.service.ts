import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PessoaTipoService {
  constructor(private prisma: PrismaService) {}
}
