import { REST, Routes } from 'discord.js';
import { config, validateConfig } from './config';
import * as reminderCommand from './commands/reminder';
import * as activityAlertCommand from './commands/activity-alert';

async function deployCommands(): Promise<void> {
  validateConfig();

  const commands = [
    reminderCommand.data.toJSON(),
    activityAlertCommand.data.toJSON(),
  ];

  const rest = new REST().setToken(config.discordToken);

  try {
    console.log(`🔄 Déploiement de ${commands.length} commande(s)...`);

    // Deploy commands globally (available on all servers)
    const data = await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    ) as any[];

    console.log(`✅ ${data.length} commande(s) déployée(s) avec succès!`);
    console.log('📝 Commandes disponibles:');
    
    for (const cmd of data) {
      console.log(`   - /${cmd.name}: ${cmd.description}`);
    }

    console.log('\n⏳ Note: Les commandes globales peuvent prendre jusqu\'à 1 heure pour être disponibles sur tous les serveurs.');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement des commandes:', error);
    process.exit(1);
  }
}

deployCommands();
