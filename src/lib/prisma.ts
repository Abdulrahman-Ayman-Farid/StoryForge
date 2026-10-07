/* eslint-disable @typescript-eslint/no-require-imports */
// NOTE: Requires `npx prisma generate` before use.
// The Prisma client is generated from prisma/schema.prisma.

let prisma: any;

try {
  const { PrismaClient } = require("@prisma/client");
  const globalForPrisma = globalThis as unknown as { prisma: InstanceType<typeof PrismaClient> };

  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} catch {
  // Prisma client not generated yet — run `npx prisma generate`
  prisma = null;
}

export { prisma };
