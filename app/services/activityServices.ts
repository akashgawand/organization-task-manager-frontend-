import { api } from "./api";

export const activityService = {
  /**
   * Fetch activity logs for a specific user
   * @param userId The ID of the user
   * @param params Optional query parameters (e.g. { limit: 10, page: 1 })
   */
  async getUserActivity(userId: string, params?: Record<string, any>) {
    const response = await api.get(`/activity/user/${userId}`, params);
    
    // Handle paginated response: { data: [...], pagination: {...} }
    if (response?.data && Array.isArray(response.data)) {
      return response;
    }
    // Handle flat array
    if (Array.isArray(response)) {
      return { data: response, pagination: null };
    }
    return { data: [], pagination: null };
  },

  /**
   * Fetch activity logs for the currently authenticated user
   * @param params Optional query parameters (e.g. { limit: 10, page: 1 })
   */
  async getMyActivity(params?: Record<string, any>) {
    const response = await api.get("/activity/my-activity", params);
    
    // Handle paginated response: { data: [...], pagination: {...} }
    if (response?.data && Array.isArray(response.data)) {
      return response;
    }
    // Handle flat array
    if (Array.isArray(response)) {
      return { data: response, pagination: null };
    }
    return { data: [], pagination: null };
  }
};
