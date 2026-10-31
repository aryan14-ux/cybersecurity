const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const prismaDir = path.join(rootDir, 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');
const postgresSchemaPath = path.join(prismaDir, 'schema.postgresql.prisma');

const dbUrl = process.env.DATABASE_URL || '';

if ((dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) && fs.existsSync(postgresSchemaPath)) {
  fs.copyFileSync(postgresSchemaPath, schemaPath);
  console.log('[Prisma] Switched to PostgreSQL schema for production.');
} else {
  // Ensure DATABASE_URL is set so prisma generate succeeds
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./dev.db';
  }
  console.log('[Prisma] Using SQLite schema.');
}
