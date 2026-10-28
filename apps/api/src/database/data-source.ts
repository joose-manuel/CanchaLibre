import 'reflect-metadata';
import 'tsconfig-paths/register';
import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { entities } from './entities';

const useSsl = ['1', 'true', 'yes', 'on'].includes((process.env.DB_SSL ?? '').toLowerCase());

export default new DataSource({
  type: 'postgres',
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER ?? 'canchalibre',
        password: process.env.DB_PASSWORD ?? 'canchalibre',
        database: process.env.DB_NAME ?? 'canchalibre',
      }),
  entities,
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: ['1', 'true', 'yes', 'on'].includes((process.env.DB_LOGGING ?? '').toLowerCase()),
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});
