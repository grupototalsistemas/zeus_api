export const PessoaEnderecoExamples = {
  create: {
    summary: 'Criar endereco para uma pessoa',
    value: {
      id_pessoa: '1',
      id_pessoa_endereco_tipo: '2',
      logradouro: 'Rua',
      endereco: 'das Flores',
      numero: '123',
      complemento: 'Apto 101',
      bairro: 'Centro',
      municipio: 'Niteroi',
      municipio_ibge: '3303302',
      estado: 'RJ',
      cep: '24020-040',
    },
  },
  update: {
    summary: 'Atualizar dados basicos do endereco',
    value: {
      logradouro: 'Avenida',
      endereco: 'Presidente Vargas',
      numero: '2000',
      complemento: 'Sala 501',
      bairro: 'Centro',
      municipio: 'Rio de Janeiro',
      estado: 'RJ',
      cep: '20010-030',
    },
  },
};
