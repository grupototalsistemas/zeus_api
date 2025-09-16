import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📂 Lendo arquivo Excel...');

  // const workbook = xlsx.readFile('data/EMPRESAS.xlsx');
  // const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // const rows: any[] = xlsx.utils.sheet_to_json(sheet);

  // console.log(`📊 Total de registros encontrados: ${rows.length}`);

  // for (const row of rows) {
  //   try {
  //     await prisma.empresa.create({
  //       data: {
  //         parentId: Number(row.ID_PARENT_EMPRESA) ?? -1,
  //         tipoId: Number(row.ID_EMPRESA_TIPO),
  //         categoriaId: Number(row.ID_EMPRESA_CATEGORIA),
  //         cnpj: String(row.CNPJ),
  //         codigo: row.CODIGO ? String(row.CODIGO) : null,
  //         razaoSocial: String(row.RAZAO_SOCIAL),
  //         nomeFantasia: String(row.NOME_FANTASIA),
  //         logradouro: row.LOGRADOURO ?? null,
  //         endereco: row.ENDERECO ?? null,
  //         numero: row.NUMERO ? String(row.NUMERO) : null,
  //         complemento: row.COMPLEMENTO ?? null,
  //         bairro: row.BAIRRO ?? null,
  //         cidade: row.CIDADE ?? null,
  //         estado: row.ESTADO ?? null,
  //         cep: row.CEP ? String(row.CEP) : null,
  //         contato: row.RESPONSAVEL ?? row.CONTATO ?? null,
  //         email: row.EMAIL ?? null,
  //         observacao: row.OBSERVACAO ?? null,
  //         ativo: row.BLOQUEADO === 1 ? 'INATIVO' : 'ATIVO',
  //         motivo: null,
  //       },
  //     });

  //     console.log(`✅ Empresa inserida: ${row.RAZAO_SOCIAL}`);
  //   } catch (error: any) {
  //     console.error(
  //       `❌ Erro ao inserir empresa ${row.RAZAO_SOCIAL}: ${error.message}`,
  //     );
  //   }
  // }

  const sistema = await prisma.sistema.create({
    data: {
      empresaId: 1,
      nome: 'Sistema Exemplo',
      descricao: 'Descrição do Sistema Exemplo',
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const tipoPessoa = await prisma.pessoaTipo.create({
    data: {
      empresaId: 1,
      descricao: 'Funcionario',
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  // Criar pessoas
  const pessoa = await prisma.pessoa.create({
    data: {
      empresaId: 1,
      tipoId: 1, // Supondo que você tenha um tipo de pessoa com ID 1
      genero: 'MASCULINO',
      nome: 'João da Silva',
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Criar prioridades
  const prioridade = await prisma.prioridade.create({
    data: {
      empresaId: 1,
      descricao: 'Alta',
      cor: 'Red',
      tempo: 24,
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Criar ocorrências
  const ocorrenciaTipo = await prisma.ocorrenciaTipo.create({
    data: {
      empresaId: 1,
      descricao: 'Ocorrência Exemplo',
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const ocorrencia = await prisma.ocorrencia.create({
    data: {
      tipoId: ocorrenciaTipo.id,
      empresaId: 1,
      descricao: 'Descrição da Ocorrência Exemplo',
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Criar chamados
  const chamado = await prisma.chamado.create({
    data: {
      empresaId: 1,
      sistemaId: sistema.id,
      pessoaId: pessoa.id,
      usuarioId: 1, // Supondo que você tenha um usuário com ID 1
      prioridadeId: prioridade.id,
      ocorrenciaId: ocorrencia.id,
      protocolo: '12345', // Exemplo de protocolo
      titulo: 'Título do Chamado Exemplo',
      descricao: 'Descrição do Chamado Exemplo',
      observacao: 'Observação do Chamado Exemplo',
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log({
    sistema,
    pessoa,
    prioridade,
    ocorrenciaTipo,
    ocorrencia,
    chamado,
    tipoPessoa,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
