"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdSchema = exports.userCreateSchema = void 0;
const zod_1 = require("zod");
exports.userCreateSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    password: zod_1.z.string().min(8),
});
exports.userIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
//# sourceMappingURL=user.schema.js.map