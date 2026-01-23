"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtPayloadSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    password: zod_1.z.string().min(1),
});
exports.jwtPayloadSchema = zod_1.z.object({
    userId: zod_1.z.number(),
    username: zod_1.z.string(),
    iat: zod_1.z.number().optional(),
    exp: zod_1.z.number().optional(),
});
//# sourceMappingURL=auth.schema.js.map