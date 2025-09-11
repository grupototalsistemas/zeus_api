import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.empresa.deleteMany({});
  console.log('🗑️ Todos os registros da tabela empresas foram apagados.');
}

main().finally(async () => {
  await prisma.$disconnect();
});
