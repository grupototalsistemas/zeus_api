import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChamadosNotificacaoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma notificação para um chamado
   */
  //   async criarNotificacao(dados: {
  //     chamadoId: number;
  //     usuarioId: number;
  //     tipo: 'ATRASO' | 'MOVIMENTO' | 'MENSAGEM' | 'ANEXO' | 'ETAPA';
  //     titulo: string;
  //     mensagem: string;
  //   }) {
  //     return this.prisma.notificacao.create({
  //       data: {
  //         chamadoId: dados.chamadoId,
  //         usuarioId: dados.usuarioId,
  //         tipo: dados.tipo,
  //         titulo: dados.titulo,
  //         mensagem: dados.mensagem,
  //         lida: false,
  //         ativo: StatusRegistro.ATIVO,
  //       },
  //     });
  //   }

  /**
   * Busca notificações não lidas de um usuário
   */
  //   async getNotificacoesNaoLidas(usuarioId: number) {
  //     return this.prisma.notificacao.findMany({
  //       where: {
  //         usuarioId,
  //         lida: false,
  //         ativo: StatusRegistro.ATIVO,
  //       },
  //       include: {
  //         chamado: {
  //           select: {
  //             id: true,
  //             titulo: true,
  //             prioridade: true,
  //           },
  //         },
  //       },
  //       orderBy: {
  //         createdAt: 'desc',
  //       },
  //     });
  //   }

  /**
   * Marca uma notificação como lida
   */
  //   async marcarComoLida(notificacaoId: bigint) {
  //     return this.prisma.notificacao.update({
  //       where: { id: notificacaoId },
  //       data: { lida: true },
  //     });
  //   }

  /**
   * Notifica sobre atrasos em chamados
   */
  //   async notificarAtrasos() {
  //     const chamadosAtrasados = await this.prisma.chamado.findMany({
  //       where: {
  //         ativo: StatusRegistro.ATIVO,
  //         movimentos: {
  //           some: {
  //             etapa: {
  //               descricao: {
  //                 notIn: ['CONCLUIDO', 'CANCELADO'],
  //               },
  //             },
  //           },
  //         },
  //       },
  //       include: {
  //         prioridade: true,
  //         movimentos: {
  //           orderBy: { createdAt: 'desc' },
  //           take: 1,
  //         },
  //       },
  //     });

  //     const notificacoes = [];
  //     const agora = new Date();

  //     for (const chamado of chamadosAtrasados) {
  //       const tempoResolucao = chamado.prioridade.tempo;
  //       const diasPassados = Math.floor(
  //         (agora.getTime() - chamado.createdAt.getTime()) / (1000 * 60 * 60 * 24),
  //       );
  //       const diasPrevistos = Math.floor(
  //         tempoResolucao.getTime() / (1000 * 60 * 60 * 24),
  //       );

  //       if (diasPassados > diasPrevistos) {
  //         notificacoes.push(
  //           this.criarNotificacao({
  //             chamadoId: Number(chamado.id),
  //             usuarioId: Number(chamado.usuarioId),
  //             tipo: 'ATRASO',
  //             titulo: 'Chamado Atrasado',
  //             mensagem: `O chamado #${chamado.id} está atrasado em ${
  //               diasPassados - diasPrevistos
  //             } dias.`,
  //           }),
  //         );
  //       }
  //     }

  //     return Promise.all(notificacoes);
  //   }

  /**
   * Notifica sobre novos movimentos em um chamado
   */
  //   async notificarNovoMovimento(movimentoId: bigint) {
  //     const movimento = await this.prisma.chamadoMovimento.findUnique({
  //       where: { id: movimentoId },
  //       include: {
  //         chamado: true,
  //         etapa: true,
  //       },
  //     });

  //     if (!movimento) return null;

  //     return this.criarNotificacao({
  //       chamadoId: Number(movimento.chamadoId),
  //       usuarioId: Number(movimento.chamado.usuarioId),
  //       tipo: 'MOVIMENTO',
  //       titulo: 'Novo Movimento',
  //       mensagem: `O chamado #${movimento.chamadoId} teve um novo movimento: ${movimento.etapa.descricao}`,
  //     });
  //   }

  //   /**
  //    * Notifica sobre novas mensagens em um movimento
  //    */
  //   async notificarNovaMensagem(mensagemId: bigint) {
  //     const mensagem = await this.prisma.chamadoMovimentoMensagem.findUnique({
  //       where: { id: mensagemId },
  //       include: {
  //         movimento: {
  //           include: {
  //             chamado: true,
  //           },
  //         },
  //       },
  //     });

  //     if (!mensagem) return null;

  //     return this.criarNotificacao({
  //       chamadoId: Number(mensagem.movimento.chamadoId),
  //       usuarioId: Number(mensagem.usuarioLeituraId),
  //       tipo: 'MENSAGEM',
  //       titulo: 'Nova Mensagem',
  //       mensagem: `Você recebeu uma nova mensagem no chamado #${mensagem.movimento.chamadoId}`,
  //     });
  //   }
}
