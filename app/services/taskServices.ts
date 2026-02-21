import { api } from "./api";

// Normalize backend status values to frontend lowercase values
function normalizeStatus(status: string): string {
  const s = (status || "").toUpperCase();
  // CREATED and ASSIGNED are unstarted tasks — map to "todo"
  if (s === "CREATED" || s === "ASSIGNED") return "todo";
  return s.toLowerCase(); // in_progress, review, done, blocked, todo
}

// Map a raw backend task to the frontend Task shape
function mapTask(t: any) {
  return {
    ...t,
    id: String(t.task_id || t.id),
    title: t.title,
    description: t.description || "",
    status: normalizeStatus(t.status),
    priority: t.priority ? t.priority.toLowerCase() : "medium",
    projectId: String(t.project_id || t.projectId),
    phaseId: t.phase_id ? String(t.phase_id) : undefined,
    // Backend returns assignees[] (many-to-many)
    assigneeIds: Array.isArray(t.assignees)
      ? t.assignees.map((a: any) => String(a.user_id))
      : t.assignee
      ? [String(t.assignee.user_id)]
      : [],
    // Keep full assignee objects for display (no mockData needed)
    assignees: Array.isArray(t.assignees)
      ? t.assignees.map((a: any) => ({
          id: String(a.user_id),
          name: a.full_name || a.name || "Unknown",
          avatar: a.avatar || undefined,
          email: a.email,
        }))
      : [],
    creatorId: t.creator ? String(t.creator.user_id) : undefined,
    creatorName: t.creator?.full_name,
    createdAt: t.created_at || t.createdAt,
    updatedAt: t.updated_at || t.updatedAt,
    dueDate: t.deadline || t.dueDate,
    tags: t.tags?.map((tag: any) => tag.name || tag) || [],
    // Map backend subtask shape → frontend SubTask shape
    subtasks: Array.isArray(t.subtasks)
      ? t.subtasks.map((s: any) => ({
          id: String(s.subtask_id || s.id),
          title: s.title,
          isCompleted: s.is_completed ?? s.isCompleted ?? false,
          createdAt: s.created_at || s.createdAt || new Date(),
        }))
      : [],
    // Map backend comment shape to frontend Comment shape
    comments: Array.isArray(t.comments)
      ? t.comments.map((c: any) => ({
          id: String(c.comment_id || c.id),
          taskId: String(t.task_id || t.id),
          userId: String(c.user_id || c.user?.user_id),
          // Carry author name so the modal can display without a separate lookup
          authorName: c.user?.full_name || c.authorName,
          authorAvatar: c.user?.avatar || c.authorAvatar,
          content: c.content,
          mentions: c.mentions || [],
          reactions: c.reactions || [],
          createdAt: c.created_at || c.createdAt,
          updatedAt: c.updated_at || c.updatedAt,
        }))
      : [],
    attachments: t.attachments || [],
    dependencies: t.dependencies || [],
    position: t.position ?? 0,
  };
}

export const taskService = {
  async getTasks(params?: Record<string, any>) {
    const response = await api.get("/tasks", params);
    // Handle paginated response: { data: [...], pagination: {...} }
    if (response?.data && Array.isArray(response.data)) {
      return { ...response, data: response.data.map(mapTask) };
    }
    // Handle flat array
    if (Array.isArray(response)) {
      return { data: response.map(mapTask), pagination: null };
    }
    return { data: [], pagination: null };
  },

  async getTaskById(id: string) {
    const data = await api.get(`/tasks/${id}`);
    if (data) return mapTask(data);
    return null;
  },

  async createTask(taskData: any) {
    return api.post("/tasks", taskData);
  },

  async updateTask(id: string, taskData: any) {
    return api.put(`/tasks/${id}`, taskData);
  },

  async updateTaskStatus(id: string, status: string) {
    // Map frontend lowercase status back to backend uppercase
    const backendStatus = status.toUpperCase();
    return api.patch(`/tasks/${id}/status`, { status: backendStatus });
  },

  async assignTask(id: string, userIds: string | string[]) {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    return api.patch(`/tasks/${id}/assign`, { assignee_ids: ids.map(Number) });
  },

  async addComment(taskId: string, content: string) {
    return api.post(`/tasks/${taskId}/comments`, { content });
  },

  async deleteTask(id: string) {
    return api.delete(`/tasks/${id}`);
  },
};
