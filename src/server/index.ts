import { createApp } from './server';
import { config, validateConfig } from './config';
import { getDatabase, closeDatabase, initializeDatabase } from '../common/database/connection';

async function main(): Promise<void> {
  // Validate configuration
  validateConfig();

  // Initialize database
  console.log('📦 Initialisation de la base de données...');
  getDatabase();
  await initializeDatabase();

  // Create Express app
  const app = createApp();

  // Start server
  const server = app.listen(config.apiPort, () => {
    console.log(`🚀 Serveur API démarré sur le port ${config.apiPort}`);
    console.log(`📚 Documentation Swagger: http://localhost:${config.apiPort}/api-docs`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Signal ${signal} reçu, arrêt en cours...`);
    
    server.close(async () => {
      await closeDatabase();
      console.log('👋 Serveur API arrêté proprement');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
