import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Tenants ---
  await prisma.tenant.createMany({
    data: [
      { name: "Acme Corp", slug: "acme", plan: "FREE" },
      { name: "Globex Inc", slug: "globex", plan: "FREE" },
    ],
  });

  // Fetch tenant IDs
  const acme = await prisma.tenant.findUnique({ where: { slug: "acme" } });
  const globex = await prisma.tenant.findUnique({ where: { slug: "globex" } });

  // --- Users ---
  await prisma.user.createMany({
    data: [
      { email: "admin@acme.test", password: "password", role: "ADMIN", tenantId: acme.id },
      { email: "user@acme.test", password: "password", role: "MEMBER", tenantId: acme.id },
      { email: "admin@globex.test", password: "password", role: "ADMIN", tenantId: globex.id },
      { email: "user@globex.test", password: "password", role: "MEMBER", tenantId: globex.id },
    ],
  });

  console.log("✅ Seeding finished");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
