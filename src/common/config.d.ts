export declare const dbConfig: {
    databaseUrl: string | undefined;
    postgres: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
    };
};
export declare function getDatabaseConnection(): string | {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
};
//# sourceMappingURL=config.d.ts.map