import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import cron from 'node-cron';
import {
  createReminder,
  getRemindersByGuildId,
  getReminderById,
  deleteReminder,
} from '../database/reminders';
import { scheduleReminder, unscheduleReminder } from '../scheduler/cron';

export const data = new SlashCommandBuilder()
  .setName('rappel')
  .setDescription('Gérer les rappels programmés')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('create')
      .setDescription('Créer un nouveau rappel')
      .addStringOption((option) =>
        option
          .setName('message')
          .setDescription('Le message du rappel')
          .setRequired(true)
          .setMaxLength(2000)
      )
      .addStringOption((option) =>
        option
          .setName('cron')
          .setDescription('Expression CRON (ex: 0 9 * * * pour 9h chaque jour)')
          .setRequired(true)
      )
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('Channel où envoyer le rappel (défaut: channel actuel)')
          .addChannelTypes(ChannelType.GuildText)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('list')
      .setDescription('Lister tous les rappels du serveur')
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('delete')
      .setDescription('Supprimer un rappel')
      .addIntegerOption((option) =>
        option
          .setName('id')
          .setDescription('ID du rappel à supprimer')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('info')
      .setDescription('Afficher les détails d\'un rappel')
      .addIntegerOption((option) =>
        option
          .setName('id')
          .setDescription('ID du rappel')
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
    case 'info':
      await handleInfo(interaction);
      break;
  }
}

async function handleCreate(interaction: ChatInputCommandInteraction): Promise<void> {
  const message = interaction.options.getString('message', true);
  const cronExpression = interaction.options.getString('cron', true);
  const channel = interaction.options.getChannel('channel') ?? interaction.channel;

  if (!interaction.guildId) {
    await interaction.reply({
      content: '❌ Cette commande ne peut être utilisée que dans un serveur.',
      ephemeral: true,
    });
    return;
  }

  // Validate CRON expression
  if (!cron.validate(cronExpression)) {
    await interaction.reply({
      content: '❌ Expression CRON invalide. Exemples valides:\n' +
        '• `0 9 * * *` - Tous les jours à 9h\n' +
        '• `0 0 * * 1` - Tous les lundis à minuit\n' +
        '• `*/30 * * * *` - Toutes les 30 minutes',
      ephemeral: true,
    });
    return;
  }

  if (!channel || !('id' in channel)) {
    await interaction.reply({
      content: '❌ Channel invalide.',
      ephemeral: true,
    });
    return;
  }

  try {
    const reminder = createReminder({
      guild_id: interaction.guildId,
      channel_id: channel.id,
      message,
      cron_expression: cronExpression,
      created_by: interaction.user.id,
    });

    // Schedule the reminder
    scheduleReminder(reminder, interaction.client);

    const embed = new EmbedBuilder()
      .setTitle('✅ Rappel créé')
      .setColor(0x00ff00)
      .addFields(
        { name: 'ID', value: `${reminder.id}`, inline: true },
        { name: 'Channel', value: `<#${channel.id}>`, inline: true },
        { name: 'CRON', value: `\`${cronExpression}\``, inline: true },
        { name: 'Message', value: message.substring(0, 1024) }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error creating reminder:', error);
    await interaction.reply({
      content: '❌ Une erreur est survenue lors de la création du rappel.',
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

  const reminders = getRemindersByGuildId(interaction.guildId);

  if (reminders.length === 0) {
    await interaction.reply({
      content: '📭 Aucun rappel configuré sur ce serveur.',
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('📋 Liste des rappels')
    .setColor(0x0099ff)
    .setDescription(
      reminders
        .map((r) => {
          const truncatedMessage = r.message.length > 50 
            ? r.message.substring(0, 50) + '...' 
            : r.message;
          return `**#${r.id}** - \`${r.cron_expression}\` → <#${r.channel_id}>\n└ ${truncatedMessage}`;
        })
        .join('\n\n')
    )
    .setFooter({ text: `${reminders.length} rappel(s)` })
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

  // Verify reminder exists and belongs to this guild
  const reminder = getReminderById(id);
  if (!reminder || reminder.guild_id !== interaction.guildId) {
    await interaction.reply({
      content: `❌ Rappel #${id} introuvable sur ce serveur.`,
      ephemeral: true,
    });
    return;
  }

  const deleted = deleteReminder(id, interaction.guildId);

  if (deleted) {
    // Unschedule the reminder
    unscheduleReminder(id);

    await interaction.reply({
      content: `✅ Rappel #${id} supprimé avec succès.`,
    });
  } else {
    await interaction.reply({
      content: `❌ Impossible de supprimer le rappel #${id}.`,
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
  const reminder = getReminderById(id);

  if (!reminder || reminder.guild_id !== interaction.guildId) {
    await interaction.reply({
      content: `❌ Rappel #${id} introuvable sur ce serveur.`,
      ephemeral: true,
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`📌 Rappel #${reminder.id}`)
    .setColor(0x0099ff)
    .addFields(
      { name: 'Channel', value: `<#${reminder.channel_id}>`, inline: true },
      { name: 'CRON', value: `\`${reminder.cron_expression}\``, inline: true },
      { name: 'Créé par', value: `<@${reminder.created_by}>`, inline: true },
      { name: 'Créé le', value: new Date(reminder.created_at).toLocaleString('fr-FR'), inline: true },
      { name: 'Message', value: reminder.message.substring(0, 1024) }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
