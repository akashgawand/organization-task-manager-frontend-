import { api } from "./api";

export interface Notification {
  notification_id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: number | null;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  /**
   * Fetch user's latest notifications
   */
  getNotifications: async (): Promise<Notification[]> => {
    return api.get("/notifications");
  },

  /**
   * Mark a specific notification as read
   */
  markAsRead: async (id: number): Promise<Notification> => {
    return api.put(`/notifications/${id}/read`, {});
  },

  /**
   * Mark all of a user's notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    return api.put("/notifications/read-all", {});
  },
};
