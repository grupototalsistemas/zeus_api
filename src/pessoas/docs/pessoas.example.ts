export const pessoaExample = {
  exemploCompleto: {
    summary:
      'Exemplo completo de cadastro com Pessoa Jurídica e Físicas associadas',
    value: {
      pessoas: [
        {
          pessoa: 1,
          id_pessoa_tipo: 2,
          id_pessoa_origem: 1,
          codigo: 'PJ001',
          situacao: 1,
          juridica: {
            cnpj: '12345678000190',
            razao_social: 'Tech Solutions LTDA',
            nome_fantasia: 'TechSol',
            id_pessoa_fisica_responsavel: 2,
            insc_estadual: '123456789',
            insc_municipal: '987654321',
            motivo: 'Desenvolvimento de Software',
          },
          enderecos: [
            {
              id_pessoa_endereco_tipo: 1,
              logradouro: 'Avenida Paulista',
              endereco: 'Edifício Tech Tower',
              numero: '1000',
              complemento: 'Sala 1501',
              bairro: 'Bela Vista',
              municipio: 'São Paulo',
              municipio_ibge: '3550308',
              estado: 'SP',
              cep: '01310900',
            },
            {
              id_pessoa_endereco_tipo: 2,
              logradouro: 'Rua Faria Lima',
              endereco: 'Condomínio Corporate',
              numero: '2500',
              complemento: 'Bloco B, Andar 8',
              bairro: 'Itaim Bibi',
              municipio: 'São Paulo',
              municipio_ibge: '3550308',
              estado: 'SP',
              cep: '04538002',
            },
          ],
          contatos: [
            {
              id_pessoa_contato_tipo: 1,
              descricao: 'contato@techsol.com.br',
            },
            { id_pessoa_contato_tipo: 2, descricao: '1133334444' },
            { id_pessoa_contato_tipo: 2, descricao: '1133334445' },
          ],
          dados_adicionais: [
            {
              id_pessoa_dado_adicional_tipo: 1,
              descricao: 'Empresa focada em desenvolvimento de software',
            },
            {
              id_pessoa_dado_adicional_tipo: 2,
              descricao: 'Fundada em 2010',
            },
          ],
          pessoas_fisicas: [
            {
              pessoa: 2,
              id_pessoa_tipo: 1,
              id_pessoa_origem: 1,
              codigo: 'PF001',
              situacao: 1,
              fisica: {
                cpf: '12345678909',
                nome_registro: 'Carlos Eduardo Mendonça',
                nome_social: 'Carlos',
                id_pessoa_genero: 1,
                id_pessoa_estado_civil: 2,
                cpf_justificativa: 0,
                doc_numero: 'MG12345678',
                doc_emissor: 'SSP-MG',
                doc_data_emissao: '2015-03-15',
                nacionalidade: 'Brasileira',
                naturalidade: 'Belo Horizonte',
                data_nascimento: '1985-08-20',
              },
              enderecos: [
                {
                  id_pessoa_endereco_tipo: 1,
                  logradouro: 'Rua das Acácias',
                  endereco: 'Residencial',
                  numero: '250',
                  complemento: 'Casa 2',
                  bairro: 'Jardim Paulista',
                  municipio: 'São Paulo',
                  municipio_ibge: '3550308',
                  estado: 'SP',
                  cep: '01408000',
                },
              ],
              contatos: [
                {
                  id_pessoa_contato_tipo: 1,
                  descricao: 'carlos@techsol.com.br',
                },
                {
                  id_pessoa_contato_tipo: 2,
                  descricao: '11988887777',
                },
              ],
              dados_adicionais: [
                {
                  id_pessoa_dado_adicional_tipo: 1,
                  descricao: 'Diretor de Tecnologia',
                },
              ],
            },
          ],
        },
        {
          pessoa: 4,
          id_pessoa_tipo: 2,
          id_pessoa_origem: 2,
          codigo: 'PJ002',
          situacao: 1,
          juridica: {
            cnpj: '98765432000110',
            razao_social: 'Comércio Import Export S/A',
            nome_fantasia: 'ImportCom',
            id_pessoa_fisica_responsavel: 5,
            insc_estadual: '987654321',
            insc_municipal: '123987456',
            motivo: 'Comércio Internacional',
          },
        },
      ],
    },
  },
};
