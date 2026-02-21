// Permission types
export type UserRole = 'super_admin' | 'admin' | 'team_lead' | 'senior_developer' | 'employee';

export interface Permission {
  canCreateProject: boolean;
  canDeleteProject: boolean;
  canAssignTasks: boolean;
  canManageTeam: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canAccessAuditLogs: boolean;
  canConfigureSystem: boolean;
  // Super Admin specific permissions
  canManageDepartments: boolean;
  canManagePermissions: boolean;
  canViewSystemLogs: boolean;
  canViewAllAnalytics: boolean;
  canManageSettings: boolean;
}

export const rolePermissions: Record<UserRole, Permission> = {
  super_admin: {
    canCreateProject: true,
    canDeleteProject: true,
    canAssignTasks: true,
    canManageTeam: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canAccessAuditLogs: true,
    canConfigureSystem: true,
    canManageDepartments: true,
    canManagePermissions: true,
    canViewSystemLogs: true,
    canViewAllAnalytics: true,
    canManageSettings: true,
  },
  admin: {
    canCreateProject: true,
    canDeleteProject: true,
    canAssignTasks: true,
    canManageTeam: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canAccessAuditLogs: false,
    canConfigureSystem: false,
    canManageDepartments: false,
    canManagePermissions: false,
    canViewSystemLogs: false,
    canViewAllAnalytics: true,
    canManageSettings: false,
  },
  team_lead: {
    canCreateProject: false,
    canDeleteProject: false,
    canAssignTasks: true,
    canManageTeam: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canAccessAuditLogs: false,
    canConfigureSystem: false,
    canManageDepartments: false,
    canManagePermissions: false,
    canViewSystemLogs: false,
    canViewAllAnalytics: false,
    canManageSettings: false,
  },
  senior_developer: {
    canCreateProject: false,
    canDeleteProject: false,
    canAssignTasks: true,
    canManageTeam: true,
    canViewAnalytics: true,
    canManageUsers: false,
    canAccessAuditLogs: false,
    canConfigureSystem: false,
    canManageDepartments: false,
    canManagePermissions: false,
    canViewSystemLogs: false,
    canViewAllAnalytics: false,
    canManageSettings: false,
  },
  employee: {
    canCreateProject: false,
    canDeleteProject: false,
    canAssignTasks: false,
    canManageTeam: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canAccessAuditLogs: false,
    canConfigureSystem: false,
    canManageDepartments: false,
    canManagePermissions: false,
    canViewSystemLogs: false,
    canViewAllAnalytics: false,
    canManageSettings: false,
  },
};
