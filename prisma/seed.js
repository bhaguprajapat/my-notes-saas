import prismaClient from '../lib/prisma';
import { hashPassword } from '../lib/auth.js';

async function main() {
  await prismaClient.note.deleteMany();
  await prismaClient.user.deleteMany();
  await prismaClient.tenant.deleteMany();

  const acme = await prismaClient.tenant.create({
    data: { name: 'Acme', slug: 'acme', plan: 'free' }
  });

  const globex = await prismaClient.tenant.create({
    data: { name: 'Globex', slug: 'globex', plan: 'free' }
  });

  const pwd = await hashPassword('password');

  await prismaClient.user.createMany({
    data: [
      { email: 'admin@acme.test', password: pwd, role: 'admin', tenantId: acme.id },
      { email: 'user@acme.test',  password: pwd, role: 'member', tenantId: acme.id },
      { email: 'admin@globex.test', password: pwd, role: 'admin', tenantId: globex.id },
      { email: 'user@globex.test',  password: pwd, role: 'member', tenantId: globex.id }
    ]
  });

  console.log('Seeded tenants and users (password: password)');
}
main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prismaClient.$disconnect(); });
