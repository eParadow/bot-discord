"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reminderIdSchema = exports.reminderUpdateSchema = exports.reminderCreateSchema = void 0;
const zod_1 = require("zod");
exports.reminderCreateSchema = zod_1.z.object({
    guild_id: zod_1.z.string().nullable(),
    user_id: zod_1.z.string().min(1),
    message: zod_1.z.string().min(1),
    cron_expression: zod_1.z.string().min(1),
    created_by: zod_1.z.string().min(1),
});
exports.reminderUpdateSchema = zod_1.z.object({
    guild_id: zod_1.z.string().nullable().optional(),
    user_id: zod_1.z.string().min(1).optional(),
    message: zod_1.z.string().min(1).optional(),
    cron_expression: zod_1.z.string().min(1).optional(),
    created_by: zod_1.z.string().min(1).optional(),
});
exports.reminderIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
//# sourceMappingURL=reminder.schema.js.map