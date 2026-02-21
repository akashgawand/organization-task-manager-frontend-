// User & Authentication Types
export type UserRole = 'super_admin' | 'admin' | 'team_lead' | 'senior_developer' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  position?: string;
  isActive: boolean;
  isOnline?: boolean;
  skills?: string[];
  createdAt: Date;
}

// Team Types
export type TeamStatus = 'active' | 'idle' | 'archived';

export interface Team {
  id: string;
  name: string;
  description: string;
  leadId: string;
  memberIds: string[];
  projectIds: string[];
  status: TeamStatus;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project Types
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  teamId: string;
  ownerId: string;
  startDate: Date;
  endDate?: Date;
  progress: number; // 0-100
  priority: TaskPriority;
  tags: string[];
  phases: ProjectPhase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectPhase {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
}

// Bucket/Group Types
export interface Bucket {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  color: string;
  displayOrder: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Task Types
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  bucketId?: string; // Optional bucket assignment
  assigneeIds: string[];
  creatorId: string;
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  subtasks: SubTask[];
  dependencies: string[]; // Array of task IDs
  position: number; // For ordering in Kanban
  createdAt: Date;
  updatedAt: Date;
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

// Comment & Activity Types
export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  mentions: string[]; // Array of user IDs
  parentId?: string; // For nested replies
  reactions: Reaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export type ActivityType = 
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_assigned'
  | 'comment_added'
  | 'status_changed'
  | 'priority_changed'
  | 'deadline_changed'
  | 'attachment_added'
  | 'project_created'
  | 'team_created'
  | 'user_added';

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  taskId?: string;
  projectId?: string;
  teamId?: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

// Notification Types
export type NotificationType = 
  | 'task_assigned'
  | 'task_due_soon'
  | 'task_overdue'
  | 'comment_mention'
  | 'approval_request'
  | 'approval_response'
  | 'deadline_extension_request'
  | 'status_update';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  projectId?: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Analytics Types
export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number; // in hours
  tasksByPriority: Record<TaskPriority, number>;
  tasksByStatus: Record<TaskStatus, number>;
}

export interface TeamAnalytics {
  totalMembers: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completionRate: number;
  memberWorkload: {
    userId: string;
    activeTasks: number;
    completedTasks: number;
  }[];
}

export interface ProductivityMetrics {
  date: Date;
  tasksCompleted: number;
  tasksCreated: number;
  activeUsers: number;
}

// Approval Types
export type ApprovalType = 'leave' | 'deadline_extension' | 'resource_request';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  requesterId: string;
  approverId: string;
  taskId?: string;
  projectId?: string;
  reason: string;
  status: ApprovalStatus;
  responseMessage?: string;
  createdAt: Date;
  respondedAt?: Date;
}

// Permission Types
export interface Permission {
  canCreateProject: boolean;
  canDeleteProject: boolean;
  canAssignTasks: boolean;
  canManageTeam: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canAccessAuditLogs: boolean;
  canConfigureSystem: boolean;
  // New granular permissions
  canAssignTasksTo: UserRole[];
  canViewAllProjects: boolean;
  canViewDepartmentProjects: boolean;
  canViewTeamProjects: boolean;
  canViewAllAnalytics: boolean;
  canViewDepartmentAnalytics: boolean;
  canViewSystemLogs: boolean;
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
    canAssignTasksTo: ['admin', 'team_lead', 'employee'],
    canViewAllProjects: true,
    canViewDepartmentProjects: true,
    canViewTeamProjects: true,
    canViewAllAnalytics: true,
    canViewDepartmentAnalytics: true,
    canViewSystemLogs: true,
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
    canAssignTasksTo: ['team_lead', 'employee'],
    canViewAllProjects: false,
    canViewDepartmentProjects: true,
    canViewTeamProjects: true,
    canViewAllAnalytics: false,
    canViewDepartmentAnalytics: true,
    canViewSystemLogs: false,
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
    canAssignTasksTo: ['employee'], // Logic will restrict to own team
    canViewAllProjects: false,
    canViewDepartmentProjects: false,
    canViewTeamProjects: true,
    canViewAllAnalytics: false,
    canViewDepartmentAnalytics: false,
    canViewSystemLogs: false,
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
    canAssignTasksTo: ['employee'], // Logic will restrict to own team
    canViewAllProjects: false,
    canViewDepartmentProjects: false,
    canViewTeamProjects: true,
    canViewAllAnalytics: false,
    canViewDepartmentAnalytics: false,
    canViewSystemLogs: false,
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
    canAssignTasksTo: [], // Can only create personal tasks via logic
    canViewAllProjects: false,
    canViewDepartmentProjects: false,
    canViewTeamProjects: true,
    canViewAllAnalytics: false,
    canViewDepartmentAnalytics: false,
    canViewSystemLogs: false,
  },
};

// View Types
export type ViewMode = 'kanban' | 'list' | 'calendar' | 'timeline';

// Filter & Sort Types
export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeIds?: string[];
  projectIds?: string[];
  tags?: string[];
  dueDateRange?: {
    start: Date;
    end: Date;
  };
}

export type SortField = 'title' | 'priority' | 'dueDate' | 'createdAt' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface TaskSort {
  field: SortField;
  direction: SortDirection;
}
