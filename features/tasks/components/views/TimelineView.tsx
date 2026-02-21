"use client";

import { Task } from "@/types";
import { PriorityBadge, StatusBadge } from "@/components/shared/Badge";
import Avatar from "@/components/shared/Avatar";
import { mockUsers } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function TimelineView({
  tasks,
  onTaskClick,
}: TimelineViewProps) {
  // Sort tasks by start date or creation date
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.startDate || a.createdAt;
    const dateB = b.startDate || b.createdAt;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  // Calculate today's position
  const today = new Date();
  const allDates = sortedTasks
    .filter((t) => t.startDate && t.dueDate)
    .flatMap((t) => [new Date(t.startDate!), new Date(t.dueDate!)]);

  const minDate =
    allDates.length > 0
      ? new Date(Math.min(...allDates.map((d) => d.getTime())))
      : new Date();
  const maxDate =
    allDates.length > 0
      ? new Date(Math.max(...allDates.map((d) => d.getTime())))
      : new Date();

  const getTaskWidth = (task: Task) => {
    if (!task.startDate || !task.dueDate) return 20;
    const start = new Date(task.startDate).getTime();
    const end = new Date(task.dueDate).getTime();
    const total = maxDate.getTime() - minDate.getTime();
    const duration = end - start;
    return Math.max((duration / total) * 80, 10); // Min 10%, max 80%
  };

  const getTaskOffset = (task: Task) => {
    if (!task.startDate) return 0;
    const start = new Date(task.startDate).getTime();
    const total = maxDate.getTime() - minDate.getTime();
    const offset = start - minDate.getTime();
    return (offset / total) * 100;
  };

  const getTodayMarkerPosition = () => {
    const total = maxDate.getTime() - minDate.getTime();
    const offset = today.getTime() - minDate.getTime();
    return Math.max(0, Math.min(100, (offset / total) * 100));
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between text-sm text-[rgb(var(--color-text-secondary))]">
        <span>{formatDate(minDate)}</span>
        <span className="font-medium text-[rgb(var(--color-accent))]">
          Today
        </span>
        <span>{formatDate(maxDate)}</span>
      </div>

      {/* Timeline Chart */}
      <div className="relative">
        {/* Today marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[rgb(var(--color-accent))] z-10"
          style={{ left: `${getTodayMarkerPosition()}%` }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[rgb(var(--color-accent))] border-2 border-white"></div>
        </div>

        {/* Timeline Grid */}
        <div className="space-y-3 pt-4">
          {sortedTasks.map((task) => {
            const assignee =
              task.assigneeIds.length > 0
                ? mockUsers.find((u) => u.id === task.assigneeIds[0])
                : null;

            return (
              <div key={task.id} className="relative">
                {/* Task Row */}
                <div className="flex items-center gap-3 mb-2">
                  {assignee && <Avatar name={assignee.name} size="sm" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </div>
                </div>

                {/* Timeline Bar */}
                <div className="relative h-8 bg-[rgb(var(--color-surface-hover))] rounded-md overflow-hidden">
                  <div
                    className="absolute top-0 h-full bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-hover))] rounded-md cursor-pointer hover:opacity-90 transition-smooth flex items-center px-3"
                    style={{
                      left: `${getTaskOffset(task)}%`,
                      width: `${getTaskWidth(task)}%`,
                    }}
                    onClick={() => onTaskClick(task)}
                  >
                    <span className="text-xs text-white font-medium truncate">
                      {task.startDate && task.dueDate
                        ? `${formatDate(task.startDate)} - ${formatDate(task.dueDate)}`
                        : "No dates set"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm pt-4 border-t border-[rgb(var(--color-border))]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-hover))]"></div>
          <span className="text-[rgb(var(--color-text-secondary))]">
            Task Duration
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-[rgb(var(--color-accent))]"></div>
          <span className="text-[rgb(var(--color-text-secondary))]">Today</span>
        </div>
      </div>
    </div>
  );
}
