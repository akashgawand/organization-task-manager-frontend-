import { api } from "./api";

export const dashboardService = {
  async getAnalytics(dateRange?: string) {
    const params = dateRange ? { dateRange } : undefined;
    return api.get("/dashboard/analytics", params);
  },

  async getProjectStats(projectId: string) {
    return api.get(`/dashboard/project-stats/${projectId}`);
  },

  async getEmployeeProductivity(userId?: string) {
    const endpoint = userId
      ? `/dashboard/employee-productivity/${userId}`
      : `/dashboard/employee-productivity`;

    return api.get(endpoint);
  },
};
