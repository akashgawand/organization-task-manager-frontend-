import { User, UserRole } from "@/types";
import { api } from "./api";

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await api.post("/auth/login", { email, password });
    
    // Map backend user to frontend user
    const user: User = {
      id: String(data.user.user_id),
      name: data.user.full_name,
      email: data.user.email,
      role: data.user.role.toLowerCase() as UserRole, // Ensure lowercase for frontend
      isActive: true, // Default
      createdAt: new Date(),
    };

    // Store tokens and user info
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return { ...data, user };
  },

  async register(name: string, email: string, password: string) {
    return api.post("/auth/register", { full_name: name, email, password });
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      // Optional: Call backend logout endpoint
    }
    window.location.href = "/login";
  },

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        return JSON.parse(userStr);
      }
    }
    return null;
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
