export const estadosCivisExample = {
  create: {
    'Criar Estados Civis': {
      summary: 'Exemplo de criação de estados civis',
      description: 'Exemplo de como criar novos estados civis para pessoas físicas',
      value: [
        {
          descricao: 'Solteiro(a)'
        },
        {
          descricao: 'Casado(a)'
        },
        {
          descricao: 'Divorciado(a)'
        },
        {
          descricao: 'Viúvo(a)'
        },
        {
          descricao: 'União Estável'
        }
      ]
    }
  },
  update: {
    'Atualizar Estado Civil': {
      summary: 'Exemplo de atualização de estado civil',
      description: 'Exemplo de como atualizar um estado civil existente',
      value: {
        descricao: 'Separado(a) Judicialmente'
      }
    }
  },
  delete: {
    'Excluir Estado Civil': {
      summary: 'Exemplo de exclusão de estado civil',
      description: 'Exemplo de como excluir um estado civil',
      value: {
        id: 1,
        situacao: 0,
        motivo: 'Estado civil não utilizado mais'
      }
    }
  }
};