export const cartorioExamples = {
  'Cadastro Completo de Cartório': {
    summary: 'Cadastro completo de um cartório com todos os dados',
    value: {
      codigo: 'CART001',
      pessoa_juridica: {
        cnpj: '12.345.678/0001-90',
        razao_social: 'CARTÓRIO DO 1º OFÍCIO DE REGISTRO DE IMÓVEIS',
        nome_fantasia: '1º Ofício de Imóveis',
        insc_estadual: '123456789',
        insc_municipal: '987654321',
        filial_principal: 1,
        enderecos: [
          {
            id_pessoa_endereco_tipo: 1,
            logradouro: 'Rua',
            endereco: 'Visconde de Sepetiba',
            numero: '987',
            complemento: 'Sala 201',
            bairro: 'Centro',
            municipio: 'Niterói',
            municipio_ibge: '3303302',
            estado: 'RJ',
            cep: '24020-040',
          },
        ],
        contatos: [
          {
            id_pessoa_contato_tipo: 1,
            descricao: '(21) 2620-8000',
          },
          {
            id_pessoa_contato_tipo: 2,
            descricao: 'contato@1oficio.com.br',
          },
        ],
      },
      responsavel: {
        cpf: '123.456.789-00',
        nome_registro: 'José Carlos da Silva',
        nome_social: 'José Silva',
        id_pessoa_genero: 1,
        id_pessoa_estado_civil: 2,
        cpf_justificativa: 0,
        doc_numero: '12.345.678-9',
        doc_emissor: 'SSP/RJ',
        doc_data_emissao: '2010-05-15',
        nacionalidade: 'Brasileira',
        naturalidade: 'Niterói',
        data_nascimento: '1975-03-20',
        enderecos: [
          {
            id_pessoa_endereco_tipo: 1,
            logradouro: 'Rua',
            endereco: 'das Flores',
            numero: '123',
            complemento: 'Apto 301',
            bairro: 'Icaraí',
            municipio: 'Niterói',
            municipio_ibge: '3303302',
            estado: 'RJ',
            cep: '24230-150',
          },
        ],
        contatos: [
          {
            id_pessoa_contato_tipo: 1,
            descricao: '(21) 98765-4321',
          },
          {
            id_pessoa_contato_tipo: 2,
            descricao: 'jose.silva@email.com',
          },
        ],
      },
    },
  },
  'Cadastro Mínimo de Cartório': {
    summary: 'Cadastro com dados mínimos obrigatórios',
    value: {
      pessoa_juridica: {
        cnpj: '98.765.432/0001-10',
        razao_social: 'CARTÓRIO DO 2º OFÍCIO DE NOTAS',
        filial_principal: 1,
      },
      responsavel: {
        cpf: '987.654.321-00',
        nome_registro: 'Maria Aparecida Santos',
        id_pessoa_genero: 2,
        id_pessoa_estado_civil: 1,
        cpf_justificativa: 0,
      },
    },
  },
  'Cartório com Múltiplos Endereços': {
    summary: 'Cartório com endereço comercial e sede',
    value: {
      codigo: 'CART003',
      pessoa_juridica: {
        cnpj: '11.222.333/0001-44',
        razao_social: 'CARTÓRIO DE REGISTRO CIVIL DAS PESSOAS NATURAIS',
        nome_fantasia: 'Cartório Civil Central',
        filial_principal: 1,
        enderecos: [
          {
            id_pessoa_endereco_tipo: 1,
            logradouro: 'Avenida',
            endereco: 'Amaral Peixoto',
            numero: '555',
            bairro: 'Centro',
            municipio: 'Niterói',
            estado: 'RJ',
            cep: '24020-072',
          },
          {
            id_pessoa_endereco_tipo: 2,
            logradouro: 'Rua',
            endereco: 'São João',
            numero: '100',
            complemento: 'Anexo',
            bairro: 'Centro',
            municipio: 'Niterói',
            estado: 'RJ',
            cep: '24020-041',
          },
        ],
        contatos: [
          {
            id_pessoa_contato_tipo: 1,
            descricao: '(21) 2719-5000',
          },
          {
            id_pessoa_contato_tipo: 3,
            descricao: '(21) 2719-5001',
          },
          {
            id_pessoa_contato_tipo: 2,
            descricao: 'contato@cartoriocentral.com.br',
          },
        ],
      },
      responsavel: {
        cpf: '555.666.777-88',
        nome_registro: 'Ana Paula Ferreira de Souza',
        id_pessoa_genero: 2,
        id_pessoa_estado_civil: 2,
        cpf_justificativa: 0,
        doc_numero: '98.765.432-1',
        doc_emissor: 'SSP/RJ',
        doc_data_emissao: '2005-08-10',
        nacionalidade: 'Brasileira',
        naturalidade: 'Rio de Janeiro',
        data_nascimento: '1980-11-05',
        contatos: [
          {
            id_pessoa_contato_tipo: 1,
            descricao: '(21) 99876-5432',
          },
          {
            id_pessoa_contato_tipo: 2,
            descricao: 'ana.souza@email.com',
          },
        ],
      },
    },
  },
};
