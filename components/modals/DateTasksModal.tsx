"use client";

import { Task } from "@/types";
import { X, Check, Circle, AlertCircle } from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import { mockUsers } from "@/lib/mockData";

interface DateTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
}

const priorityConfig = {
  critical: {
    color: "rgb(var(--color-danger))",
    label: "Critical",
    icon: AlertCircle,
  },
  high: { color: "rgb(var(--color-danger))", label: "High", icon: AlertCircle },
  medium: { color: "rgb(var(--color-warning))", label: "Medium", icon: Circle },
  low: { color: "rgb(var(--color-success))", label: "Low", icon: Circle },
};

export default function DateTasksModal({
  isOpen,
  onClose,
  date,
  tasks,
  onTaskToggle,
  onTaskClick,
}: DateTasksModalProps) {
  if (!isOpen || !date) return null;

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const completedTasks = tasks.filter((t) => t.status === "done");
  const pendingTasks = tasks.filter((t) => t.status !== "done");

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden pointer-events-auto transition-smooth"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
            <div>
              <h2 className="text-2xl font-bold mb-1">{formatDate(date)}</h2>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""} •{" "}
                {completedTasks.length} completed
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost p-2"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-6">
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgb(var(--color-surface-hover))] flex items-center justify-center">
                  <Circle className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                </div>
                <p className="text-[rgb(var(--color-text-secondary))]">
                  No tasks scheduled for this date
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pending Tasks */}
                {pendingTasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))] uppercase mb-3">
                      Pending ({pendingTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {pendingTasks.map((task) => {
                        const config = priorityConfig[task.priority];
                        const Icon = config.icon;
                        const assignees = task.assigneeIds
                          .map((id) => mockUsers.find((u) => u.id === id))
                          .filter(Boolean);

                        return (
                          <div
                            key={task.id}
                            className="p-4 rounded-lg border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))] transition-smooth cursor-pointer group"
                            style={{
                              borderLeftWidth: "4px",
                              borderLeftColor: config.color,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {/* Completion Checkbox */}
                              {/* <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTaskToggle(task.id);
                                }}
                                className="mt-0.5 w-5 h-5 rounded border-2 border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))] transition-smooth flex items-center justify-center shrink-0"
                              >
                                {task.status === "done" && (
                                  <Check className="w-3 h-3 text-[rgb(var(--color-success))]" />
                                )}
                              </button> */}

                              <div
                                className="flex-1 min-w-0"
                                onClick={() => onTaskClick(task)}
                              >
                                {/* Task Title */}
                                <div className="flex items-center gap-2 mb-1">
                                  <Icon
                                    className="w-4 h-4 flex-shrink-0"
                                    style={{ color: config.color }}
                                  />
                                  <h4 className="font-semibold">
                                    {task.title}
                                  </h4>
                                </div>

                                {/* Task Description */}
                                {task.description && (
                                  <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-2 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                {/* Task Meta */}
                                <div className="flex items-center gap-3 text-xs">
                                  {/* Priority Badge */}
                                  <span
                                    className="px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                      backgroundColor: `${config.color}20`,
                                      color: config.color,
                                    }}
                                  >
                                    {config.label}
                                  </span>

                                  {/* Status Badge */}
                                  <span className="px-2 py-0.5 rounded-full bg-[rgb(var(--color-info-light))] text-[rgb(var(--color-info))] capitalize">
                                    {task.status.replace("_", " ")}
                                  </span>

                                  {/* Assignees */}
                                  {assignees.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      {assignees.slice(0, 3).map((assignee) => (
                                        <Avatar
                                          key={assignee!.id}
                                          name={assignee!.name}
                                          size="sm"
                                        />
                                      ))}
                                      {assignees.length > 3 && (
                                        <span className="text-[rgb(var(--color-text-tertiary))]">
                                          +{assignees.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[rgb(var(--color-text-tertiary))] uppercase mb-3">
                      Completed ({completedTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {completedTasks.map((task) => {
                        const config = priorityConfig[task.priority];
                        const assignees = task.assigneeIds
                          .map((id) => mockUsers.find((u) => u.id === id))
                          .filter(Boolean);

                        return (
                          <div
                            key={task.id}
                            className="p-4 rounded-lg border border-[rgb(var(--color-border))] opacity-60 hover:opacity-100 transition-smooth cursor-pointer"
                            onClick={() => onTaskClick(task)}
                          >
                            <div className="flex items-start gap-3">
                              {/* Completion Checkbox */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTaskToggle(task.id);
                                }}
                                className="mt-0.5 w-5 h-5 rounded border-2 border-[rgb(var(--color-success))] bg-[rgb(var(--color-success))] transition-smooth flex items-center justify-center shrink-0"
                              >
                                <Check className="w-3 h-3 text-white" />
                              </button>

                              <div className="flex-1 min-w-0">
                                {/* Task Title - Strikethrough */}
                                <h4 className="font-semibold line-through text-[rgb(var(--color-text-secondary))]">
                                  {task.title}
                                </h4>

                                {/* Task Meta */}
                                <div className="flex items-center gap-3 text-xs mt-1">
                                  <span className="text-[rgb(var(--color-success))]">
                                    ✓ Completed
                                  </span>

                                  {assignees.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      {assignees.slice(0, 3).map((assignee) => (
                                        <Avatar
                                          key={assignee!.id}
                                          name={assignee!.name}
                                          size="sm"
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
