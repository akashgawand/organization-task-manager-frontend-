// This would ideally connect to a real notification endpoint or socket
export interface Notification {
  id: number;
  text: string;
  type: "mention" | "approval" | "change" | "info";
  createdAt: Date;
  read: boolean;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    // Placeholder for future API integration
    // const response = await api.get("/notifications");
    // return response.data;
    
    // Returning empty array or static structure for now to remove mockData dependency
    // In a real app, this would likely fetch from an endpoint like /notifications
    return [];
  },
  
  async markAsRead(id: number) {
      // await api.put(`/notifications/${id}/read`);
      return true;
  }
};
