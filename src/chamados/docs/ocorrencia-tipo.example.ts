export const ocorrenciaTipoExample = {
  create: {
    'Criar Ocorrencia Tipo': {
      summary: 'Exemplo de criacao de tipo de ocorrencia',
      description: 'Exemplo de como criar um tipo de ocorrencia',
      value: {
        id_pessoa_juridica: 1,
        descricao: 'Falha de sistema',
        situacao: 1,
        motivo: 'Padronizacao dos tipos de ocorrencia',
      },
    },
  },
  update: {
    'Atualizar Ocorrencia Tipo': {
      summary: 'Exemplo de atualizacao de tipo de ocorrencia',
      description: 'Exemplo de como atualizar um tipo de ocorrencia',
      value: {
        descricao: 'Falha intermitente de sistema',
        motivo: 'Ajuste de descricao para melhor categorizacao',
      },
    },
  },
  delete: {
    'Excluir Ocorrencia Tipo': {
      summary: 'Exemplo de exclusao de tipo de ocorrencia',
      description: 'Exemplo de como desativar um tipo de ocorrencia',
      value: {
        motivo: 'Tipo desativado por consolidacao',
      },
    },
  },
};
