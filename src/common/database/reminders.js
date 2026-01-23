"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReminder = createReminder;
exports.getReminderById = getReminderById;
exports.getRemindersByGuildId = getRemindersByGuildId;
exports.getRemindersByUserId = getRemindersByUserId;
exports.getAllReminders = getAllReminders;
exports.deleteReminder = deleteReminder;
exports.deleteReminderById = deleteReminderById;
const connection_1 = require("./connection");
async function createReminder(data) {
    const db = (0, connection_1.getDatabase)();
    const result = await db('reminders')
        .insert({
        guild_id: data.guild_id,
        user_id: data.user_id,
        message: data.message,
        cron_expression: data.cron_expression,
        created_by: data.created_by,
    })
        .returning('id');
    const id = result[0].id;
    return (await getReminderById(id));
}
async function getReminderById(id) {
    const db = (0, connection_1.getDatabase)();
    return await db('reminders')
        .where('id', id)
        .first();
}
async function getRemindersByGuildId(guildId) {
    const db = (0, connection_1.getDatabase)();
    return await db('reminders')
        .where('guild_id', guildId)
        .orderBy('created_at', 'desc');
}
async function getRemindersByUserId(userId) {
    const db = (0, connection_1.getDatabase)();
    return await db('reminders')
        .where('user_id', userId)
        .whereNull('guild_id')
        .orderBy('created_at', 'desc');
}
async function getAllReminders() {
    const db = (0, connection_1.getDatabase)();
    return await db('reminders')
        .orderBy('id');
}
async function deleteReminder(id, guildId, userId) {
    const db = (0, connection_1.getDatabase)();
    let query = db('reminders').where('id', id);
    if (guildId === null && userId) {
        // Pour les DMs, vérifier que le rappel appartient à l'utilisateur
        query = query.whereNull('guild_id').where('user_id', userId);
    }
    else if (guildId !== null) {
        // Pour les serveurs, vérifier le guild_id
        query = query.where('guild_id', guildId);
    }
    const deleted = await query.delete();
    return deleted > 0;
}
async function deleteReminderById(id) {
    const db = (0, connection_1.getDatabase)();
    const deleted = await db('reminders')
        .where('id', id)
        .delete();
    return deleted > 0;
}
//# sourceMappingURL=reminders.js.map