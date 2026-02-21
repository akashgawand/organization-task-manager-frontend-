// Task feature types
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeIds: string[];
  creatorId: string;
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: Attachment[];
  subtasks: SubTask[];
  comments: Comment[];
  dependencies: string[];
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  mentions: string[];
  parentId?: string;
  reactions: Reaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
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

export type ViewMode = 'kanban' | 'list' | 'calendar' | 'timeline';
