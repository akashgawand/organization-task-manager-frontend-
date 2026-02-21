"use client";

import { Task } from "@/types";
import { PriorityBadge, StatusBadge } from "./Badge";
import Avatar from "./Avatar";
import { Clock, Paperclip, MessageSquare } from "lucide-react";
import { formatDate, calculateTaskProgress } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const progress = calculateTaskProgress(task.subtasks);

  // Use real assignees from backend (mapped in taskService), not mockData
  const assignees: { id: string; name: string; avatar?: string }[] =
    (task as any).assignees || [];

  return (
    <div
      className="card hover:shadow-lg cursor-pointer transition-all group"
      onClick={onClick}
    >
      {/* Priority & Status */}
      <div className="flex items-center justify-between mb-3">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
      </div>

      {/* Title & Description */}
      <h4 className="font-semibold mb-2 group-hover:text-[rgb(var(--color-accent))] transition-colors">
        {task.title}
      </h4>
      <p className="text-sm text-[rgb(var(--color-text-secondary))] line-clamp-2 mb-4">
        {task.description}
      </p>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 text-xs rounded bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-tertiary))]">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar (if has subtasks) */}
      {task.subtasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-[rgb(var(--color-text-secondary))] mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-[rgb(var(--color-border))] rounded-full overflow-hidden">
            <div
              className="h-full bg-[rgb(var(--color-accent))] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-[rgb(var(--color-text-tertiary))]">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">{formatDate(task.dueDate)}</span>
            </div>
          )}
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-4 h-4" />
              <span className="text-xs">{task.attachments.length}</span>
            </div>
          )}
          {(task as any).commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">{(task as any).commentCount}</span>
            </div>
          )}
        </div>

        {/* Assignees */}
        <div className="flex -space-x-2">
          {assignees.slice(0, 3).map((assignee, index) => (
            <div key={assignee.id} style={{ zIndex: 3 - index }}>
              <Avatar name={assignee.name} avatar={assignee.avatar} size="sm" />
            </div>
          ))}
          {assignees.length > 3 && (
            <div
              className="w-8 h-8 flex-center rounded-full bg-[rgb(var(--color-surface-hover))] text-xs font-medium border-2 border-[rgb(var(--color-surface))]"
              style={{ zIndex: 0 }}
            >
              +{assignees.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
