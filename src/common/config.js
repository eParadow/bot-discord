"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
exports.getDatabaseConnection = getDatabaseConnection;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configuration DB partagée entre bot et server
exports.dbConfig = {
    // Support for Railway and other services that provide DATABASE_URL
    databaseUrl: process.env.DATABASE_URL,
    postgres: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        database: process.env.POSTGRES_DATABASE || 'discord_bot',
        user: process.env.POSTGRES_USER || 'discord_bot',
        password: process.env.POSTGRES_PASSWORD || '',
    },
};
function getDatabaseConnection() {
    // Support DATABASE_URL (Railway, Heroku, etc.) or individual parameters
    return exports.dbConfig.databaseUrl
        ? exports.dbConfig.databaseUrl
        : {
            host: exports.dbConfig.postgres.host,
            port: exports.dbConfig.postgres.port,
            database: exports.dbConfig.postgres.database,
            user: exports.dbConfig.postgres.user,
            password: exports.dbConfig.postgres.password,
        };
}
//# sourceMappingURL=config.js.map