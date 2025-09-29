// src/entities/empresa.entity.ts

import { ChamadoMovimentoEtapa } from 'src/chamados/entities/chamado-movimento-etapa.entity';
import { Chamado } from 'src/chamados/entities/chamado.entity';
import { OcorrenciaTipo } from 'src/chamados/entities/ocorrencia-tipo.entity';
import { Ocorrencia } from 'src/chamados/entities/ocorrencia.entity';
import { Prioridade } from 'src/chamados/entities/prioridade.entity';
import { SiglaEstado } from 'src/common/enums/siglas-estado.enum';
import { StatusRegistro } from 'src/common/enums/status-registro.enum';
import { Perfil } from 'src/pessoas/entities/perfil.entity';
import { PessoaTipo } from 'src/pessoas/entities/pessoa-tipo.entity';
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import { EmpresaCategoria } from './empresa-categoria.entity';
import { EmpresaSistema } from './empresa-sistema.entity';
import { Sistema } from './sistema.entity';

export class Empresa {
  id: bigint;
  parentId: bigint;
  tipoId: bigint;
  categoriaId: bigint;
  cnpj: string;
  codigo?: string;
  razaoSocial: string;
  nomeFantasia: string;
  logradouro?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: SiglaEstado;
  cep?: string;
  contato?: string;
  email?: string;
  observacao?: string;
  ativo: StatusRegistro;
  motivo?: string;
  createdAt: Date;
  updatedAt?: Date;

  // Relations
  chamados?: Chamado[];
  chamadosMovimentos?: ChamadoMovimentoEtapa[];
  categorias?: EmpresaCategoria[];
  empresaSistemas?: EmpresaSistema[];
  ocorrencias?: Ocorrencia[];
  ocorrenciasTipos?: OcorrenciaTipo[];
  perfis?: Perfil[];
  pessoas?: Pessoa[];
  pessoasTipos?: PessoaTipo[];
  prioridades?: Prioridade[];
  sistemas?: Sistema[];
}
