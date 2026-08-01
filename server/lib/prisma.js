import "dotenv/config";

const globalForPrisma = globalThis;

let prisma = globalForPrisma.prisma || null;

// Only initialize PrismaClient if DATABASE_URL is actually provided
if (!prisma && process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") {
  try {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient();

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }
  } catch (error) {
    console.warn("⚠️  Prisma initialization failed:", error.message);
    console.warn("⚠️  Database features will be unavailable. Server will continue with mock/Firebase data.");
    prisma = null;
  }
} else if (!prisma) {
  console.warn("⚠️  DATABASE_URL not provided. Database features will be unavailable.");
  console.warn("⚠️  Set DATABASE_URL in .env to enable PostgreSQL. Server will continue without DB.");
}

export { prisma };