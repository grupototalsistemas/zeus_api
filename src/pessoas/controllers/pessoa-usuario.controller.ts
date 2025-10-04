import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { PessoaUsuarioService } from '../services/pessoa-usuario.service';

@ApiTags('Pessoa Usuario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pessoa-usuario')
export class PessoaUsuarioController {
  constructor(private readonly pessoaUsuarioService: PessoaUsuarioService) {}
}
