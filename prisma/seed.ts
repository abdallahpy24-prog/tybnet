import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME ?? "Abdullah Hamed";
  const email = process.env.ADMIN_EMAIL ?? "admin@tibnet.local";
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "change-this-password";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { name, username, passwordHash, role: "ADMIN", isActive: true },
    create: { name, email, username, passwordHash, role: "ADMIN", isActive: true }
  });

  await prisma.setting.upsert({
    where: { key: "siteNameAr" },
    update: {},
    create: { key: "siteNameAr", value: "طب نت" }
  });
  await prisma.setting.upsert({
    where: { key: "siteNameEn" },
    update: {},
    create: { key: "siteNameEn", value: "TibNet" }
  });
  await prisma.setting.upsert({
    where: { key: "heroTitle" },
    update: {},
    create: { key: "heroTitle", value: "مرحباً بك في طب نت" }
  });
  await prisma.setting.upsert({
  where: { key: "heroDescription" },
  update: {
    value:
      "شركة عربية للتسويق الطبي، تجمع الأطباء وأطباء الأسنان والصيدليات والمختبرات والعروض الطبية في مكان واحد، تسهل على المرضى ايجاد الخدمات الطبية حجز المواعيد بسرعة وسهولة."
  },
  create: {
    key: "heroDescription",
    value:
      "شركة عربية للتسويق الطبي، تجمع الأطباء وأطباء الأسنان والصيدليات والمختبرات والعروض الطبية في مكان واحد، تسهل على المرضى ايجاد الخدمات الطبية حجز المواعيد بسرعة وسهولة."
  }
});

  // Important: do not seed governorates, areas, or specialties. The admin creates them from the dashboard.
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
