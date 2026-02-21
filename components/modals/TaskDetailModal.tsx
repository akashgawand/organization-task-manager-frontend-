"use client";

import { Task, SubTask, Comment } from "@/features/tasks/types";
import {
  X,
  Calendar,
  Clock,
  Paperclip,
  MessageSquare,
  User,
  Tag,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { PriorityBadge, StatusBadge } from "@/components/shared/Badge";
import Avatar from "@/components/shared/Avatar";
import { formatDate, calculateTaskProgress } from "@/lib/utils";
import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/features/permissions";
import { taskService } from "@/app/services/taskServices";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubtaskToggle?: (taskId: string, subtaskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
}

// Map frontend status values → backend uppercase enums
function toBackendStatus(status: string): string {
  const map: Record<string, string> = {
    todo: "TODO",
    in_progress: "IN_PROGRESS",
    review: "REVIEW",
    under_review: "REVIEW",
    blocked: "BLOCKED",
    done: "DONE",
    completed: "DONE",
    submitted: "IN_PROGRESS", // no SUBMITTED in this backend — keep as IN_PROGRESS
    verified: "DONE",
    rejected: "BLOCKED",
  };
  return map[status.toLowerCase()] ?? status.toUpperCase();
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onSubtaskToggle,
  onStatusChange,
}: TaskDetailModalProps) {
  const { user } = useAuth();
  const [localTask, setLocalTask] = useState<Task | null>(task);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const prevTaskIdRef = useRef<string | null>(null);

  const canAddComment = !!user;

  // ── Fetch full task data (with subtasks + comments) from backend on open ────
  useEffect(() => {
    if (!isOpen || !task?.id) return;
    // Only re-fetch when it's a different task or first open
    if (task.id === prevTaskIdRef.current) return;
    prevTaskIdRef.current = task.id;

    const fetchFull = async () => {
      setIsRefreshing(true);
      try {
        const full = await taskService.getTaskById(task.id);
        if (full) setLocalTask(full);
      } catch (err) {
        console.error("Failed to fetch task details:", err);
        setLocalTask(task); // fallback to prop
      } finally {
        setIsRefreshing(false);
      }
    };
    fetchFull();
  }, [isOpen, task?.id]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      prevTaskIdRef.current = null;
      setNewComment("");
      setSaveError(null);
    }
  }, [isOpen]);

  // Sync localTask if prop changes to a different task before useEffect fires
  if (task && task.id !== localTask?.id) {
    setLocalTask(task);
  }

  // ── Comment ─────────────────────────────────────────────────────────────────
  const handleAddComment = useCallback(async () => {
    if (!localTask || !user || !newComment.trim() || isPostingComment) return;

    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      taskId: localTask.id,
      userId: user.id || "",
      content: newComment,
      mentions: [],
      reactions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // attach author info so Avatar renders immediately
    (optimisticComment as any).authorName = user.name;
    (optimisticComment as any).authorAvatar = user.avatar;

    const previousComments = localTask.comments || [];
    setLocalTask({
      ...localTask,
      comments: [...previousComments, optimisticComment],
    });
    setNewComment("");
    setIsPostingComment(true);

    try {
      await taskService.addComment(localTask.id, optimisticComment.content);
    } catch (err) {
      console.error("Failed to post comment:", err);
      setLocalTask((prev) =>
        prev ? { ...prev, comments: previousComments } : prev,
      );
      setNewComment(optimisticComment.content);
    } finally {
      setIsPostingComment(false);
    }
  }, [localTask, user, newComment, isPostingComment]);

  // ── Subtask toggle — optimistic, then PATCH backend ─────────────────────────
  const handleSubtaskToggle = useCallback(
    async (subtaskId: string) => {
      if (!localTask) return;

      const prevSubtasks = localTask.subtasks;
      const updatedSubtasks = prevSubtasks.map((st) =>
        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st,
      );
      setLocalTask({ ...localTask, subtasks: updatedSubtasks });
      onSubtaskToggle?.(localTask.id, subtaskId);

      try {
        // Send the full subtask array; backend delete-then-recreates them
        await taskService.updateTask(localTask.id, {
          subtasks: updatedSubtasks.map((s) => ({
            subtask_id: Number(s.id),
            title: s.title,
            is_completed: s.isCompleted,
          })),
        });
      } catch (err) {
        console.error("Failed to update subtask:", err);
        // Rollback
        setLocalTask((prev) =>
          prev ? { ...prev, subtasks: prevSubtasks } : prev,
        );
      }
    },
    [localTask, onSubtaskToggle],
  );

  // ── Status change — optimistic, then PATCH backend ───────────────────────────
  const handleStatusChange = useCallback(
    async (newStatus: Task["status"]) => {
      if (!localTask) return;

      const prevStatus = localTask.status;
      setLocalTask({ ...localTask, status: newStatus });
      onStatusChange?.(localTask.id, newStatus);

      try {
        await taskService.updateTaskStatus(
          localTask.id,
          toBackendStatus(newStatus),
        );
      } catch (err: any) {
        console.error("Failed to update status:", err);
        setSaveError(err?.message || "Status update failed");
        // Rollback
        setLocalTask((prev) => (prev ? { ...prev, status: prevStatus } : prev));
      }
    },
    [localTask, onStatusChange],
  );

  // ── Submit for Review — moves IN_PROGRESS → REVIEW ─────────────────────────
  const handleSubmitForReview = useCallback(async () => {
    if (!localTask || isSaving) return;
    setSaveError(null);
    setIsSaving(true);
    const prevStatus = localTask.status;
    setLocalTask((prev) => (prev ? { ...prev, status: "review" } : prev));
    onStatusChange?.(localTask.id, "review");
    try {
      await taskService.updateTaskStatus(localTask.id, "REVIEW");
    } catch (err: any) {
      console.error("Submit for review failed:", err);
      setSaveError(err?.message || "Could not submit for review");
      setLocalTask((prev) => (prev ? { ...prev, status: prevStatus } : prev));
    } finally {
      setIsSaving(false);
    }
  }, [localTask, isSaving, onStatusChange]);

  const handleSave = useCallback(async () => {
    if (!localTask || isSaving) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      await taskService.updateTask(localTask.id, {
        title: localTask.title,
        description: localTask.description,
        priority: localTask.priority.toUpperCase(),
        deadline: localTask.dueDate,
        status: toBackendStatus(localTask.status),
        subtasks: localTask.subtasks.map((s) => ({
          subtask_id: Number(s.id),
          title: s.title,
          is_completed: s.isCompleted,
        })),
      });
      onClose();
    } catch (err: any) {
      console.error("Failed to save task:", err);
      setSaveError(err?.message || "Save failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [localTask, isSaving, onClose]);

  // ── Manual refresh ───────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    if (!localTask?.id || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const full = await taskService.getTaskById(localTask.id);
      if (full) setLocalTask(full);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [localTask?.id, isRefreshing]);

  if (!isOpen || !localTask) return null;

  const assignees: {
    id: string;
    name: string;
    avatar?: string;
    position?: string;
  }[] = (localTask as any).assignees || [];
  const progress = calculateTaskProgress(localTask.subtasks);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-60 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4 overflow-hidden">
        <div className="bg-[rgb(var(--color-surface))] rounded-lg shadow-2xl max-w-3xl w-full flex flex-col max-h-[75vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-[rgb(var(--color-border))]">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-3 mb-2">
                <PriorityBadge priority={localTask.priority} />
                <StatusBadge status={localTask.status} />
                {isRefreshing && (
                  <Loader2 className="w-4 h-4 animate-spin text-[rgb(var(--color-text-tertiary))]" />
                )}
              </div>
              <h2 className="text-xl font-bold mb-1">{localTask.title}</h2>
              <p className="text-[rgb(var(--color-text-secondary))]">
                {localTask.description}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-[rgb(var(--color-surface-hover))] rounded-lg transition-colors"
                title="Refresh task"
              >
                <RefreshCw
                  className={`w-4 h-4 text-[rgb(var(--color-text-tertiary))] ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[rgb(var(--color-surface-hover))] rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto flex-1 min-h-0 p-4 space-y-4">
            {/* Task Metadata */}
            <div className="grid grid-cols-2 gap-4">
              {localTask.dueDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    Due:
                  </span>
                  <span className="font-medium">
                    {formatDate(localTask.dueDate)}
                  </span>
                </div>
              )}
              {localTask.estimatedHours && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                  <span className="text-[rgb(var(--color-text-secondary))]">
                    Estimated:
                  </span>
                  <span className="font-medium">
                    {localTask.estimatedHours}h
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {localTask.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                  <h3 className="font-semibold text-sm">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localTask.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs rounded-full bg-[rgb(var(--color-accent-light))] text-[rgb(var(--color-accent))]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Assignees */}
            {assignees.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                  <h3 className="font-semibold text-sm">Assigned To</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {assignees.map((assignee) => (
                    <div
                      key={assignee.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgb(var(--color-surface-hover))]"
                    >
                      <Avatar
                        name={assignee.name}
                        avatar={assignee.avatar}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium">{assignee.name}</p>
                        {assignee.position && (
                          <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                            {assignee.position}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subtasks */}
            {localTask.subtasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">
                    Subtasks (
                    {localTask.subtasks.filter((st) => st.isCompleted).length}/
                    {localTask.subtasks.length})
                  </h3>
                  <div className="text-sm text-[rgb(var(--color-text-secondary))]">
                    {progress}% Complete
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-[rgb(var(--color-border))] rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-[rgb(var(--color-accent))] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Subtask List */}
                <div className="space-y-2">
                  {localTask.subtasks.map((subtask: SubTask) => (
                    <label
                      key={subtask.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-surface-hover))] cursor-pointer transition-all group"
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={subtask.isCompleted}
                          onChange={() => handleSubtaskToggle(subtask.id)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            subtask.isCompleted
                              ? "bg-[rgb(var(--color-accent))] border-[rgb(var(--color-accent))]"
                              : "bg-transparent border-[rgb(var(--color-border))] group-hover:border-[rgb(var(--color-accent))]"
                          }`}
                        >
                          {subtask.isCompleted && (
                            <svg
                              className="w-3 h-3 text-white"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M10 3L4.5 8.5L2 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span
                        className={`flex-1 text-sm transition-all ${
                          subtask.isCompleted
                            ? "text-[rgb(var(--color-text-tertiary))] line-through"
                            : "text-[rgb(var(--color-text-primary))]"
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {localTask.attachments && localTask.attachments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                  <h3 className="font-semibold text-sm">
                    Attachments ({localTask.attachments.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {localTask.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))] transition-colors"
                    >
                      <Paperclip className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                <h3 className="font-semibold text-sm">
                  Comments ({localTask.comments?.length || 0})
                </h3>
              </div>

              <div className="space-y-4 mb-4">
                {localTask.comments?.map((comment) => {
                  const c = comment as any;
                  const authorName =
                    c.authorName ||
                    (comment.userId === user?.id ? user?.name : null) ||
                    "Unknown";
                  const authorAvatar =
                    c.authorAvatar ||
                    (comment.userId === user?.id ? user?.avatar : undefined);
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar
                        name={authorName}
                        avatar={authorAvatar}
                        size="sm"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {authorName}
                          </span>
                          <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-surface-hover))] p-3 rounded-lg rounded-tl-none">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {canAddComment ? (
                <div className="flex gap-3">
                  <Avatar
                    name={user?.name || "User"}
                    avatar={user?.avatar}
                    size="sm"
                  />
                  <div className="flex-1 gap-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                          handleAddComment();
                      }}
                      placeholder="Write a comment… (Ctrl+Enter to submit)"
                      className="w-full px-3 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] focus:border-[rgb(var(--color-accent))] min-h-[80px] text-sm resize-y"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isPostingComment}
                        className="btn btn-primary text-sm py-1.5 px-3 disabled:opacity-60"
                      >
                        {isPostingComment ? "Posting…" : "Post Comment"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-[rgb(var(--color-surface-hover))] rounded-lg text-sm text-[rgb(var(--color-text-tertiary))]">
                  You do not have permission to add comments.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
            {/* ── 100% subtask completion banner ── */}
            {progress === 100 && localTask.status === "in_progress" && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[rgb(var(--color-success-light))] border-b border-[rgb(var(--color-border))]">
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-success))] font-medium">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M13.5 4.5L6.5 11.5L2.5 7.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  All subtasks complete — ready for review!
                </div>
                <button
                  onClick={handleSubmitForReview}
                  disabled={isSaving}
                  className="btn btn-sm text-sm py-1.5 px-4 flex items-center gap-2 font-semibold"
                  style={{
                    background: "rgb(var(--color-success))",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  Submit for Review
                </button>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <select
                  value={localTask.status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as Task["status"])
                  }
                  className="px-3 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-accent))] transition-colors text-sm"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Under Review</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
                {saveError && (
                  <span className="text-xs text-[rgb(var(--color-danger))]">
                    {saveError}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                {/* Submit for Review — shown when in_progress regardless of subtasks */}
                {localTask.status === "in_progress" && (
                  <button
                    onClick={handleSubmitForReview}
                    disabled={isSaving || isRefreshing}
                    className="btn disabled:opacity-60 flex items-center gap-2 font-semibold"
                    style={{
                      background: "rgb(var(--color-accent))",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                    }}
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit for Review
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || isRefreshing}
                  className="btn btn-primary disabled:opacity-60 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
