import dotenv from 'dotenv';

dotenv.config();

// Configuration DB partagée entre bot et server
export const dbConfig = {
  // Support for Railway and other services that provide DATABASE_URL
  databaseUrl: process.env.DATABASE_URL,
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DATABASE || 'discord_bot',
    user: process.env.POSTGRES_USER || 'discord_bot',
    password: process.env.POSTGRES_PASSWORD || '',
  },
};

export function getDatabaseConnection() {
  // Support DATABASE_URL (Railway, Heroku, etc.) or individual parameters
  return dbConfig.databaseUrl
    ? dbConfig.databaseUrl
    : {
        host: dbConfig.postgres.host,
        port: dbConfig.postgres.port,
        database: dbConfig.postgres.database,
        user: dbConfig.postgres.user,
        password: dbConfig.postgres.password,
      };
}
