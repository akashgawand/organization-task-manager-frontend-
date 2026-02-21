import { api } from "./api";
import { User, UserRole } from "@/types";

export const userService = {
  async getUsers(params?: Record<string, any>) {
    const response = await api.get("/users", params);
    // api.ts does: return data.data ?? data
    // Backend users endpoint: { success, data: { data: [...], pagination: {} } }
    // OR the outer data field IS the paginated object: { data: [...], pagination: {} }
    // Handle all shapes:
    const rows: any[] =
      Array.isArray(response) ? response              // already a flat array
      : Array.isArray(response?.data) ? response.data  // { data: [...], pagination }
      : [];                                             // fallback
    return {
      data: rows.map((u: any) => ({
        id: String(u.user_id),
        name: u.full_name,
        email: u.email,
        role: u.role ? (u.role.toLowerCase() as UserRole) : "employee",
        avatar: u.avatar,
        isActive: u.is_active,
        createdAt: u.created_at,
      })),
      pagination: response?.pagination ?? null,
    };
  },

  async getUserById(id: string) {
    const data = await api.get(`/users/${id}`);
    if (data) {
      return {
        id: String(data.user_id),
        name: data.full_name,
        email: data.email,
        role: data.role ? (data.role.toLowerCase() as UserRole) : "employee",
        avatar: data.avatar,
        isActive: data.is_active,
        createdAt: data.created_at,
      } as User;
    }
    return null;
  },
};
