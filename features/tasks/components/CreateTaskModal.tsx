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
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { TaskPriority } from "@/types";

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
          const [projects] = await Promise.all([projectService.getProjects()]);
          setAvailableProjects(Array.isArray(projects) ? projects : []);
          console.log("Loaded projects for dropdown:", projects);
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
          const [projects, usersRes] = await Promise.all([
            projectService.getProjects(),
            userService.getUsers(),
          ]);
          setAvailableProjects(Array.isArray(projects) ? projects : []);
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

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <div
        className="bg-white max-h-[85vh] overflow-y-auto rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Error */}
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                minLength={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g., Redesign Homepage Hero Section"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Add details about the task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Subtasks (Checklist) - Microsoft Planner Inspired */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-gray-400" />
                <span>Checklist</span>
                {subtasks.length > 0 && (
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    ({subtasks.length} items)
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {subtasks.map((sub, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-3 p-2 border border-transparent hover:border-gray-100 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                    <span className="flex-1 text-sm text-gray-600">
                      {sub.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSubtask(index)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-9 pr-4 py-2 text-sm border-b border-transparent hover:border-gray-200 focus:border-primary focus:outline-none transition-all placeholder:text-gray-400"
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-[#0043F6] hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
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
                    className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-colors"
                    title="Create New Project"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Assignees */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Assignees
                  </label>
                  {assigneeIds.length > 0 && (
                    <span className="text-xs text-primary font-medium">
                      {assigneeIds.length} selected
                    </span>
                  )}
                </div>
                <div className="border border-gray-200 rounded-lg max-h-52 overflow-hidden bg-white flex flex-col">
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or role..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        value={assigneeSearch}
                        onChange={(e) => setAssigneeSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto p-1 flex-1">
                    {isLoadingData ? (
                      <p className="text-xs text-gray-400 p-3 text-center">
                        Loading users...
                      </p>
                    ) : visibleUsers.length === 0 ? (
                      <p className="text-xs text-gray-500 p-3 text-center">
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
                              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
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
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {u.name || u.full_name}
                                  {uid === currentUserId ? " (You)" : ""}
                                </p>
                                <p className="text-xs text-gray-500 truncate capitalize">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <div className="relative">
                  <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  SVG, PNG, JPG or PDF (max. 10MB)
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 disabled:opacity-50"
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
