import dotenv from 'dotenv';

dotenv.config();

export const config = {
  discordToken: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DATABASE || 'discord_bot',
    user: process.env.POSTGRES_USER || 'discord_bot',
    password: process.env.POSTGRES_PASSWORD || '',
  },
};

// Validate required environment variables
export function validateConfig(): void {
  if (!config.discordToken) {
    throw new Error('DISCORD_TOKEN is required in environment variables');
  }
  if (!config.clientId) {
    throw new Error('CLIENT_ID is required in environment variables');
  }
  if (!config.postgres.password) {
    throw new Error('POSTGRES_PASSWORD is required in environment variables');
  }
}
