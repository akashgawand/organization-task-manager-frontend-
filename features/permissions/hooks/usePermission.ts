"use client";

import { useMemo, useState, useEffect } from "react";
import { User, Team, Project } from "@/types";
import { Permission, rolePermissions } from "../types";
import { mockUsers, mockTeams } from "@/lib/mockData";
import { canAssignTask, canViewProject, canViewAnalytics } from "../utils";
import { ExtendedProject } from "@/features/projects/types";
import { authService } from "@/app/services/authServices";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const userTeams = useMemo(() => {
    if (!user) return [];
    
    // Attempt to map real user to mock user to reuse mock team logic
    // Real user has email. Mock users have email.
    const mockUser = mockUsers.find(u => u.email === user.email);
    const mockId = mockUser ? mockUser.id : user.id;

    return mockTeams.filter(t => 
      t.memberIds.includes(mockId) || t.leadId === mockId
    );
  }, [user]);

  // Fallback for SSR or unauthenticated state to prevent crashes
  // In a real app, pages would be protected by middleware/layout
  const safeUser: User = user || {
    id: 'guest',
    name: 'Guest',
    email: '',
    role: 'employee',
    isActive: false,
    createdAt: new Date()
  };

  // Prevent hydration mismatch by returning default until mounted
  if (!isMounted) {
     const mockRoleUser = mockUsers.find(u => u.role === 'admin') || mockUsers[0];
     return { user: mockRoleUser, userTeams: [] };
  }

  return { user: safeUser, userTeams };
}

/**
 * Utility function to change the mock user role for testing
 * Deprecated: verification now uses real auth
 */
export function setMockUserRole(role: User["role"]) {
  console.warn("setMockUserRole is deprecated. Use real login.");
}

/**
 * Check if the current user has a specific permission
 * @param permission - The permission key to check
 * @returns boolean indicating if user has the permission
 * 
 * @example
 * const canView = usePermission('canViewAnalytics');
 * if (canView) {
 *   return <AnalyticsDashboard />;
 * }
 */
export function usePermission(permission: keyof Permission): boolean {
  const { user } = useAuth();
  return rolePermissions[user.role][permission];
}

/**
 * Get all permissions for the current user
 * @returns Permission object with all permission flags
 */
export function usePermissions(): Permission {
  const { user } = useAuth();
  return rolePermissions[user.role];
}

/**
 * Hook to check complex permissions that require runtime context (assignment, project visibility)
 */
export function useRBAC() {
  const { user, userTeams } = useAuth();

  return {
    canAssign: (assignee: User) => canAssignTask(user, assignee, userTeams),
    canViewProject: (project: Project | ExtendedProject) => canViewProject(user, project, userTeams),
    canViewAnalytics: (type: 'system' | 'department' | 'team') => canViewAnalytics(user, type),
    user, // convenient access to current user
    userTeams, // needed for getAssignableUsers
  };
}
