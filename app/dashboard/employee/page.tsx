"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KanbanBoard from "@/components/views/KanbanBoard";
import { getTasksByAssignee } from "@/lib/mockData";
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

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const userTasks = getTasksByAssignee(user.id);

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
    setSelectedTask(task);
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
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg p-6">
          {viewMode === "kanban" && (
            <KanbanBoard
              tasks={userTasks}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
            />
          )}

          {viewMode === "list" && (
            <div className="text-center py-16 text-[rgb(var(--color-text-tertiary))]">
              <ListIcon />
              <p className="mt-4">List view - Coming soon</p>
            </div>
          )}

          {viewMode === "calendar" && (
            <div className="text-center py-16 text-[rgb(var(--color-text-tertiary))]">
              <CalendarIcon />
              <p className="mt-4">Calendar view - Coming soon</p>
            </div>
          )}

          {viewMode === "timeline" && (
            <div className="text-center py-16 text-[rgb(var(--color-text-tertiary))]">
              <TimelineIcon />
              <p className="mt-4">Timeline view - Coming soon</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
