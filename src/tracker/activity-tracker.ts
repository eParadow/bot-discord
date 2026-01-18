import { Client, Presence, VoiceState, ActivityType } from 'discord.js';
import { getActivityAlertsByTargetUser } from '../database/activity-alerts';
import type { UserActivityState, ActivityAlert } from '../types';

// In-memory tracking of user activity states
// Key: `${guildId}:${userId}`
const userStates: Map<string, UserActivityState> = new Map();

// Check interval (every minute)
const CHECK_INTERVAL_MS = 60 * 1000;

let checkIntervalId: NodeJS.Timeout | null = null;

function getStateKey(guildId: string, userId: string): string {
  return `${guildId}:${userId}`;
}

function getOrCreateState(guildId: string, userId: string): UserActivityState {
  const key = getStateKey(guildId, userId);
  let state = userStates.get(key);
  
  if (!state) {
    state = {
      userId,
      gamingStartedAt: null,
      voiceStartedAt: null,
      gamingAlertSent: new Set(),
      voiceAlertSent: new Set(),
    };
    userStates.set(key, state);
  }
  
  return state;
}

function isPlayingGame(presence: Presence | null): boolean {
  if (!presence) return false;
  
  return presence.activities.some(activity => 
    activity.type === ActivityType.Playing ||
    activity.type === ActivityType.Streaming
  );
}

function getGameName(presence: Presence | null): string | null {
  if (!presence) return null;
  
  const gameActivity = presence.activities.find(activity =>
    activity.type === ActivityType.Playing ||
    activity.type === ActivityType.Streaming
  );
  
  return gameActivity?.name || null;
}

export function handlePresenceUpdate(oldPresence: Presence | null, newPresence: Presence): void {
  const guildId = newPresence.guild?.id;
  const userId = newPresence.userId;
  const username = newPresence.member?.displayName || newPresence.user?.username || userId;
  const guildName = newPresence.guild?.name || guildId;
  
  if (!guildId) return;
  
  const wasPlaying = isPlayingGame(oldPresence);
  const isPlaying = isPlayingGame(newPresence);
  
  const state = getOrCreateState(guildId, userId);
  
  if (!wasPlaying && isPlaying) {
    // Started playing
    const gameName = getGameName(newPresence);
    state.gamingStartedAt = Date.now();
    state.gamingAlertSent.clear();
    console.log(`[TRACKER] ${username} (${userId}) a commencé à jouer${gameName ? ` à ${gameName}` : ''} dans ${guildName}`);
  } else if (wasPlaying && !isPlaying) {
    // Stopped playing
    state.gamingStartedAt = null;
    state.gamingAlertSent.clear();
    console.log(`[TRACKER] ${username} (${userId}) a arrêté de jouer dans ${guildName}`);
  }
}

export function handleVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): void {
  const guildId = newState.guild.id;
  const userId = newState.id;
  const username = newState.member?.displayName || newState.member?.user.username || userId;
  const guildName = newState.guild.name;
  
  const wasInVoice = oldState.channelId !== null;
  const isInVoice = newState.channelId !== null;
  
  const state = getOrCreateState(guildId, userId);
  
  if (!wasInVoice && isInVoice) {
    // Joined voice channel
    const channelName = newState.channel?.name || 'inconnu';
    state.voiceStartedAt = Date.now();
    state.voiceAlertSent.clear();
    console.log(`[TRACKER] ${username} (${userId}) a rejoint le vocal #${channelName} dans ${guildName}`);
  } else if (wasInVoice && !isInVoice) {
    // Left voice channel
    const channelName = oldState.channel?.name || 'inconnu';
    state.voiceStartedAt = null;
    state.voiceAlertSent.clear();
    console.log(`[TRACKER] ${username} (${userId}) a quitté le vocal #${channelName} dans ${guildName}`);
  }
}

async function checkAndSendAlerts(client: Client): Promise<void> {
  const now = Date.now();
  
  for (const [key, state] of userStates) {
    const [guildId, oderId] = key.split(':');
    
    // Get alerts for this user
    const alerts = getActivityAlertsByTargetUser(oderId);
    
    for (const alert of alerts) {
      // Skip if alert is for a different guild
      if (alert.guild_id !== guildId) continue;
      
      const durationMs = alert.duration_minutes * 60 * 1000;
      
      // Check gaming alerts
      if ((alert.alert_type === 'gaming' || alert.alert_type === 'both') &&
          state.gamingStartedAt !== null &&
          !state.gamingAlertSent.has(alert.id)) {
        
        const elapsed = now - state.gamingStartedAt;
        if (elapsed >= durationMs) {
          await sendAlert(client, alert, 'gaming', state, guildId, oderId);
          state.gamingAlertSent.add(alert.id);
        }
      }
      
      // Check voice alerts
      if ((alert.alert_type === 'voice' || alert.alert_type === 'both') &&
          state.voiceStartedAt !== null &&
          !state.voiceAlertSent.has(alert.id)) {
        
        const elapsed = now - state.voiceStartedAt;
        if (elapsed >= durationMs) {
          await sendAlert(client, alert, 'voice', state, guildId, oderId);
          state.voiceAlertSent.add(alert.id);
        }
      }
    }
  }
}

async function sendAlert(
  client: Client,
  alert: ActivityAlert,
  type: 'gaming' | 'voice',
  state: UserActivityState,
  guildId: string,
  targetUserId: string
): Promise<void> {
  try {
    const alertUser = await client.users.fetch(alert.alert_user_id);
    const targetUser = await client.users.fetch(targetUserId);
    const guild = await client.guilds.fetch(guildId);
    
    const durationText = formatDuration(alert.duration_minutes);
    
    let message: string;
    
    if (alert.message) {
      message = alert.message
        .replace('{user}', targetUser.displayName)
        .replace('{duration}', durationText)
        .replace('{type}', type === 'gaming' ? 'joue' : 'est en vocal');
    } else {
      if (type === 'gaming') {
        // Try to get the game name
        const member = await guild.members.fetch(targetUserId);
        const gameName = getGameName(member.presence);
        message = `🎮 **${targetUser.displayName}** joue${gameName ? ` à **${gameName}**` : ''} depuis plus de ${durationText} sur **${guild.name}** !`;
      } else {
        message = `🎙️ **${targetUser.displayName}** est en vocal depuis plus de ${durationText} sur **${guild.name}** !`;
      }
    }
    
    await alertUser.send(message);
    console.log(`[TRACKER] Alerte envoyée à ${alertUser.tag} pour ${targetUser.tag} (${type})`);
  } catch (error) {
    console.error(`[TRACKER] Erreur lors de l'envoi de l'alerte:`, error);
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} heure${hours > 1 ? 's' : ''}`;
  }
  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
}

export function startActivityTracker(client: Client): void {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
  }
  
  // Initialize states for users already in voice or playing
  initializeExistingStates(client);
  
  checkIntervalId = setInterval(() => {
    checkAndSendAlerts(client).catch(console.error);
  }, CHECK_INTERVAL_MS);
  
  console.log('[TRACKER] Activity tracker démarré');
}

export function stopActivityTracker(): void {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
  userStates.clear();
  console.log('[TRACKER] Activity tracker arrêté');
}

async function initializeExistingStates(client: Client): Promise<void> {
  for (const guild of client.guilds.cache.values()) {
    // Check voice states
    for (const [, voiceState] of guild.voiceStates.cache) {
      if (voiceState.channelId) {
        const state = getOrCreateState(guild.id, voiceState.id);
        state.voiceStartedAt = Date.now();
      }
    }
    
    // Check presences
    for (const [, member] of guild.members.cache) {
      if (member.presence && isPlayingGame(member.presence)) {
        const state = getOrCreateState(guild.id, member.id);
        state.gamingStartedAt = Date.now();
      }
    }
  }
}
