export const ocorrenciaExample = {
  create: {
    'Criar Ocorrencia': {
      summary: 'Exemplo de criacao de ocorrencia',
      description: 'Exemplo de como criar uma ocorrencia para chamados',
      value: {
        id_ocorrencia_tipo: 1,
        id_pessoa_juridica: 1,
        descricao: 'Erro no processamento de pagamento',
        situacao: 1,
        motivo: 'Ocorrencia registrada para analise',
      },
    },
  },
  update: {
    'Atualizar Ocorrencia': {
      summary: 'Exemplo de atualizacao de ocorrencia',
      description: 'Exemplo de como atualizar uma ocorrencia existente',
      value: {
        descricao: 'Erro intermitente no processamento de pagamento',
        motivo: 'Atualizacao da descricao apos validacao',
      },
    },
  },
  delete: {
    'Excluir Ocorrencia': {
      summary: 'Exemplo de exclusao de ocorrencia',
      description: 'Exemplo de como desativar uma ocorrencia',
      value: {
        motivo: 'Ocorrencia desativada por padronizacao',
      },
    },
  },
};
