import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
