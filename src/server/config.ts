import dotenv from 'dotenv';

dotenv.config();

export const config = {
  apiPort: parseInt(process.env.API_PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || '',
};

export function validateConfig(): void {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is required in environment variables');
  }
}
