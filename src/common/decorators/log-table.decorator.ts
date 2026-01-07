import { SetMetadata } from '@nestjs/common';

export const LOG_TABLE_KEY = 'log-table';

export interface LogTableMetadata {
  tableName: string;
  idField?: string;
  priority?: number; // Para casos onde há múltiplas tabelas, define qual é a principal
}

export const LogTable = (metadata: LogTableMetadata) =>
  SetMetadata(LOG_TABLE_KEY, metadata);

// Decorators de conveniência para tabelas específicas
export const LogTableLancamentos = (priority = 1) =>
  LogTable({ tableName: 'lancamentos', idField: 'id_lancamento', priority });

export const LogTableCartorios = (priority = 1) =>
  LogTable({ tableName: 'cartorios', idField: 'id_cartorio', priority });

export const LogTablePessoas = (priority = 1) =>
  LogTable({
    tableName: 'pessoas_fisicas',
    idField: 'id_pessoa_fisica',
    priority,
  });

export const LogTableCentroCusto = (priority = 1) =>
  LogTable({
    tableName: 'centro_custos',
    idField: 'id_centro_custo',
    priority,
  });

export const LogTableContasBancarias = (priority = 1) =>
  LogTable({
    tableName: 'contas_bancarias',
    idField: 'id_conta_bancaria',
    priority,
  });

export const LogTablePlanoContas = (priority = 1) =>
  LogTable({ tableName: 'plano_contas', idField: 'id_plano_conta', priority });

export const LogTableModulos = (priority = 1) =>
  LogTable({ tableName: 'modulos', idField: 'id_modulo', priority });

export const LogTableSistemas = (priority = 1) =>
  LogTable({ tableName: 'sistemas', idField: 'id_sistema', priority });
