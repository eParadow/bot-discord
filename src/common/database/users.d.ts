import type { User, UserCreate } from '../types';
export declare function createUser(data: UserCreate): Promise<User>;
export declare function getUserByUsername(username: string): Promise<User | undefined>;
export declare function getUserById(id: number): Promise<User | undefined>;
export declare function verifyPassword(user: User, password: string): Promise<boolean>;
//# sourceMappingURL=users.d.ts.map