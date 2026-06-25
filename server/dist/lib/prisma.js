"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
const adapter_mssql_1 = require("@prisma/adapter-mssql");
const globalForPrisma = global;
const adapter = new adapter_mssql_1.PrismaMssql({
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
exports.prisma = globalForPrisma.prisma || new prisma_1.PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
