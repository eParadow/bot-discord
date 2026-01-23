"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActivityAlert = createActivityAlert;
exports.getActivityAlertById = getActivityAlertById;
exports.getActivityAlertsByGuildId = getActivityAlertsByGuildId;
exports.getActivityAlertsByUserId = getActivityAlertsByUserId;
exports.getActivityAlertsByTargetUser = getActivityAlertsByTargetUser;
exports.getAllEnabledActivityAlerts = getAllEnabledActivityAlerts;
exports.deleteActivityAlert = deleteActivityAlert;
exports.toggleActivityAlert = toggleActivityAlert;
const connection_1 = require("./connection");
async function createActivityAlert(data) {
    const db = (0, connection_1.getDatabase)();
    const result = await db('activity_alerts')
        .insert({
        guild_id: data.guild_id,
        target_user_id: data.target_user_id,
        alert_user_id: data.alert_user_id,
        alert_type: data.alert_type,
        duration_minutes: data.duration_minutes,
        message: data.message,
    })
        .returning('id');
    const id = result[0].id;
    return (await getActivityAlertById(id));
}
async function getActivityAlertById(id) {
    const db = (0, connection_1.getDatabase)();
    return await db('activity_alerts')
        .where('id', id)
        .first();
}
async function getActivityAlertsByGuildId(guildId) {
    const db = (0, connection_1.getDatabase)();
    return await db('activity_alerts')
        .where('guild_id', guildId)
        .orderBy('created_at', 'desc');
}
async function getActivityAlertsByUserId(userId) {
    const db = (0, connection_1.getDatabase)();
    return await db('activity_alerts')
        .where('alert_user_id', userId)
        .whereNull('guild_id')
        .orderBy('created_at', 'desc');
}
async function getActivityAlertsByTargetUser(targetUserId) {
    const db = (0, connection_1.getDatabase)();
    return await db('activity_alerts')
        .where('target_user_id', targetUserId)
        .where('enabled', true);
}
async function getAllEnabledActivityAlerts() {
    const db = (0, connection_1.getDatabase)();
    return await db('activity_alerts')
        .where('enabled', true);
}
async function deleteActivityAlert(id, guildId, userId) {
    const db = (0, connection_1.getDatabase)();
    let query = db('activity_alerts').where('id', id);
    if (guildId === null && userId) {
        // Pour les DMs, vérifier que l'alerte appartient à l'utilisateur
        query = query.whereNull('guild_id').where('alert_user_id', userId);
    }
    else if (guildId !== null) {
        // Pour les serveurs, vérifier le guild_id
        query = query.where('guild_id', guildId);
    }
    const deleted = await query.delete();
    return deleted > 0;
}
async function toggleActivityAlert(id, guildId, enabled, userId) {
    const db = (0, connection_1.getDatabase)();
    let query = db('activity_alerts').where('id', id);
    if (guildId === null && userId) {
        // Pour les DMs, vérifier que l'alerte appartient à l'utilisateur
        query = query.whereNull('guild_id').where('alert_user_id', userId);
    }
    else if (guildId !== null) {
        // Pour les serveurs, vérifier le guild_id
        query = query.where('guild_id', guildId);
    }
    const updated = await query.update({ enabled });
    return updated > 0;
}
//# sourceMappingURL=activity-alerts.js.map