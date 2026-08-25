import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// creating a PrismaPg adapter and giving it your PostgreSQL connection string.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const db = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

export default db;
