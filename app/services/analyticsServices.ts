import { api } from "./api";

// Interfaces based on the backend response structure
export interface StatusDistribution {
    name: string;
    value: number;
}

export interface UserCompletedTask {
    name: string;
    completed: number;
}

export interface AnalyticsOverview {
    activeProjectsCount: number;
    activeTasksCount: number;
    completedTasksCount: number;
    overdueTasksCount: number;
    statusDistribution: StatusDistribution[];
    userCompletedTasks: UserCompletedTask[];
}

export interface TrendDataPoint {
    date: string;
    createdTasks: number;
    completedTasks: number;
    activeUsers: number;
}

export const analyticsServices = {
    getOverview: async (): Promise<AnalyticsOverview> => {
        return await api.get("/analytics/overview");
    },

    getTrend: async (
        startDate?: string,
        endDate?: string
    ): Promise<TrendDataPoint[]> => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        return await api.get("/analytics/trend", params);
    },
};
