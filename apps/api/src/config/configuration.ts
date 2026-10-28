export interface DatabaseConfig {
  url?: string;
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  synchronize: boolean;
  logging: boolean;
  ssl: boolean;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface PaymentsConfig {
  provider: string;
  webhookSecret: string;
}

export interface AppConfiguration {
  env: string;
  port: number;
  corsOrigins: string[];
  database: DatabaseConfig;
  jwt: JwtConfig;
  payments: PaymentsConfig;
  seedDatabase: boolean;
  seedDemoData: boolean;
}

function toBoolean(value: string | undefined, fallback = false): boolean {
  if (value == null) {
    return fallback;
  }
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default (): AppConfiguration => {
  const env = process.env.NODE_ENV ?? 'development';
  const jwtSecret = process.env.JWT_SECRET ?? 'canchalibre-dev-secret-change-me';

  if (env === 'production' && jwtSecret === 'canchalibre-dev-secret-change-me') {
    throw new Error('JWT_SECRET es obligatorio en producción');
  }

  return {
    env,
    port: toNumber(process.env.PORT, 3000),
    corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:4200,http://localhost:8100')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    database: {
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST ?? 'localhost',
      port: toNumber(process.env.DB_PORT, 5432),
      username: process.env.DB_USER ?? 'canchalibre',
      password: process.env.DB_PASSWORD ?? 'canchalibre',
      name: process.env.DB_NAME ?? 'canchalibre',
      synchronize: toBoolean(process.env.DB_SYNCHRONIZE, env !== 'production'),
      logging: toBoolean(process.env.DB_LOGGING, false),
      ssl: toBoolean(process.env.DB_SSL, false),
    },
    jwt: {
      secret: jwtSecret,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
    payments: {
      provider: process.env.PAYMENTS_PROVIDER ?? 'sandbox',
      webhookSecret: process.env.PAYMENTS_WEBHOOK_SECRET ?? 'canchalibre-dev-webhook',
    },
    seedDatabase: toBoolean(process.env.SEED_DATABASE, env === 'development'),
    seedDemoData: toBoolean(process.env.SEED_DEMO_DATA, env === 'development'),
  };
};
