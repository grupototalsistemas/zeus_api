export const funcionarioExample = {
  'Atualizar Dados Básicos': {
    summary: 'Atualizar dados básicos do funcionário',
    value: {
      codigo: 'FUNC001_ATUALIZADO',
      situacao: 1,
      pessoa_fisica: {
        nome_registro: 'João Silva Santos Atualizado',
        nome_social: 'João Atualizado',
        id_pessoa_genero: 1,
        id_pessoa_estado_civil: 2,
        data_nascimento: '1990-01-01',
        nacionalidade: 'Brasileira',
        naturalidade: 'São Paulo',
      },
    },
  },
  'Atualizar Documentos': {
    summary: 'Atualizar documentos oficiais',
    value: {
      pessoa_fisica: {
        doc_numero: 'MG98765432',
        doc_emissor: 'SSP-MG ATUALIZADO',
        doc_data_emissao: '2024-01-15',
        cpf_justificativa: 0,
      },
    },
  },
  'Atualizar Endereços': {
    summary: 'Atualizar todos os endereços',
    value: {
      enderecos: [
        {
          id_pessoa_endereco_tipo: 1,
          logradouro: 'Rua das Flores',
          endereco: 'Residencial',
          numero: '123',
          complemento: 'Apto 45',
          bairro: 'Centro',
          municipio: 'São Paulo',
          municipio_ibge: '3550308',
          estado: 'SP',
          cep: '01234-567',
        },
        {
          id_pessoa_endereco_tipo: 2,
          logradouro: 'Avenida Paulista',
          endereco: 'Comercial',
          numero: '1000',
          complemento: 'Sala 501',
          bairro: 'Bela Vista',
          municipio: 'São Paulo',
          municipio_ibge: '3550308',
          estado: 'SP',
          cep: '01310-100',
        },
      ],
    },
  },
  'Atualizar Contatos': {
    summary: 'Atualizar todos os contatos',
    value: {
      contatos: [
        {
          id_pessoa_contato_tipo: 1,
          descricao: 'novo.email@empresa.com',
        },
        {
          id_pessoa_contato_tipo: 2,
          descricao: '11999998888',
        },
        {
          id_pessoa_contato_tipo: 3,
          descricao: '1133334444',
        },
      ],
    },
  },
  'Atualizar Dados Adicionais': {
    summary: 'Atualizar dados adicionais',
    value: {
      dados_adicionais: [
        {
          id_pessoa_dado_adicional_tipo: 1,
          descricao: 'Possui certificação em Java',
        },
        {
          id_pessoa_dado_adicional_tipo: 2,
          descricao: 'Fluente em inglês',
        },
        {
          id_pessoa_dado_adicional_tipo: 3,
          descricao: 'Disponível para viagens',
        },
      ],
    },
  },
  'Atualização Completa': {
    summary: 'Atualizar múltiplas informações juntas',
    value: {
      id_pessoa_juridica: 10,
      pessoa: 0,
      id_pessoa_tipo: 6,
      id_pessoa_origem: 2,
      codigo: 'FUNC001_COMPLETO',
      situacao: 1,
      pessoa_fisica: {
        cpf: '12345678909',
        nome_registro: 'João Silva Santos Completo',
        nome_social: 'João Completo',
        id_pessoa_genero: 1,
        id_pessoa_estado_civil: 2,
        doc_numero: 'MG99999999',
        doc_emissor: 'SSP-MG',
        doc_data_emissao: '2024-01-20',
        nacionalidade: 'Brasileira',
        naturalidade: 'São Paulo',
        data_nascimento: '1990-01-01',
        cpf_justificativa: 1,
      },
      enderecos: [
        {
          id_pessoa_endereco_tipo: 1,
          logradouro: 'Rua Nova',
          endereco: 'Residencial',
          numero: '100',
          complemento: 'Casa 2',
          bairro: 'Jardim Paulista',
          municipio: 'São Paulo',
          municipio_ibge: '3550308',
          estado: 'SP',
          cep: '01415-000',
        },
        {
          id_pessoa_endereco_tipo: 1,
          logradouro: 'Niteroi',
          endereco: 'Residencial',
          numero: '10',
          complemento: 'rua branco',
          bairro: 'Avenida Paulista',
          municipio: 'São Paulo',
          municipio_ibge: '35505454',
          estado: 'SP',
          cep: '01310-100',
        },
      ],
      contatos: [
        {
          id_pessoa_contato_tipo: 1,
          descricao: 'email.atualizado@empresa.com',
        },
        {
          id_pessoa_contato_tipo: 2,
          descricao: '11988887777',
        },
        {
          id_pessoa_contato_tipo: 3,
          descricao: '2233352555',
        },
      ],
      dados_adicionais: [
        {
          id_pessoa_dado_adicional_tipo: 1,
          descricao: 'DEV JAVA',
        },
        {
          id_pessoa_dado_adicional_tipo: 2,
          descricao: 'DESENVOLVEDOR SENIOR',
        },
        {
          id_pessoa_dado_adicional_tipo: 1,
          descricao: 'TI',
        },
      ],
    },
  },
  'Atualizar Apenas um Campo': {
    summary: 'Atualizar apenas um campo específico',
    value: {
      pessoa_fisica: {
        nome_social: 'João',
      },
    },
  },
  'Remover Endereços': {
    summary: 'Remover todos os endereços (array vazio)',
    value: {
      enderecos: [],
    },
  },
  'Remover Contatos': {
    summary: 'Remover todos os contatos (array vazio)',
    value: {
      contatos: [],
    },
  },
  'Remover Dados Adicionais': {
    summary: 'Remover todos os dados adicionais (array vazio)',
    value: {
      dados_adicionais: [],
    },
  },
  'Atualizar Situação': {
    summary: 'Apenas alterar situação do funcionário',
    value: {
      situacao: 0,
    },
  },
  'Atualizar Código': {
    summary: 'Apenas alterar código do funcionário',
    value: {
      codigo: 'FUNC001_NOVO',
    },
  },
};

export const removeFuncionarioExample = {
  Demissão: {
    summary: 'Demissão por justa causa',
    value: {
      motivo: 'Demissão por justa causa',
    },
  },
  'Pedido de Demissão': {
    summary: 'Pedido de demissão voluntária',
    value: {
      motivo: 'Pedido de demissão voluntária',
    },
  },
  'Término de Contrato': {
    summary: 'Término do contrato de experiência',
    value: {
      motivo: 'Término do contrato de experiência',
    },
  },
  'Redução de Quadro': {
    summary: 'Redução de quadro de funcionários',
    value: {
      motivo: 'Redução de quadro de funcionários',
    },
  },
  Aposentadoria: {
    summary: 'Aposentadoria do funcionário',
    value: {
      motivo: 'Aposentadoria',
    },
  },
  'Outros Motivos': {
    summary: 'Outros motivos administrativos',
    value: {
      motivo: 'Motivos administrativos diversos',
    },
  },
};
