// pessoas/pessoas.controller.ts
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PessoasService } from '../services/pessoas.service';

@ApiTags('Pessoas')
@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}
}
