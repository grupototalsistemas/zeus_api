import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/common/utils/password.util';
const prisma = new PrismaClient();
async function main() {
  // Admin
  const adminEmail = 'admin@example.com';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      passwordHash: await hashPassword('admin123'),
      role: Role.ADMIN,
    },
  });
  // Suporte
  const supportEmail = 'support@example.com';
  const support = await prisma.user.upsert({
    where: { email: supportEmail },
    update: {},
    create: {
      email: supportEmail,
      name: 'Suporte',
      passwordHash: await hashPassword('support123'),
      role: Role.SUPPORT,
    },
  });
  console.log('Seed concluído:', { admin, support });
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
