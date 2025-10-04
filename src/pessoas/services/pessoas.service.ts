// pessoas/pessoas.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { PessoaTipoService } from './pessoa-tipo.service';

@Injectable()
export class PessoasService {
  constructor(
    private prisma: PrismaService,
    private pessoaTipoService: PessoaTipoService,
  ) {}
}
