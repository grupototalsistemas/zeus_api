export const adicionaisTiposExample = {
  list: {
    summary: 'Criar Tipos de Adicionais para Funcionários a partir de uma Lista',
    value: [
      {
        id_pessoa: 1,
        descricao: 'Observações',
        situacao: 1,
      }
    ]
  }
}

export const deleteAdicionaisTiposExample = {
  list: {
    summary: 'Excluir Tipo de Adicional para Funcionário',
    value: [
      {
        id: 1,
        id_pessoa: 1,
        motivo: 'Inatividade do funcionário'
      }
    ]
  }
}
