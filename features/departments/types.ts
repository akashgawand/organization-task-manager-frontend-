// Department types and interfaces

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId: string;
  employeeIds: string[];
  budget?: number;
  createdAt: Date;
  isActive: boolean;
}

export interface DepartmentMetrics {
  totalEmployees: number;
  activeProjects: number;
  completedTasks: number;
  totalTasks: number;
  budgetUtilization?: number;
}
