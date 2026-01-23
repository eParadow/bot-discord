"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.getUserByUsername = getUserByUsername;
exports.getUserById = getUserById;
exports.verifyPassword = verifyPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
const connection_1 = require("./connection");
const SALT_ROUNDS = 10;
async function createUser(data) {
    const db = (0, connection_1.getDatabase)();
    const passwordHash = await bcrypt_1.default.hash(data.password, SALT_ROUNDS);
    const result = await db('users')
        .insert({
        username: data.username,
        password_hash: passwordHash,
    })
        .returning('id');
    const id = result[0].id;
    return (await getUserById(id));
}
async function getUserByUsername(username) {
    const db = (0, connection_1.getDatabase)();
    return await db('users')
        .where('username', username)
        .first();
}
async function getUserById(id) {
    const db = (0, connection_1.getDatabase)();
    return await db('users')
        .where('id', id)
        .first();
}
async function verifyPassword(user, password) {
    return await bcrypt_1.default.compare(password, user.password_hash);
}
//# sourceMappingURL=users.js.map