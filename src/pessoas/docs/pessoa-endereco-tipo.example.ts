export const PessoaEnderecoTipoExamples = {
  create: {
    summary: 'Criar tipo de endereco para uma pessoa',
    value: {
      id_pessoa: '1',
      descricao: 'Residencial',
      situacao: 1,
    },
  },
  update: {
    summary: 'Atualizar descricao ou situacao do tipo',
    value: {
      descricao: 'Comercial',
      situacao: 1,
      motivo: 'Atualizacao de cadastro',
    },
  },
};
