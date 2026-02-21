"use client";

import { TaskStatus } from "../../types";
import type { Task } from "../../types";
import TaskCard from "../TaskCard";
import { Plus } from "lucide-react";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

const statusColumns: { status: TaskStatus; label: string; color: string }[] = [
  { status: "todo", label: "To Do", color: "rgb(var(--color-text-tertiary))" },
  {
    status: "in_progress",
    label: "In Progress",
    color: "rgb(var(--color-info))",
  },
  { status: "review", label: "Review", color: "rgb(var(--color-warning))" },
  { status: "done", label: "Done", color: "rgb(var(--color-success))" },
];

export default function KanbanBoard({
  tasks,
  onTaskClick,
  onAddTask,
}: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusColumns.map((column) => {
        const columnTasks = tasks.filter(
          (task) => task.status === column.status,
        );

        return (
          <div
            key={column.status}
            className="shrink-0 w-80 bg-[rgb(var(--color-surface-hover))] rounded-lg p-4"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <h3 className="font-semibold">{column.label}</h3>
                <span className="text-sm text-[rgb(var(--color-text-tertiary))] bg-[rgb(var(--color-surface))] px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddTask(column.status)}
                className="btn btn-ghost p-1"
                aria-label="Add task"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                />
              ))}
            </div>

            {/* Empty State */}
            {columnTasks.length === 0 && (
              <div className="text-center py-8 text-sm text-[rgb(var(--color-text-tertiary))]">
                No tasks
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
