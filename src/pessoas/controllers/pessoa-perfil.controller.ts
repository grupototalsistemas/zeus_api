import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { PessoaPerfilService } from '../services/pessoa-perfil.service';

@ApiTags('Pessoa Perfil')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pessoa-perfil')
export class PessoaPerfilController {
  constructor(private readonly pessoaPerfilService: PessoaPerfilService) {}
}
