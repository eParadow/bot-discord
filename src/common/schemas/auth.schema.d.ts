import { z } from 'zod';
export declare const loginSchema: any;
export declare const jwtPayloadSchema: any;
export type LoginInput = z.infer<typeof loginSchema>;
export type JWTPayloadInput = z.infer<typeof jwtPayloadSchema>;
//# sourceMappingURL=auth.schema.d.ts.map