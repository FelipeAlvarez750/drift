import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaMssql({
  server: 'localhost',
  port: 1433,
  database: 'drift_db',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  authentication: {
    type: 'default',
    options: {
      userName: 'drift_user',
      password: 'Drift2026!',
    },
  },
});

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;