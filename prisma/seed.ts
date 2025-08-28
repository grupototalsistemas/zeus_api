import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criar empresas
  const empresa = await prisma.empresa.create({
    data: {
      cnpj: '12.345.678/0001-90',
      razaoSocial: 'Empresa Exemplo LTDA',
      nomeFantasia: 'Exemplo',
      tipoId: 1, // Supondo que você tenha um tipo de empresa com ID 1
      categoriaId: 1, // Supondo que você tenha uma categoria de empresa com ID 1
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Criar tipos de empresa
  const tipoEmpresa = await prisma.empresaTipo.create({
    data: {
      empresaId: empresa.id,
      descricao: 'Tipo Exemplo',
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Criar categorias de empresa
  const categoriaEmpresa = await prisma.empresaCategoria.create({
    data: {
      empresaId: empresa.id,
      descricao: 'Categoria Exemplo',
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Criar sistemas
  const sistema = await prisma.sistema.create({
    data: {
      empresaId: empresa.id,
      nome: 'Sistema Exemplo',
      descricao: 'Descrição do Sistema Exemplo',
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Criar pessoas
  const pessoa = await prisma.pessoa.create({
    data: {
      empresaId: empresa.id,
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
      empresaId: empresa.id,
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
      empresaId: empresa.id,
      descricao: 'Ocorrência Exemplo',
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const ocorrencia = await prisma.ocorrencia.create({
    data: {
      tipoId: ocorrenciaTipo.id,
      empresaId: empresa.id,
      descricao: 'Descrição da Ocorrência Exemplo',
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Criar chamados
  const chamado = await prisma.chamado.create({
    data: {
      empresaId: empresa.id,
      sistemaId: sistema.id,
      pessoaId: pessoa.id,
      usuarioId: 1, // Supondo que você tenha um usuário com ID 1
      prioridadeId: prioridade.id,
      ocorrenciaId: ocorrencia.id,
      protocolo: "12345", // Exemplo de protocolo
      titulo: 'Título do Chamado Exemplo',
      descricao: 'Descrição do Chamado Exemplo',
      observacao: 'Observação do Chamado Exemplo',
      ativo: 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log({
    empresa,
    tipoEmpresa,
    categoriaEmpresa,
    sistema,
    pessoa,
    prioridade,
    ocorrenciaTipo,
    ocorrencia,
    chamado,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
