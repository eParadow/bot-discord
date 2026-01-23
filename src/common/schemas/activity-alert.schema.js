"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityAlertIdSchema = exports.activityAlertToggleSchema = exports.activityAlertUpdateSchema = exports.activityAlertCreateSchema = void 0;
const zod_1 = require("zod");
exports.activityAlertCreateSchema = zod_1.z.object({
    guild_id: zod_1.z.string().nullable(),
    target_user_id: zod_1.z.string().min(1),
    alert_user_id: zod_1.z.string().min(1),
    alert_type: zod_1.z.enum(['gaming', 'voice', 'both']),
    duration_minutes: zod_1.z.number().int().positive().default(60),
    message: zod_1.z.string().nullable().optional(),
});
exports.activityAlertUpdateSchema = zod_1.z.object({
    guild_id: zod_1.z.string().nullable().optional(),
    target_user_id: zod_1.z.string().min(1).optional(),
    alert_user_id: zod_1.z.string().min(1).optional(),
    alert_type: zod_1.z.enum(['gaming', 'voice', 'both']).optional(),
    duration_minutes: zod_1.z.number().int().positive().optional(),
    message: zod_1.z.string().nullable().optional(),
});
exports.activityAlertToggleSchema = zod_1.z.object({
    enabled: zod_1.z.boolean(),
});
exports.activityAlertIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
//# sourceMappingURL=activity-alert.schema.js.map