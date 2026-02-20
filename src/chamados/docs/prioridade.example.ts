export const prioridadeExample = {
  create: {
    'Criar Prioridade': {
      summary: 'Exemplo de criacao de prioridade',
      description: 'Exemplo de como criar uma prioridade para chamados',
      value: {
        id_pessoa_juridica: 1,
        descricao: 'Alta',
        cor: '#FF0000',
        tempoResolucao: 240,
        situacao: 1,
        motivo: 'Criticidade alta para SLA de 4 horas',
      },
    },
  },
  update: {
    'Atualizar Prioridade': {
      summary: 'Exemplo de atualizacao de prioridade',
      description: 'Exemplo de como atualizar uma prioridade existente',
      value: {
        descricao: 'Media',
        cor: '#FFA500',
        tempoResolucao: 720,
        motivo: 'Ajuste de SLA para demandas padrao',
      },
    },
  },
  delete: {
    'Excluir Prioridade': {
      summary: 'Exemplo de exclusao de prioridade',
      description: 'Exemplo de como desativar uma prioridade',
      value: {
        motivo: 'Prioridade desativada por padronizacao',
      },
    },
  },
};
