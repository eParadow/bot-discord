import dotenv from 'dotenv';

dotenv.config();

export const config = {
  discordToken: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
};

// Validate required environment variables
export function validateConfig(): void {
  if (!config.discordToken) {
    throw new Error('DISCORD_TOKEN is required in environment variables');
  }
  if (!config.clientId) {
    throw new Error('CLIENT_ID is required in environment variables');
  }
}
