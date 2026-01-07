export const pessoasJuridicasPerfisExamples = {
  'Criação de Perfil Único': {
    summary: 'Criação de um único perfil',
    value: {
      id_pessoa_juridica: 1,
      descricao: 'Administrador',
      status_view: 1,
      situacao: 1,
      motivo: 'Perfil criado para controle de acesso administrativo',
    },
  },
  'Criação de Perfil Mínimo': {
    summary: 'Criação com dados mínimos obrigatórios',
    value: {
      id_pessoa_juridica: 1,
      descricao: 'Usuário',
    },
  },
  'Criação de Múltiplos Perfis': {
    summary: 'Criação de vários perfis de uma vez',
    value: {
      perfis: [
        {
          id_pessoa_juridica: 1,
          descricao: 'Administrador',
          status_view: 1,
          situacao: 1,
          motivo: 'Perfil com acesso total ao sistema',
        },
        {
          id_pessoa_juridica: 1,
          descricao: 'Gerente',
          status_view: 1,
          situacao: 1,
          motivo: 'Perfil com acesso gerencial',
        },
        {
          id_pessoa_juridica: 1,
          descricao: 'Operador',
          status_view: 1,
          situacao: 1,
          motivo: 'Perfil com acesso operacional básico',
        },
        {
          id_pessoa_juridica: 1,
          descricao: 'Consultor',
          status_view: 1,
          situacao: 1,
          motivo: 'Perfil apenas leitura',
        },
      ],
    },
  },
  'Atualização de Perfil': {
    summary: 'Atualização dos dados de um perfil',
    value: {
      descricao: 'Super Administrador',
      status_view: 1,
      situacao: 1,
      motivo: 'Perfil atualizado para refletir novas permissões',
    },
  },
  'Desativação de Perfil': {
    summary: 'Desativação de um perfil',
    value: {
      situacao: 0,
      motivo: 'Perfil desativado por reestruturação de cargos',
    },
  },
  'Exclusão de Perfil': {
    summary: 'Exclusão lógica de um perfil',
    value: {
      motivo: 'Perfil removido pois não é mais necessário',
    },
  },
  'Consulta com Filtros': {
    summary: 'Busca de perfis com filtros',
    value: {
      id_pessoa_juridica: 1,
      situacao: 1,
      status_view: 1,
    },
  },
  'Resposta de Criação Múltipla com Sucesso e Erros': {
    summary: 'Exemplo de resposta ao criar múltiplos perfis',
    value: {
      successCount: 3,
      errorCount: 1,
      totalCount: 4,
      results: [
        {
          success: true,
          data: {
            id: 1,
            id_pessoa_juridica: 1,
            descricao: 'Administrador',
            status_view: 1,
            situacao: 1,
            motivo: 'Perfil com acesso total ao sistema',
            createdAt: '2025-11-26T10:00:00.000Z',
            updatedAt: null,
          },
        },
        {
          success: true,
          data: {
            id: 2,
            id_pessoa_juridica: 1,
            descricao: 'Gerente',
            status_view: 1,
            situacao: 1,
            motivo: 'Perfil com acesso gerencial',
            createdAt: '2025-11-26T10:00:01.000Z',
            updatedAt: null,
          },
        },
        {
          success: false,
          error:
            'Perfil com descrição "Operador" já existe para esta pessoa jurídica',
          originalData: {
            id_pessoa_juridica: 1,
            descricao: 'Operador',
            status_view: 1,
            situacao: 1,
            motivo: 'Perfil com acesso operacional básico',
          },
        },
        {
          success: true,
          data: {
            id: 3,
            id_pessoa_juridica: 1,
            descricao: 'Consultor',
            status_view: 1,
            situacao: 1,
            motivo: 'Perfil apenas leitura',
            createdAt: '2025-11-26T10:00:02.000Z',
            updatedAt: null,
          },
        },
      ],
    },
  },
};
