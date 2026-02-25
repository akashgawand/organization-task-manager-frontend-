"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  KanbanBoard,
  ListView,
  CalendarView,
  TimelineView,
} from "@/features/tasks";
import { taskService } from "@/app/services/taskServices";
import { useAuth } from "@/features/permissions";
import { Task, TaskStatus, ViewMode } from "@/types";
import {
  GridIcon,
  ListIcon,
  CalendarIcon,
  TimelineIcon,
  FilterIcon,
} from "@/components/icons";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import { TaskIcon, ClockIcon, CheckIcon } from "@/components/icons";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  useEffect(() => {
    async function fetchTasks() {
      try {
        if (!user || user.id === "guest") {
          setIsLoading(false);
          return;
        }
        const tasksResponse = await taskService.getTasks();
        // Assuming the backend handles filtering by token, or we filter locally if needed
        const tasks = tasksResponse.data || [];
        setUserTasks(tasks);
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, [user]);

  // Calculate metrics
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = userTasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const overdueTasks = userTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done",
  ).length;

  const handleTaskClick = (task: Task) => {
    // In real app, open modal
    console.log("Open task:", task);
  };

  const handleAddTask = (status: TaskStatus) => {
    console.log("Add task with status:", status);
    // In real app, open create modal
  };

  const viewModes: {
    mode: ViewMode;
    icon: React.ComponentType;
    label: string;
  }[] = [
      { mode: "kanban", icon: GridIcon, label: "Board" },
      { mode: "list", icon: ListIcon, label: "List" },
      { mode: "calendar", icon: CalendarIcon, label: "Calendar" },
      { mode: "timeline", icon: TimelineIcon, label: "Timeline" },
    ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Manage and track your assigned tasks
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Total Tasks"
            value={totalTasks}
            icon={<TaskIcon />}
          />
          <AnalyticsCard
            title="In Progress"
            value={inProgressTasks}
            icon={<ClockIcon />}
            color="rgb(var(--color-info))"
          />
          <AnalyticsCard
            title="Completed"
            value={completedTasks}
            icon={<CheckIcon />}
            color="rgb(var(--color-success))"
          />
          <AnalyticsCard
            title="Overdue"
            value={overdueTasks}
            icon={<ClockIcon />}
            color="rgb(var(--color-danger))"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {viewModes.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`btn btn-sm ${viewMode === mode ? "btn-primary" : "btn-secondary"}`}
              >
                <Icon />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>

          <button className="btn btn-secondary btn-sm">
            <FilterIcon />
            <span className="hidden md:inline">Filter</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg p-6 min-h-[400px]">
          {isLoading ? (
            <LoadingSpinner size="lg" />
          ) : (
            <>
              {viewMode === "kanban" && (
                <KanbanBoard
                  tasks={userTasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTask}
                  isRestrictedRole={true}
                />
              )}
              {viewMode === "list" && (
                <ListView tasks={userTasks} onTaskClick={handleTaskClick} />
              )}
              {viewMode === "calendar" && (
                <CalendarView tasks={userTasks} onTaskClick={handleTaskClick} />
              )}
              {viewMode === "timeline" && (
                <TimelineView tasks={userTasks} onTaskClick={handleTaskClick} />
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
