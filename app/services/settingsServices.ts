import { api } from "./api";

export interface SystemSettings {
  company_name: string;
  timezone: string;
  date_format: string;
  time_format: string;

  notify_task_assignments: boolean;
  notify_task_updates: boolean;
  notify_comments: boolean;
  notify_mentions: boolean;
  notification_frequency: string;

  session_timeout: string;
  pass_min_length: boolean;
  pass_require_uppercase: boolean;
  pass_require_numbers: boolean;
  pass_require_special: boolean;
  require_2fa: boolean;
}

export const settingsService = {
  async getSettings(): Promise<SystemSettings | null> {
    try {
      const response = await api.get("/settings");
      // The backend returns { success, data: {...}, message }
      return response as SystemSettings;
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      return null;
    }
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings | null> {
    try {
      const response = await api.put("/settings", data);
      return response as SystemSettings;
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  },
};
