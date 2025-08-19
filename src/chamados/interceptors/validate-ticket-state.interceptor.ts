import {
    BadRequestException,
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ValidateTicketStateInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const chamadoId = request.params.id;
    const novaEtapaId = request.body.etapaId;

    if (chamadoId && novaEtapaId) {
      const chamado = await this.prisma.chamado.findUnique({
        where: { id: BigInt(chamadoId) },
        include: {
          movimentos: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { etapa: true },
          },
        },
      });

      if (!chamado) {
        throw new BadRequestException('Chamado não encontrado');
      }

      const etapaAtual = chamado.movimentos[0]?.etapa;
      const novaEtapa = await this.prisma.chamadoMovimentoEtapa.findUnique({
        where: { id: BigInt(novaEtapaId) },
      });

      if (!novaEtapa) {
        throw new BadRequestException('Etapa inválida');
      }

      // Impede que um chamado CONCLUIDO ou CANCELADO seja reaberto
      if (
        etapaAtual?.descricao === 'CONCLUIDO' ||
        etapaAtual?.descricao === 'CANCELADO'
      ) {
        throw new BadRequestException(
          'Não é possível modificar um chamado concluído ou cancelado',
        );
      }

      // Impede que um chamado pule etapas (exemplo: de CRIADO direto para CONCLUIDO)
      const etapasValidas = await this.getEtapasValidas(etapaAtual?.id);
      if (etapasValidas && !etapasValidas.includes(novaEtapaId)) {
        throw new BadRequestException(
          'Transição de estado inválida para o chamado',
        );
      }
    }

    return next.handle();
  }

  private async getEtapasValidas(etapaAtualId?: bigint): Promise<number[]> {
    if (!etapaAtualId) {
      // Se não tem etapa atual, pode ir para qualquer etapa inicial
      const etapasIniciais = await this.prisma.chamadoMovimentoEtapa.findMany({
        where: {
          descricao: {
            in: ['CRIADO', 'EM_ANALISE'],
          },
        },
      });
      return etapasIniciais.map((etapa) => Number(etapa.id));
    }

    // Mapa de transições válidas
    const transicoesValidas: Record<string, string[]> = {
      CRIADO: ['EM_ANALISE', 'CANCELADO'],
      EM_ANALISE: [
        'EM_DESENVOLVIMENTO',
        'AGUARDANDO_CLIENTE',
        'AGUARDANDO_TERCEIROS',
        'CANCELADO',
      ],
      EM_DESENVOLVIMENTO: ['EM_TESTE', 'AGUARDANDO_CLIENTE', 'CANCELADO'],
      EM_TESTE: ['CONCLUIDO', 'EM_DESENVOLVIMENTO', 'CANCELADO'],
      AGUARDANDO_CLIENTE: [
        'EM_ANALISE',
        'EM_DESENVOLVIMENTO',
        'CONCLUIDO',
        'CANCELADO',
      ],
      AGUARDANDO_TERCEIROS: [
        'EM_ANALISE',
        'EM_DESENVOLVIMENTO',
        'CONCLUIDO',
        'CANCELADO',
      ],
      CONCLUIDO: [],
      CANCELADO: [],
    };

    const etapaAtual = await this.prisma.chamadoMovimentoEtapa.findUnique({
      where: { id: etapaAtualId },
    });

    if (!etapaAtual) return [];

    const etapasPermitidas = transicoesValidas[etapaAtual.descricao] || [];
    const etapasValidas = await this.prisma.chamadoMovimentoEtapa.findMany({
      where: {
        descricao: {
          in: etapasPermitidas,
        },
      },
    });

    return etapasValidas.map((etapa) => Number(etapa.id));
  }
}
