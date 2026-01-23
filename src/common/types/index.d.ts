export interface Reminder {
    id: number;
    guild_id: string | null;
    user_id: string;
    message: string;
    cron_expression: string;
    created_by: string;
    created_at: string;
}
export interface ReminderCreate {
    guild_id: string | null;
    user_id: string;
    message: string;
    cron_expression: string;
    created_by: string;
}
export type AlertType = 'gaming' | 'voice' | 'both';
export interface ActivityAlert {
    id: number;
    guild_id: string | null;
    target_user_id: string;
    alert_user_id: string;
    alert_type: AlertType;
    duration_minutes: number;
    message: string | null;
    enabled: boolean;
    created_at: string;
}
export interface ActivityAlertCreate {
    guild_id: string | null;
    target_user_id: string;
    alert_user_id: string;
    alert_type: AlertType;
    duration_minutes: number;
    message: string | null;
}
export interface User {
    id: number;
    username: string;
    password_hash: string;
    created_at: string;
}
export interface UserCreate {
    username: string;
    password: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
    };
}
export interface JWTPayload {
    userId: number;
    username: string;
    iat?: number;
    exp?: number;
}
export interface UserActivityState {
    userId: string;
    gamingStartedAt: number | null;
    voiceStartedAt: number | null;
    gamingAlertSent: Set<number>;
    voiceAlertSent: Set<number>;
}
//# sourceMappingURL=index.d.ts.map