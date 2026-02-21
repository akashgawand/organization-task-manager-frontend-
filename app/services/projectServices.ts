import { api } from "./api";
import { calculateProjectHealth } from "@/features/projects/types";
import type { ExtendedProject, Phase } from "@/features/projects/types";

// Map a raw backend project to ExtendedProject shape
function mapProject(p: any): ExtendedProject {
  const status = (p.status || "PLANNING").toLowerCase() as any;
  const normalizedStatus = status === "cancelled" ? "cancelled" : status;

  // Derive health from progress + endDate overdue
  const daysUntilDeadline = p.end_date
    ? Math.ceil(
        (new Date(p.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : 999;
  const overdueTasks =
    p.total_overdue_tasks ?? 0; // backend may not send; default 0
  const health = calculateProjectHealth(
    p.progress ?? 0,
    daysUntilDeadline,
    overdueTasks
  );

  // Map team members (from team.members or members field)
  const rawMembers: any[] = p.team?.members || p.members || [];
  const members = rawMembers.map((m: any) => ({
    userId: String(m.user_id),
    name: m.full_name || m.name || "Unknown",
    avatar: m.avatar || undefined,
    role: "member" as const,
    joinedAt: new Date(),
  }));

  // If creator exists and not already in members, add as owner
  if (p.creator) {
    const creatorId = String(p.creator.user_id);
    if (!members.find((m) => m.userId === creatorId)) {
      members.unshift({
        userId: creatorId,
        name: p.creator.full_name || "Unknown",
        avatar: p.creator.avatar || undefined,
        role: "owner" as const,
        joinedAt: new Date(p.created_at),
      });
    } else {
      // Mark the creator as owner
      const creator = members.find((m) => m.userId === creatorId);
      if (creator) creator.role = "owner";
    }
  }

  // Map phases
  const phases: Phase[] = (p.phases || []).map((ph: any, idx: number) => ({
    id: String(ph.phase_id),
    name: ph.name,
    order: ph.display_order ?? idx + 1,
    color: PHASE_COLORS[idx % PHASE_COLORS.length],
    status: (ph.status || "PLANNING").toLowerCase() as any,
    startDate: ph.start_date ? new Date(ph.start_date) : undefined,
    endDate: ph.end_date ? new Date(ph.end_date) : undefined,
    taskCount: ph._count?.tasks ?? 0,
    completionPercentage: 0,
  }));

  return {
    id: String(p.project_id || p.id),
    name: p.name,
    description: p.description || "",
    status: normalizedStatus,
    health,
    progress: p.progress ?? 0,
    startDate: p.start_date ? new Date(p.start_date) : new Date(p.created_at),
    endDate: p.end_date ? new Date(p.end_date) : undefined,
    members,
    phases,
    tags: p.tags?.map((t: any) => t.name || t) || [],
    isStarred: false,
    taskCount: p.taskCount ?? p._count?.tasks ?? 0,
    completedTaskCount: p.completedTaskCount ?? 0,
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.updated_at),
    ownerId: p.creator ? String(p.creator.user_id) : undefined,
  };
}

const PHASE_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
];

interface ProjectResponse {
  data?: any[];
  projects?: any[];
  [key: string]: any;
}

export const projectService = {
  async getProjects(params?: Record<string, any>) {
    try {
      const response = await api.get("/projects", params) as ProjectResponse | any[];
      
      // Handle the case where api.get already unwrapped data.data
      if (Array.isArray(response)) {
        return response.map(mapProject);
      }

      // Handle the case where it's still wrapped or has a pagination-like structure
      const rawData = response?.data || response?.projects || [];
      if (Array.isArray(rawData)) {
        return rawData.map(mapProject);
      }
      
      return [];
    } catch (error) {
      console.error("projectService.getProjects failed:", error);
      return [];
    }
  },

  async getProjectById(id: string): Promise<{ data: ExtendedProject } | null> {
    const data = await api.get(`/projects/${id}`);
    if (!data) return null;
    return { data: mapProject(data) };
  },

  async createProject(projectData: any) {
    return api.post("/projects", projectData);
  },

  async updateProject(id: string, projectData: any) {
    return api.put(`/projects/${id}`, projectData);
  },

  async deleteProject(id: string) {
    return api.delete(`/projects/${id}`);
  },
};
