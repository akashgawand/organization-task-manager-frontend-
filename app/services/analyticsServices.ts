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

export interface TeamWorkloadDataPoint {
    name: string;
    assigned: number;
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
    activeUsers?: number;
}

export interface UserAnalyticsOverview {
    tasksAssignedCount: number;
    tasksCompletedCount: number;
    overdueTasksCount: number;
    productivityScore: number;
    statusDistribution: StatusDistribution[];
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

    getTeamWorkload: async (
        startDate?: string,
        endDate?: string
    ): Promise<TeamWorkloadDataPoint[]> => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        return await api.get("/analytics/team-workload", params);
    },

    getUserOverview: async (userId: string): Promise<UserAnalyticsOverview> => {
        return await api.get(`/analytics/user/${userId}/overview`);
    },

    getUserTrend: async (
        userId: string,
        startDate?: string,
        endDate?: string
    ): Promise<TrendDataPoint[]> => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        return await api.get(`/analytics/user/${userId}/trend`, params);
    },
};
