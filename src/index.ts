import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  ChatInputCommandInteraction,
  Partials,
  REST,
  Routes,
  MessageFlags,
} from 'discord.js';
import { config, validateConfig } from './config';
import { getDatabase, closeDatabase, initializeDatabase } from './database/connection';
import { loadAllReminders, stopAllReminders } from './scheduler/cron';
import {
  handlePresenceUpdate,
  handleVoiceStateUpdate,
  startActivityTracker,
  stopActivityTracker,
} from './tracker/activity-tracker';
import * as reminderCommand from './commands/reminder';
import * as activityAlertCommand from './commands/activity-alert';

// All commands
const commands = [reminderCommand, activityAlertCommand];

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
  await initializeDatabase();

  // Create Discord client with necessary intents for activity tracking
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,      // For tracking game activity
      GatewayIntentBits.GuildVoiceStates,    // For tracking voice channel activity
      GatewayIntentBits.GuildMembers,        // For fetching member info
    ],
    partials: [Partials.GuildMember],
  });

  // Setup commands collection
  client.commands = new Collection();
  for (const command of commands) {
    client.commands.set(command.data.name, command);
  }

  // Event: Bot ready
  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`✅ Connecté en tant que ${readyClient.user.tag}`);
    console.log(`📊 Présent sur ${readyClient.guilds.cache.size} serveur(s)`);

    // Deploy slash commands
    await deployCommands();

    // Load all scheduled reminders
    await loadAllReminders(client);
    
    // Start activity tracker
    startActivityTracker(client);
  });

  // Event: Presence update (game activity)
  client.on(Events.PresenceUpdate, (oldPresence, newPresence) => {
    handlePresenceUpdate(oldPresence, newPresence);
  });

  // Event: Voice state update (voice channel activity)
  client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    handleVoiceStateUpdate(oldState, newState);
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
        await interaction.followUp({ content: errorMessage, flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
      }
    }
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Signal ${signal} reçu, arrêt en cours...`);
    
    stopAllReminders();
    stopActivityTracker();
    await closeDatabase();
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

async function deployCommands(): Promise<void> {
  const commandsData = commands.map((cmd) => cmd.data.toJSON());
  const rest = new REST().setToken(config.discordToken);

  try {
    console.log(`🔄 Déploiement de ${commandsData.length} commande(s)...`);

    const data = (await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commandsData }
    )) as any[];

    console.log(`✅ ${data.length} commande(s) déployée(s): ${data.map((c) => `/${c.name}`).join(', ')}`);
  } catch (error) {
    console.error('❌ Erreur lors du déploiement des commandes:', error);
  }
}

main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
