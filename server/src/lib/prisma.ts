
import 'dotenv/config';

import { PrismaClient } from '../generated/prisma';
import { PrismaMssql } from '@prisma/adapter-mssql';

console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_NAME:', process.env.DB_NAME);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaMssql({
  server: process.env.DB_SERVER || 'localhost',
  port: 1433,
  database: process.env.DB_NAME || 'drift_db',
  options: {
    trustServerCertificate: false,
    enableArithAbort: true,
    encrypt: true,
  },
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || '',
    },
  },
});

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 