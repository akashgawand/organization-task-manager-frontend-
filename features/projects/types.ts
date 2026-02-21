// Project-related types and interfaces

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived' | 'cancelled';
export type ProjectHealth = 'green' | 'yellow' | 'red';
export type ProjectRisk = 'low' | 'medium' | 'high';
export type PhaseStatus = 'upcoming' | 'active' | 'completed';

export interface Milestone {
  id: string;
  name: string;
  date: Date;
  status: 'pending' | 'completed' | 'delayed';
}

export interface Phase {
  id: string;
  name: string;
  order: number;
  color: string;
  status: PhaseStatus;
  startDate?: Date;
  endDate?: Date;
  taskCount: number;
  completionPercentage: number;
}

export interface ProjectPhaseTemplate {
  id: string;
  name: string;
  description: string;
  phases: Omit<Phase, 'id' | 'taskCount' | 'completionPercentage' | 'status'>[];
}

export interface ProjectMember {
  userId: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'manager' | 'member';
  joinedAt: Date;
}

export interface ProjectActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ExtendedProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  health: ProjectHealth;
  progress: number;
  startDate: Date;
  endDate?: Date;
  members: ProjectMember[];
  phases: Phase[];
  templateId?: string;
  tags: string[];
  isStarred: boolean;
  taskCount: number;
  completedTaskCount: number;
  createdAt: Date;
  updatedAt: Date;
  // New fields for Project Detail Page
  budget?: {
    total: number;
    used: number;
    currency: string;
  };
  riskScore?: ProjectRisk;
  milestones?: Milestone[];
  ownerId?: string;
}

// Phase Templates
export const PHASE_TEMPLATES: ProjectPhaseTemplate[] = [
  {
    id: 'software-dev',
    name: 'Software Development',
    description: 'Standard software development lifecycle',
    phases: [
      { name: 'Planning', order: 1, color: '#3B82F6', startDate: undefined, endDate: undefined },
      { name: 'Design', order: 2, color: '#8B5CF6', startDate: undefined, endDate: undefined },
      { name: 'Development', order: 3, color: '#10B981', startDate: undefined, endDate: undefined },
      { name: 'Testing', order: 4, color: '#F59E0B', startDate: undefined, endDate: undefined },
      { name: 'Deployment', order: 5, color: '#EF4444', startDate: undefined, endDate: undefined },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    description: 'Marketing campaign workflow',
    phases: [
      { name: 'Research', order: 1, color: '#3B82F6', startDate: undefined, endDate: undefined },
      { name: 'Strategy', order: 2, color: '#8B5CF6', startDate: undefined, endDate: undefined },
      { name: 'Creative', order: 3, color: '#10B981', startDate: undefined, endDate: undefined },
      { name: 'Launch', order: 4, color: '#F59E0B', startDate: undefined, endDate: undefined },
      { name: 'Analysis', order: 5, color: '#6366F1', startDate: undefined, endDate: undefined },
    ],
  },
  {
    id: 'event',
    name: 'Event Planning',
    description: 'Event planning and execution',
    phases: [
      { name: 'Concept', order: 1, color: '#3B82F6', startDate: undefined, endDate: undefined },
      { name: 'Logistics', order: 2, color: '#8B5CF6', startDate: undefined, endDate: undefined },
      { name: 'Promotion', order: 3, color: '#10B981', startDate: undefined, endDate: undefined },
      { name: 'Execution', order: 4, color: '#F59E0B', startDate: undefined, endDate: undefined },
      { name: 'Wrap-up', order: 5, color: '#6366F1', startDate: undefined, endDate: undefined },
    ],
  },
];

// Helper to calculate project health
export function calculateProjectHealth(
  progress: number,
  daysUntilDeadline: number,
  overdueTasksCount: number
): ProjectHealth {
  // Red: Overdue tasks or behind schedule
  if (overdueTasksCount > 3 || (progress < 50 && daysUntilDeadline < 7)) {
    return 'red';
  }
  
  // Yellow: Some risk indicators
  if (overdueTasksCount > 0 || (progress < 70 && daysUntilDeadline < 14)) {
    return 'yellow';
  }
  
  // Green: On track
  return 'green';
}
