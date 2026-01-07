export const sistemasModulosExamples = {
  create: {
    summary: 'Criar múltiplos vínculos entre sistemas e módulos',
    description:
      'Exemplo de requisição para vincular múltiplos módulos a sistemas',
    value: {
      modulos: [
        {
          id_sistema: 1,
          id_modulo_principal: 1,
        },
        {
          id_sistema: 1,
          id_modulo_principal: 2,
        },
        {
          id_sistema: 1,
          id_modulo_principal: 3,
        },
      ],
    },
  },
  createResponse: {
    summary: 'Resposta de criação bem-sucedida',
    description: 'Exemplo de resposta ao criar vínculos',
    value: {
      message: '3 vínculo(s) criado(s) com sucesso',
      sucessos: 3,
      falhas: 0,
      data: [
        {
          id: 1,
          id_sistema: 1,
          id_modulo_principal: 1,
          situacao: 1,
          motivo: null,
          created_at: '2024-01-01T10:00:00.000Z',
          sistema: {
            id: 1,
            sistema: 'Sistema Principal',
            descricao: 'Sistema de gestão principal',
          },
          modulo: {
            id: 1,
            component_name: 'usuarios',
            component_text: 'Usuários',
          },
        },
        {
          id: 2,
          id_sistema: 1,
          id_modulo_principal: 2,
          situacao: 1,
          motivo: null,
          created_at: '2024-01-01T10:00:01.000Z',
          sistema: {
            id: 1,
            sistema: 'Sistema Principal',
            descricao: 'Sistema de gestão principal',
          },
          modulo: {
            id: 2,
            component_name: 'perfis',
            component_text: 'Perfis',
          },
        },
      ],
    },
  },
  findAll: {
    summary: 'Listar todos os vínculos',
    description: 'Exemplo de resposta ao listar vínculos',
    value: [
      {
        id: 1,
        id_sistema: 1,
        id_modulo_principal: 1,
        situacao: 1,
        motivo: null,
        created_at: '2024-01-01T10:00:00.000Z',
        updated_at: null,
        sistema: {
          id: 1,
          sistema: 'Sistema Principal',
          descricao: 'Sistema de gestão principal',
          status_web: 1,
        },
        modulo: {
          id: 1,
          component_name: 'usuarios',
          component_text: 'Usuários',
          component_index: '1.1',
        },
      },
    ],
  },
  update: {
    summary: 'Atualizar vínculo',
    description: 'Exemplo de requisição para atualizar um vínculo',
    value: {
      id_modulo_principal: 3,
      situacao: 1,
      motivo: 'Módulo atualizado',
    },
  },
  delete: {
    summary: 'Remover vínculo',
    description:
      'Exemplo de requisição para remover um vínculo (exclusão lógica)',
    value: {
      motivo: 'Módulo não será mais utilizado neste sistema',
    },
  },
  deleteResponse: {
    summary: 'Resposta de remoção bem-sucedida',
    description: 'Exemplo de resposta ao remover um vínculo',
    value: {
      message: 'Vínculo removido com sucesso (exclusão lógica)',
      data: {
        id: 1,
        situacao: 0,
        motivo: 'Módulo não será mais utilizado neste sistema',
        updated_at: '2024-01-01T10:30:00.000Z',
      },
    },
  },
};
