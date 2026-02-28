"use client";

import { useMemo, useState, useEffect } from "react";
import { User, UserRole, Team, Project } from "@/types";
import { Permission, rolePermissions } from "../types";
import { mockUsers, mockTeams } from "@/lib/mockData";
import { canAssignTask, canViewProject, canViewAnalytics } from "../utils";
import { ExtendedProject } from "@/features/projects/types";
import { authService } from "@/app/services/authServices";

/** Read user once synchronously – avoids any loading flash on client-side navigation */
function readUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  return authService.getCurrentUser();
}

export function useAuth() {
  // Lazy initializer: runs synchronously on first render.
  // On client-side navigation (sidebar clicks), window is always available so
  // user is populated immediately — no isLoading phase, no spinner flash.
  const [user, setUser] = useState<User | null>(readUserFromStorage);

  // isLoading is only needed for the very first SSR load where window is absent.
  const [isLoading, setIsLoading] = useState(typeof window === 'undefined');

  useEffect(() => {
    // Re-sync in case localStorage changed between SSR and hydration
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);

    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setUser(customEvent.detail);
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  const userTeams = useMemo(() => {
    if (!user) return [];

    // Attempt to map real user to mock user to reuse mock team logic
    const mockUser = mockUsers.find(u => u.email === user.email);
    const mockId = mockUser ? mockUser.id : user.id;

    return mockTeams.filter(t =>
      t.memberIds.includes(mockId) || t.leadId === mockId
    );
  }, [user]);

  if (isLoading) {
    return {
      user: null as unknown as User,
      userTeams: [],
      isLoading: true,
    };
  }

  const safeUser: User = user || {
    id: 'guest',
    name: 'Guest',
    email: '',
    role: 'employee' as UserRole,
    isActive: false,
    createdAt: new Date(),
  };

  return { user: safeUser, userTeams, isLoading: false };
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
  const { user, isLoading } = useAuth();
  // While loading or unauthenticated, deny all permissions
  if (isLoading || !user) return false;
  const role = user.role.toLowerCase() as UserRole;
  return rolePermissions[role]?.[permission] ?? false;
}

/**
 * Get all permissions for the current user
 * @returns Permission object with all permission flags
 */
export function usePermissions(): Permission {
  const { user, isLoading } = useAuth();
  if (isLoading || !user) return rolePermissions['employee'];
  const role = user.role.toLowerCase() as UserRole;
  return rolePermissions[role] ?? rolePermissions['employee'];
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
