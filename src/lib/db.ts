import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }
    // Enable SSL for non-localhost connections (required by Supabase pooler)
    const isRemote = !connectionString.includes("localhost");
    const adapter = new PrismaPg({
        connectionString,
        ssl: isRemote ? { rejectUnauthorized: false } : undefined,
    });
    return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
