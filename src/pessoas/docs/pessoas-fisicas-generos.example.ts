export const generosExample = {
  create: {
    'Criar Gêneros': {
      summary: 'Exemplo de criação de gêneros',
      description: 'Exemplo de como criar novos gêneros para pessoas físicas',
      value: [
        {
          genero: 'Masculino',
          descricao: 'Pessoa que se identifica como masculino'
        },
        {
          genero: 'Feminino',
          descricao: 'Pessoa que se identifica como feminino'
        },
        {
          genero: 'Não-binário',
          descricao: 'Pessoa que não se identifica exclusivamente como masculino ou feminino'
        },
        {
          genero: 'Outro',
          descricao: 'Pessoa que se identifica de outra forma'
        }
      ]
    }
  },
  update: {
    'Atualizar Gênero': {
      summary: 'Exemplo de atualização de gênero',
      description: 'Exemplo de como atualizar um gênero existente',
      value: {
        genero: 'Prefiro não informar',
        descricao: 'Pessoa que prefere não informar seu gênero'
      }
    }
  },
  delete: {
    'Excluir Gênero': {
      summary: 'Exemplo de exclusão de gênero',
      description: 'Exemplo de como excluir um gênero',
      value: {
        id: 1,
        situacao: 0,
        motivo: 'Gênero não utilizado mais'
      }
    }
  }
};