import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Tenants ---
  const acme = await prisma.tenant.create({
    data: {
      name: "Acme Corp",
      slug: "acme",
      plan: "FREE",
    },
  });

  const globex = await prisma.tenant.create({
    data: {
      name: "Globex Inc",
      slug: "globex",
      plan: "FREE",
    },
  });

  // --- Users ---
  await prisma.user.create({
    data: {
      email: "admin@acme.test",
      password: "password", // plain text for now
      role: "ADMIN",
      tenantId: acme.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "user@acme.test",
      password: "password",
      role: "MEMBER",
      tenantId: acme.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@globex.test",
      password: "password",
      role: "ADMIN",
      tenantId: globex.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "user@globex.test",
      password: "password",
      role: "MEMBER",
      tenantId: globex.id,
    },
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
