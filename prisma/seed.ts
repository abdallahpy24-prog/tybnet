import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function requiredEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

async function main() {
  const name = requiredEnv("ADMIN_NAME", "Abdullah Hamed");
  const email = requiredEnv("ADMIN_EMAIL", "admin@tybnet.local");
  const username = requiredEnv("ADMIN_USERNAME", "admin");
  const password = requiredEnv("ADMIN_PASSWORD");

  if (password === "change-this-password" || password.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD is too weak. Set a strong password with at least 8 characters."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      username,
      passwordHash,
      role: Role.ADMIN,
      isActive: true
    },
    create: {
      name,
      email,
      username,
      passwordHash,
      role: Role.ADMIN,
      isActive: true
    }
  });

  const settings = [
    {
      key: "siteNameAr",
      value: "طب نت"
    },
    {
      key: "siteNameEn",
      value: "TybNet"
    },
    {
      key: "heroTitle",
      value: "طريقك الأسرع للوصول إلى الخدمات الطبية في العراق"
    },
    {
      key: "heroDescription",
      value:
        "طب نت منصة عراقية تنظّم بيانات الأطباء وأطباء الأسنان والصيدليات والمختبرات، وتساعدك على البحث حسب المحافظة والمنطقة والاختصاص، مع إمكانية التواصل أو طلب موعد بسهولة."
    }
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value
      },
      create: {
        key: setting.key,
        value: setting.value
      }
    });
  }

  console.log("Seed completed successfully.");
  console.log(`Admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });