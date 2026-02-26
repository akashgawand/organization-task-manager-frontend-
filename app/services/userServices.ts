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
    const response = await api.get(`/users/${id}`);

    // api.ts typically returns the full response object, so we look inside response.data
    const data = response?.data || response;

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

  async createUser(data: { name: string; email: string; password: string; role?: UserRole }) {
    const payload = {
      full_name: data.name,
      email: data.email,
      password: data.password,
      role: data.role?.toUpperCase() || "EMPLOYEE",
    };
    const response = await api.post("/auth/register", payload);
    return response;
  },

  async updateUser(id: string, data: Partial<User>) {
    const payload: any = {};
    if (data.name) payload.full_name = data.name;
    if (data.email) payload.email = data.email;
    if (data.role) payload.role = data.role.toUpperCase();
    if (data.isActive !== undefined) payload.is_active = data.isActive;

    const response = await api.put(`/users/${id}`, payload);
    return response;
  },

  async changeUserRole(id: string, role: string) {
    const payload = { role: role.toUpperCase() };
    const response = await api.patch(`/users/${id}/role`, payload);
    return response;
  },

  async deleteUser(id: string) {
    const response = await api.delete(`/users/${id}`);
    return response;
  },

  async updateOwnProfile(data: { name: string; email: string; phone?: string }) {
    const payload: any = {};
    if (data.name) payload.full_name = data.name;
    if (data.email) payload.email = data.email;
    if (data.phone) payload.phone = data.phone;

    // PATCH /api/v1/users/profile
    const response = await api.patch(`/users/profile`, payload);
    return response;
  },

  async updateOwnPassword(data: { currentPassword: string; newPassword: string }) {
    const payload = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };

    // PATCH /api/v1/users/password
    const response = await api.patch(`/users/password`, payload);
    return response;
  }
};
