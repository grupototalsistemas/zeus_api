export const FornecedorExamples = {
  list: {
    summary: 'Criar Fornecedores a partir de uma Lista de Forncedores',
    value: [
      {
        id_pessoa_juridica_empresa: 4,
        codigo: '123',
        id_pessoa_fisica_responsavel: 0,
        cnpj: '12.345.678/0001-90',
        razao_social: 'Empresa Exemplo LTDA',
        nome_fantasia: 'Exemplo',
        insc_estadual: '123456789',
        insc_municipal: '123456789',
        filial_principal: 1,
      },
      {
        id_pessoa_juridica_empresa: 4,
        codigo: '123',
        id_pessoa_fisica_responsavel: 0,
        cnpj: '12.345.678/0001-90',
        razao_social: 'Empresa Exemplo LTDA',
        nome_fantasia: 'Exemplo',
        insc_estadual: '123456789',
        insc_municipal: '123456789',
        filial_principal: 1,
      },
    ],
  },
  simple: {
    summary: 'Cria um novo Fornecedor',
    value: [
      {
        id_pessoa_juridica_empresa: 4,
        codigo: '123',
        id_pessoa_fisica_responsavel: 0,
        cnpj: '12.345.678/0001-90',
        razao_social: 'Empresa Exemplo LTDA',
        nome_fantasia: 'Exemplo',
        insc_estadual: '123456789',
        insc_municipal: '123456789',
        filial_principal: 1,
      },
    ],
  },
  comContato: {
    summary: 'Cria novo Fornecedor com Contato',
    value: [
      {
        id_pessoa_juridica_empresa: 4,
        codigo: '123',
        id_pessoa_fisica_responsavel: 0,
        cnpj: '12.345.678/0001-90',
        razao_social: 'Empresa Exemplo LTDA',
        nome_fantasia: 'Exemplo',
        insc_estadual: '123456789',
        insc_municipal: '123456789',
        filial_principal: 1,
        contato: [
          {
            id_pessoa_contato_tipo: 1,
            descricao: 'maria.oliveira@empresa.com',
          },
          {
            id_pessoa_contato_tipo: 2,
            descricao: '11988887777',
          },
        ],
      },
    ],
  },
  comEndereco: {
    summary: 'Cria novo Fornecedor com Endereço',
    value: [
      {
        id_pessoa_juridica_empresa: 4,
        codigo: '123',
        id_pessoa_fisica_responsavel: 0,
        cnpj: '12.345.678/0001-90',
        razao_social: 'Empresa Exemplo LTDA',
        nome_fantasia: 'Exemplo',
        insc_estadual: '123456789',
        insc_municipal: '123456789',
        filial_principal: 1,
        endereco: [
          {
            id_pessoa_endereco_tipo: 1,
            logradouro: 'Rua das Acácias',
            endereco: 'Residencial',
            numero: '456',
            complemento: 'Casa 2',
            bairro: 'Jardim Paulista',
            municipio: 'São Paulo',
            municipio_ibge: '3550308',
            estado: 'SP',
            cep: '01408-000',
          },
        ],
      },
    ],
  },
  comAdicional: {
    summary: 'Cria novo Fornecedor com Dados Adicionais',
    value: [
      {
        id_pessoa_juridica_empresa: 4,
        codigo: '123',
        id_pessoa_fisica_responsavel: 0,
        cnpj: '12.345.678/0001-90',
        razao_social: 'Empresa Exemplo LTDA',
        nome_fantasia: 'Exemplo',
        insc_estadual: '123456789',
        insc_municipal: '123456789',
        filial_principal: 1,
        adicional: [
          {
            id_pessoa_dado_adicional_tipo: 1,
            descricao: 'Fone',
          },
          {
            id_pessoa_dado_adicional_tipo: 2,
            descricao: 'IE',
          },
        ],
      },
    ],
  },
  comContatoEnderecoAdicional: {
    summary: 'Cria novo Fornecedor com Contato, Endereço e Adicionais',
    value: [
      {
        id_pessoa_juridica_empresa: 4,
        codigo: '123',
        id_pessoa_fisica_responsavel: 0,
        cnpj: '12.345.678/0001-90',
        razao_social: 'Empresa Exemplo LTDA',
        nome_fantasia: 'Exemplo',
        insc_estadual: '123456789',
        insc_municipal: '123456789',
        filial_principal: 1,
        endereco: [
          {
            id_pessoa_endereco_tipo: 1,
            logradouro: 'Rua das Acácias',
            endereco: 'Residencial',
            numero: '456',
            complemento: 'Casa 2',
            bairro: 'Jardim Paulista',
            municipio: 'São Paulo',
            municipio_ibge: '3550308',
            estado: 'SP',
            cep: '01408-000',
          },
        ],
        contato: [
          {
            id_pessoa_contato_tipo: 1,
            descricao: 'maria.oliveira@empresa.com',
          },
          {
            id_pessoa_contato_tipo: 2,
            descricao: '11988887777',
          },
        ],
        adicional: [
          {
            id_pessoa_dado_adicional_tipo: 1,
            descricao: 'Fone',
          },
          {
            id_pessoa_dado_adicional_tipo: 2,
            descricao: 'IE',
          },
        ],
      },
    ],
  },
};
