import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123456", 12);

  await prisma.user.upsert({
    where: { email: "admin@ecobright.local" },
    update: {
      name: "Eco Bright Admin",
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true
    },
    create: {
      name: "Eco Bright Admin",
      email: "admin@ecobright.local",
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
