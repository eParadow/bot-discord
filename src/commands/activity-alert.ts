import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import {
  createActivityAlert,
  getActivityAlertsByGuildId,
  getActivityAlertById,
  deleteActivityAlert,
  toggleActivityAlert,
} from '../database/activity-alerts';
import type { AlertType } from '../types';

export const data = new SlashCommandBuilder()
  .setName('alerte')
  .setDescription('Gérer les alertes d\'activité (jeu/vocal)')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('create')
      .setDescription('Créer une alerte quand quelqu\'un joue ou est en vocal trop longtemps')
      .addUserOption((option) =>
        option
          .setName('utilisateur')
          .setDescription('L\'utilisateur à surveiller')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('type')
          .setDescription('Type d\'activité à surveiller')
          .setRequired(true)
          .addChoices(
            { name: '🎮 Jeu', value: 'gaming' },
            { name: '🎙️ Vocal', value: 'voice' },
            { name: '🎮🎙️ Les deux', value: 'both' }
          )
      )
      .addIntegerOption((option) =>
        option
          .setName('duree')
          .setDescription('Durée en minutes avant l\'alerte (défaut: 60)')
          .setMinValue(1)
          .setMaxValue(1440)
      )
      .addStringOption((option) =>
        option
          .setName('message')
          .setDescription('Message personnalisé ({user}, {duration}, {type} disponibles)')
          .setMaxLength(500)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('list')
      .setDescription('Lister toutes les alertes du serveur')
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('delete')
      .setDescription('Supprimer une alerte')
      .addIntegerOption((option) =>
        option
          .setName('id')
          .setDescription('ID de l\'alerte à supprimer')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('toggle')
      .setDescription('Activer/désactiver une alerte')
      .addIntegerOption((option) =>
        option
          .setName('id')
          .setDescription('ID de l\'alerte')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('info')
      .setDescription('Afficher les détails d\'une alerte')
      .addIntegerOption((option) =>
        option
          .setName('id')
          .setDescription('ID de l\'alerte')
          .setRequired(true)
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case 'create':
      await handleCreate(interaction);
      break;
    case 'list':
      await handleList(interaction);
      break;
    case 'delete':
      await handleDelete(interaction);
      break;
    case 'toggle':
      await handleToggle(interaction);
      break;
    case 'info':
      await handleInfo(interaction);
      break;
  }
}

async function handleCreate(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({
      content: '❌ Cette commande ne peut être utilisée que dans un serveur.',
      ephemeral: true,
    });
    return;
  }

  const targetUser = interaction.options.getUser('utilisateur', true);
  const alertType = interaction.options.getString('type', true) as AlertType;
  const duration = interaction.options.getInteger('duree') ?? 60;
  const message = interaction.options.getString('message');

  // Don't allow alerting on bots
  if (targetUser.bot) {
    await interaction.reply({
      content: '❌ Vous ne pouvez pas créer une alerte pour un bot.',
      ephemeral: true,
    });
    return;
  }

  try {
    const alert = createActivityAlert({
      guild_id: interaction.guildId,
      target_user_id: targetUser.id,
      alert_user_id: interaction.user.id,
      alert_type: alertType,
      duration_minutes: duration,
      message,
    });

    const typeEmoji = alertType === 'gaming' ? '🎮' : alertType === 'voice' ? '🎙️' : '🎮🎙️';
    const typeText = alertType === 'gaming' ? 'Jeu' : alertType === 'voice' ? 'Vocal' : 'Jeu + Vocal';

    const embed = new EmbedBuilder()
      .setTitle('✅ Alerte créée')
      .setColor(0x00ff00)
      .addFields(
        { name: 'ID', value: `${alert.id}`, inline: true },
        { name: 'Utilisateur surveillé', value: `<@${targetUser.id}>`, inline: true },
        { name: 'Type', value: `${typeEmoji} ${typeText}`, inline: true },
        { name: 'Durée', value: `${duration} minute${duration > 1 ? 's' : ''}`, inline: true },
        { name: 'Notifié', value: `<@${interaction.user.id}>`, inline: true },
      )
      .setDescription(
        message 
          ? `Message personnalisé: ${message}` 
          : 'Vous recevrez un message privé quand l\'utilisateur dépasse la durée spécifiée.'
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error creating activity alert:', error);
    await interaction.reply({
      content: '❌ Une erreur est survenue lors de la création de l\'alerte.',
      ephemeral: true,
    });
  }
}

async function handleList(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({
      content: '❌ Cette commande ne peut être utilisée que dans un serveur.',
      ephemeral: true,
    });
    return;
  }

  const alerts = getActivityAlertsByGuildId(interaction.guildId);

  if (alerts.length === 0) {
    await interaction.reply({
      content: '📭 Aucune alerte d\'activité configurée sur ce serveur.',
      ephemeral: true,
    });
    return;
  }

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'gaming': return '🎮';
      case 'voice': return '🎙️';
      case 'both': return '🎮🎙️';
      default: return '❓';
    }
  };

  const embed = new EmbedBuilder()
    .setTitle('📋 Alertes d\'activité')
    .setColor(0x0099ff)
    .setDescription(
      alerts
        .map((a) => {
          const status = a.enabled ? '✅' : '❌';
          return `${status} **#${a.id}** - ${getTypeEmoji(a.alert_type)} <@${a.target_user_id}> → <@${a.alert_user_id}> (${a.duration_minutes}min)`;
        })
        .join('\n')
    )
    .setFooter({ text: `${alerts.length} alerte(s)` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleDelete(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({
      content: '❌ Cette commande ne peut être utilisée que dans un serveur.',
      ephemeral: true,
    });
    return;
  }

  const id = interaction.options.getInteger('id', true);

  const alert = getActivityAlertById(id);
  if (!alert || alert.guild_id !== interaction.guildId) {
    await interaction.reply({
      content: `❌ Alerte #${id} introuvable sur ce serveur.`,
      ephemeral: true,
    });
    return;
  }

  const deleted = deleteActivityAlert(id, interaction.guildId);

  if (deleted) {
    await interaction.reply({
      content: `✅ Alerte #${id} supprimée avec succès.`,
    });
  } else {
    await interaction.reply({
      content: `❌ Impossible de supprimer l'alerte #${id}.`,
      ephemeral: true,
    });
  }
}

async function handleToggle(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({
      content: '❌ Cette commande ne peut être utilisée que dans un serveur.',
      ephemeral: true,
    });
    return;
  }

  const id = interaction.options.getInteger('id', true);

  const alert = getActivityAlertById(id);
  if (!alert || alert.guild_id !== interaction.guildId) {
    await interaction.reply({
      content: `❌ Alerte #${id} introuvable sur ce serveur.`,
      ephemeral: true,
    });
    return;
  }

  const newState = !alert.enabled;
  const toggled = toggleActivityAlert(id, interaction.guildId, newState);

  if (toggled) {
    const status = newState ? '✅ activée' : '❌ désactivée';
    await interaction.reply({
      content: `Alerte #${id} ${status}.`,
    });
  } else {
    await interaction.reply({
      content: `❌ Impossible de modifier l'alerte #${id}.`,
      ephemeral: true,
    });
  }
}

async function handleInfo(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({
      content: '❌ Cette commande ne peut être utilisée que dans un serveur.',
      ephemeral: true,
    });
    return;
  }

  const id = interaction.options.getInteger('id', true);
  const alert = getActivityAlertById(id);

  if (!alert || alert.guild_id !== interaction.guildId) {
    await interaction.reply({
      content: `❌ Alerte #${id} introuvable sur ce serveur.`,
      ephemeral: true,
    });
    return;
  }

  const typeEmoji = alert.alert_type === 'gaming' ? '🎮' : alert.alert_type === 'voice' ? '🎙️' : '🎮🎙️';
  const typeText = alert.alert_type === 'gaming' ? 'Jeu' : alert.alert_type === 'voice' ? 'Vocal' : 'Jeu + Vocal';

  const embed = new EmbedBuilder()
    .setTitle(`📌 Alerte #${alert.id}`)
    .setColor(alert.enabled ? 0x00ff00 : 0xff0000)
    .addFields(
      { name: 'Statut', value: alert.enabled ? '✅ Activée' : '❌ Désactivée', inline: true },
      { name: 'Type', value: `${typeEmoji} ${typeText}`, inline: true },
      { name: 'Durée', value: `${alert.duration_minutes} minute${alert.duration_minutes > 1 ? 's' : ''}`, inline: true },
      { name: 'Utilisateur surveillé', value: `<@${alert.target_user_id}>`, inline: true },
      { name: 'Notifié', value: `<@${alert.alert_user_id}>`, inline: true },
      { name: 'Créé le', value: new Date(alert.created_at).toLocaleString('fr-FR'), inline: true },
    );

  if (alert.message) {
    embed.addFields({ name: 'Message personnalisé', value: alert.message });
  }

  await interaction.reply({ embeds: [embed] });
}
