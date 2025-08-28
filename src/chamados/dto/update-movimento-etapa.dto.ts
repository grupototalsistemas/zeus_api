import { PartialType } from '@nestjs/swagger';
import { CreateMovimentoEtapaDto } from './create-movimento-etapa.dto';

export class UpdateMovimentoEtapaDto extends PartialType(CreateMovimentoEtapaDto) {}
