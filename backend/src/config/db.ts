import { PrismaClient } from '@prisma/client';

const globalObjectCache = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalObjectCache.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalObjectCache.prisma = prisma;