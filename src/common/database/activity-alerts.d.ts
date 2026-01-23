import type { ActivityAlert, ActivityAlertCreate } from '../types';
export declare function createActivityAlert(data: ActivityAlertCreate): Promise<ActivityAlert>;
export declare function getActivityAlertById(id: number): Promise<ActivityAlert | undefined>;
export declare function getActivityAlertsByGuildId(guildId: string): Promise<ActivityAlert[]>;
export declare function getActivityAlertsByUserId(userId: string): Promise<ActivityAlert[]>;
export declare function getActivityAlertsByTargetUser(targetUserId: string): Promise<ActivityAlert[]>;
export declare function getAllEnabledActivityAlerts(): Promise<ActivityAlert[]>;
export declare function deleteActivityAlert(id: number, guildId: string | null, userId?: string): Promise<boolean>;
export declare function toggleActivityAlert(id: number, guildId: string | null, enabled: boolean, userId?: string): Promise<boolean>;
//# sourceMappingURL=activity-alerts.d.ts.map