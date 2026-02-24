"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Flag,
  Paperclip,
  Briefcase,
  Plus,
  Search,
  Loader2,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/features/permissions";
import { projectService } from "@/app/services/projectServices";
import { userService } from "@/app/services/userServices";
import { teamService } from "@/app/services/teamServices";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { TaskPriority, Team } from "@/types";

const ROLE_RANK: Record<string, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  TEAM_LEAD: 3,
  SENIOR_DEVELOPER: 2,
  EMPLOYEE: 1,
};

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => Promise<void> | void;
  defaultProjectId?: string;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  defaultProjectId,
}: CreateTaskModalProps) {
  const { user } = useAuth();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [subtasks, setSubtasks] = useState<{ title: string }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);

  // Data state
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const isEmployee = (user?.role ?? "").toUpperCase() === "EMPLOYEE";
  const currentUserId = String(user?.id ?? "");

  useEffect(() => {
    if (!isOpen) return;

    // Reset form on open
    setTitle("");
    setDescription("");
    setProjectId(defaultProjectId || "");
    // Employees are always auto-assigned to themselves
    setAssigneeIds(isEmployee && currentUserId ? [currentUserId] : []);
    setPriority("medium");
    setDueDate("");
    setSubtasks([]);
    setNewSubtaskTitle("");
    setError(null);
    setAssigneeSearch("");

    // Fetch real data
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        if (isEmployee) {
          // EMPLOYEEs cannot call GET /users (requires Manager/Admin).
          // Synthesise a single-entry list from their own auth data.
          const [projects, teamsRes] = await Promise.all([
            projectService.getProjects(),
            teamService.getTeams().catch(() => []),
          ]);
          setAvailableProjects(Array.isArray(projects) ? projects : []);

          const userTeams = Array.isArray((teamsRes as any)?.data)
            ? (teamsRes as any).data
            : Array.isArray(teamsRes)
              ? teamsRes
              : [];
          setAvailableTeams(userTeams as Team[]);

          setAvailableUsers(
            user
              ? [
                  {
                    id: String(user.id),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                  },
                ]
              : [],
          );
        } else {
          const [projects, usersRes, teamsRes] = await Promise.all([
            projectService.getProjects(),
            userService.getUsers(),
            teamService.getTeams().catch(() => []),
          ]);
          setAvailableProjects(Array.isArray(projects) ? projects : []);

          const rawTeams = Array.isArray((teamsRes as any)?.data)
            ? (teamsRes as any).data
            : Array.isArray(teamsRes)
              ? teamsRes
              : [];
          setAvailableTeams(rawTeams as Team[]);

          const rawUsers: any[] = Array.isArray(usersRes?.data)
            ? usersRes.data
            : Array.isArray(usersRes)
              ? usersRes
              : [];
          setAvailableUsers(rawUsers);
        }
      } catch (err) {
        console.error("Failed to load modal data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [isOpen, defaultProjectId, isEmployee, currentUserId, user]);

  // Hierarchical visibility check
  const visibleUsers = availableUsers.filter((u) => {
    const assignerRole = (user?.role ?? "").toUpperCase();
    const assigneeRole = (u.role ?? "").toUpperCase();
    const assignerId = String(user?.id ?? "");
    const assigneeId = String(u.id ?? "");

    const hasPermission = () => {
      if (assignerRole === "SUPER_ADMIN") return true;
      if (assignerId === assigneeId) return true;
      const aRank = ROLE_RANK[assignerRole] || 0;
      const bRank = ROLE_RANK[assigneeRole] || 0;
      return aRank > bRank;
    };

    if (!hasPermission()) return false;

    if (!assigneeSearch) return true;
    const q = assigneeSearch.toLowerCase();
    return (
      (u.name || u.full_name || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, any> = {
        title: title.trim(),
        description: description.trim() || undefined,
        project_id: Number(projectId),
        priority: priority.toUpperCase(),
        deadline: dueDate || undefined,
      };

      if (assigneeIds.length > 0) {
        payload.assignee_ids = assigneeIds.map(Number);
      }

      if (subtasks.length > 0) {
        payload.subtasks = subtasks;
      }

      await onSubmit(payload);
      // Parent handles onClose on success
    } catch (err: any) {
      setError(err?.message || "Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      const newProject = await projectService.createProject(projectData);
      // Refresh project list
      const projects = await projectService.getProjects();
      setAvailableProjects(projects);

      // Select the new project (handle both direct object and {data: ...} response)
      const resData = (newProject as any).data || newProject;
      const newId = String(resData.id || resData.project_id || "");
      if (newId) {
        setProjectId(newId);
      }
      setIsCreateProjectModalOpen(false);
    } catch (err) {
      console.error("Failed to create project from task modal:", err);
      // We could set a local error state here if needed, but the modal itself
      // might handle its own errors. For now, just log and close if it fails.
      setIsCreateProjectModalOpen(false);
    }
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim() }]);
    setNewSubtaskTitle("");
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleTeamSelection = (teamId: string) => {
    if (!teamId) return;
    const team = availableTeams.find((t) => t.id === teamId);
    if (!team) return;
    const newMemberIds = ((team as any).members || team.memberIds || []).map(
      (m: any) => String(m.userId || m.id || m),
    );

    // Add member IDs that aren't already selected
    const updatedAssignees = [...new Set([...assigneeIds, ...newMemberIds])];
    setAssigneeIds(updatedAssignees);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 "
      onClick={onClose}
    >
      <div
        className="bg-[rgb(var(--color-surface))] max-h-[85vh] overflow-y-auto rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
          <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="text-[rgb(var(--color-text-tertiary))] hover:bg-[rgb(var(--color-surface-hover))] p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Error */}
            {error && (
              <div className="px-4 py-3 bg-[rgb(var(--color-error-light))] border border-[rgb(var(--color-error))] rounded-lg text-sm text-[rgb(var(--color-error))]">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                Task Title{" "}
                <span className="text-[rgb(var(--color-error))]">*</span>
              </label>
              <input
                type="text"
                required
                minLength={3}
                className="w-full px-4 py-2 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))]"
                placeholder="e.g., Redesign Homepage Hero Section"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))] resize-none"
                placeholder="Add details about the task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Subtasks (Checklist) - Microsoft Planner Inspired */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--color-text-primary))]">
                <CheckCircle2 className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                <span>Checklist</span>
                {subtasks.length > 0 && (
                  <span className="text-xs font-normal text-[rgb(var(--color-text-tertiary))] ml-1">
                    ({subtasks.length} items)
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {subtasks.map((sub, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-3 p-2 border border-transparent hover:border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-hover))] rounded-lg transition-all"
                  >
                    <div className="w-4 h-4 rounded-full border border-[rgb(var(--color-border))] shrink-0" />
                    <span className="flex-1 text-sm text-[rgb(var(--color-text-secondary))]">
                      {sub.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSubtask(index)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-error))] transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border-b border-transparent hover:border-[rgb(var(--color-border))] focus:border-[rgb(var(--color-accent))] focus:outline-none transition-all placeholder:text-[rgb(var(--color-text-tertiary))] text-[rgb(var(--color-text-primary))]"
                    placeholder="Add an item"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSubtask();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSubtask}
                    disabled={!newSubtaskTitle.trim()}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 hover:text-[rgb(var(--color-accent))] transition-colors disabled:opacity-50 text-[rgb(var(--color-text-tertiary))]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Select */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                  Project{" "}
                  <span className="text-[rgb(var(--color-error))]">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                    <select
                      required
                      className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))] appearance-none disabled:opacity-50"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      disabled={isLoadingData}
                    >
                      <option value="">
                        {isLoadingData
                          ? "Loading projects..."
                          : "Select Project"}
                      </option>
                      {availableProjects.map((p) => {
                        const pid = String(p.id || p.project_id || "");
                        return (
                          <option key={pid} value={pid}>
                            {p.name || "Unnamed Project"}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreateProjectModalOpen(true)}
                    className="px-3 py-2 border border-[rgb(var(--color-border))] rounded-lg hover:bg-[rgb(var(--color-surface-hover))] hover:border-[rgb(var(--color-accent))] transition-colors text-[rgb(var(--color-text-secondary))]"
                    title="Create New Project"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Assignees */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                    Assignees
                  </label>
                  {assigneeIds.length > 0 && (
                    <span className="text-xs text-[rgb(var(--color-accent))] font-medium">
                      {assigneeIds.length} selected
                    </span>
                  )}
                </div>

                {/* New: Assign Team directly */}
                {!isEmployee && (
                  <div className="mb-2">
                    <select
                      onChange={(e) => {
                        handleTeamSelection(e.target.value);
                        e.target.value = ""; // Reset to placeholder after select
                      }}
                      className="w-full text-xs px-2 py-1.5 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] focus:outline-none focus:border-[rgb(var(--color-accent))]"
                    >
                      <option value="">+ Assign entire Team...</option>
                      {availableTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="border border-[rgb(var(--color-border))] rounded-lg max-h-52 overflow-hidden bg-[rgb(var(--color-surface))] flex flex-col">
                  <div className="p-2 border-b border-[rgb(var(--color-border))]">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgb(var(--color-text-tertiary))]" />
                      <input
                        type="text"
                        placeholder="Search by name or role..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-[rgb(var(--color-border))] bg-transparent text-[rgb(var(--color-text-primary))] rounded-md focus:outline-none focus:border-[rgb(var(--color-accent))] focus:ring-1 focus:ring-[rgb(var(--color-accent))]/20"
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto p-1 flex-1">
                    {isLoadingData ? (
                      <p className="text-xs text-[rgb(var(--color-text-tertiary))] p-3 text-center">
                        Loading users...
                      </p>
                    ) : visibleUsers.length === 0 ? (
                      <p className="text-xs text-[rgb(var(--color-text-tertiary))] p-3 text-center">
                        {availableUsers.length === 0
                          ? "No users available."
                          : "No users match your search."}
                      </p>
                    ) : (
                      <div className="space-y-0.5">
                        {visibleUsers.map((u: any) => {
                          const uid = String(u.id ?? "");
                          return (
                            <label
                              key={uid}
                              className="flex items-center gap-2 p-2 rounded hover:bg-[rgb(var(--color-surface-hover))] cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={assigneeIds.includes(uid)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssigneeIds([...assigneeIds, uid]);
                                  } else {
                                    setAssigneeIds(
                                      assigneeIds.filter((id) => id !== uid),
                                    );
                                  }
                                }}
                                className="w-4 h-4 text-[rgb(var(--color-accent))] border-[rgb(var(--color-border))] rounded focus:ring-[rgb(var(--color-accent))]"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate">
                                  {u.name || u.full_name}
                                  {uid === currentUserId ? " (You)" : ""}
                                </p>
                                <p className="text-xs text-[rgb(var(--color-text-tertiary))] truncate capitalize">
                                  {(u.role || "")
                                    .toLowerCase()
                                    .replace("_", " ")}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))]"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
                  Priority
                </label>
                <div className="relative">
                  <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                  <select
                    className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/20 focus:border-[rgb(var(--color-accent))] appearance-none"
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as TaskPriority)
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Attachments (placeholder) */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                Attachments
              </label>
              <div className="border-2 border-dashed border-[rgb(var(--color-border))] rounded-xl p-8 text-center hover:border-[rgb(var(--color-accent))]/50 hover:bg-[rgb(var(--color-surface-hover))] transition-colors cursor-pointer">
                <Paperclip className="w-8 h-8 text-[rgb(var(--color-text-tertiary))] mx-auto mb-2" />
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-1">
                  SVG, PNG, JPG or PDF (max. 10MB)
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-surface-hover))] rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingData}
              className="btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
