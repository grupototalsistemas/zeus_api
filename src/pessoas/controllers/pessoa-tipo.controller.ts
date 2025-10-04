import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PessoaTipoService } from '../services/pessoa-tipo.service';

@ApiTags('Pessoa Tipo')
@ApiBearerAuth()
@Controller('pessoa-tipos')
export class PessoaTipoController {
  constructor(private readonly pessoaTipoService: PessoaTipoService) {}
}
