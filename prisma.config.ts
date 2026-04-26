import { existsSync } from 'node:fs';
import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'prisma/config';

const appEnv = process.env.APP_ENV ?? 'local';

const envFile = appEnv === 'production' ? '.env.production' : '.env.local';

if (existsSync(envFile)) {
  loadEnv({
    path: envFile,
    override: true,
  });
}

const migrationDatabaseUrl = process.env.MIGRATION_DATABASE_URL;
const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL;

if (!migrationDatabaseUrl) {
  throw new Error('MIGRATION_DATABASE_URL is not set');
}

const command = process.argv.join(' ');
const isMigrateDev = command.includes('migrate') && command.includes('dev');

if (isMigrateDev) {
  const isLocalDatabase =
    migrationDatabaseUrl.includes('localhost') ||
    migrationDatabaseUrl.includes('127.0.0.1');

  if (!isLocalDatabase) {
    throw new Error(
      [
        'Blocked unsafe command.',
        'You are trying to run `prisma migrate dev` on a non-local database.',
        '',
        `Current MIGRATION_DATABASE_URL: ${migrationDatabaseUrl.replace(/:\/\/.*@/, '://***:***@')}`,
        '',
        'Use local PostgreSQL for migrate dev.',
        'Use migrate deploy only for production.',
      ].join('\n'),
    );
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: migrationDatabaseUrl,
    ...(shadowDatabaseUrl
      ? {
          shadowDatabaseUrl,
        }
      : {}),
  },
});
