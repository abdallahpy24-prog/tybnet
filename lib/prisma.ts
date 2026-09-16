import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const client = new PrismaClient({
    log: [{ emit: "event", level: "error" }]
  });
  // Prisma error messages can contain submitted patient data and connection URLs.
  client.$on("error", () => console.error("Database operation failed."));
  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}