import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

async function main() {
  const email = process.env.SEED_EMAIL ?? "rep@example.com";
  const password = process.env.SEED_PASSWORD ?? "password123";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: "Rep User", passwordHash },
    update: { passwordHash },
  });

  await prisma.integration.upsert({
    where: { userId_provider: { userId: user.id, provider: "oauth" } },
    create: { userId: user.id, provider: "oauth", status: "connected" },
    update: { status: "connected" },
  });

  console.log(`[seed] user ready: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

