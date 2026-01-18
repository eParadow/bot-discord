import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  ChatInputCommandInteraction,
} from 'discord.js';
import { config, validateConfig } from './config';
import { getDatabase, closeDatabase } from './database/connection';
import { loadAllReminders, stopAllReminders } from './scheduler/cron';
import * as reminderCommand from './commands/reminder';

// Extend Client type to include commands collection
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, {
      data: any;
      execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    }>;
  }
}

async function main(): Promise<void> {
  // Validate configuration
  validateConfig();

  // Initialize database
  console.log('📦 Initialisation de la base de données...');
  getDatabase();

  // Create Discord client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],
  });

  // Setup commands collection
  client.commands = new Collection();
  client.commands.set(reminderCommand.data.name, reminderCommand);

  // Event: Bot ready
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ Connecté en tant que ${readyClient.user.tag}`);
    console.log(`📊 Présent sur ${readyClient.guilds.cache.size} serveur(s)`);

    // Load all scheduled reminders
    loadAllReminders(client);
  });

  // Event: Interaction (slash commands)
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`Commande inconnue: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Erreur lors de l'exécution de /${interaction.commandName}:`, error);
      
      const errorMessage = '❌ Une erreur est survenue lors de l\'exécution de cette commande.';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Signal ${signal} reçu, arrêt en cours...`);
    
    stopAllReminders();
    closeDatabase();
    client.destroy();
    
    console.log('👋 Bot arrêté proprement');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Login to Discord
  console.log('🔌 Connexion à Discord...');
  await client.login(config.discordToken);
}

main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
