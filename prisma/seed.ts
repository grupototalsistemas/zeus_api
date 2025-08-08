import { PrismaClient, StatusGenero, StatusRegistro } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // =========================
  // Empresa
  // =========================
  const empresa = await prisma.empresa.create({
    data: {
      parentId: BigInt(-1),
      tipoId: BigInt(1),
      categoriaId: BigInt(1),
      cnpj: '12345678000199',
      codigo: 'EMP001',
      razaoSocial: 'Empresa Teste LTDA',
      nomeFantasia: 'Empresa Teste',
      ativo: StatusRegistro.ATIVO,
    },
  });

  // =========================
  // Perfis
  // =========================
  const perfilMaster = await prisma.perfil.create({
    data: {
      empresaId: empresa.id,
      descricao: 'MASTER',
      ativo: StatusRegistro.ATIVO,
    },
  });

  const perfilSuporte = await prisma.perfil.create({
    data: {
      empresaId: empresa.id,
      descricao: 'SUPORTE',
      ativo: StatusRegistro.ATIVO,
    },
  });

  // =========================
  // PessoaTipo
  // =========================
  const pessoaTipo = await prisma.pessoaTipo.create({
    data: {
      empresaId: empresa.id,
      descricao: 'Funcionário',
      ativo: StatusRegistro.ATIVO,
    },
  });

  // =========================
  // Pessoas e Usuários
  // =========================
  const pessoaMaster = await prisma.pessoa.create({
    data: {
      empresaId: empresa.id,
      tipoId: pessoaTipo.id,
      genero: StatusGenero.MASCULINO,
      nome: 'Administrador Master',
      ativo: StatusRegistro.ATIVO,
    },
  });

  const pessoaSuporte = await prisma.pessoa.create({
    data: {
      empresaId: empresa.id,
      tipoId: pessoaTipo.id,
      genero: StatusGenero.FEMININO,
      nome: 'Usuária Suporte',
      ativo: StatusRegistro.ATIVO,
    },
  });

  const senhaHashMaster = await bcrypt.hash('master123', 10);
  const senhaHashSuporte = await bcrypt.hash('suporte123', 10);

  await prisma.pessoaUsuario.create({
    data: {
      pessoaId: pessoaMaster.id,
      perfilId: perfilMaster.id,
      email: 'master@empresa.com',
      login: 'master',
      senha: senhaHashMaster,
      ativo: StatusRegistro.ATIVO,
    },
  });

  await prisma.pessoaUsuario.create({
    data: {
      pessoaId: pessoaSuporte.id,
      perfilId: perfilSuporte.id,
      email: 'suporte@empresa.com',
      login: 'suporte',
      senha: senhaHashSuporte,
      ativo: StatusRegistro.ATIVO,
    },
  });

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
