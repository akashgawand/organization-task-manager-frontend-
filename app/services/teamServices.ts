import { api } from "./api";

// ── Shape helpers ──────────────────────────────────────────────────────────────

function mapMember(u: any) {
  return {
    id: String(u.user_id),
    name: u.full_name || u.name || "Unknown",
    email: u.email || "",
    role: u.role ? u.role.toLowerCase() : "employee",
    avatar: u.avatar || undefined,
    department: u.department || undefined,
    position: u.position || undefined,
    isOnline: u.is_online ?? false,
    skills: u.skills || [],
  };
}

function mapProject(p: any) {
  return {
    id: String(p.project_id || p.id),
    name: p.name,
    description: p.description || "",
    status: p.status ? p.status.toLowerCase() : "active",
    progress: p.progress ?? 0,
    health: p.health || "green",
    endDate: p.end_date || p.endDate || null,
    members: p.members || [],
  };
}

export function mapTeam(t: any) {
  const members = Array.isArray(t.members) ? t.members.map(mapMember) : [];
  const projects = Array.isArray(t.projects) ? t.projects.map(mapProject) : [];
  const lead = t.lead ? mapMember(t.lead) : undefined;

  return {
    id: String(t.team_id || t.id),
    name: t.name,
    description: t.description || "",
    status: t.status ? t.status.toLowerCase() : "active",
    avatar: t.avatar || undefined,
    leadId: lead?.id,
    lead,
    members,
    memberIds: members.map((m: any) => m.id),
    projects,
    projectIds: projects.map((p: any) => p.id),
    projectCount: t._count?.projects ?? projects.length,
    memberCount: t._count?.members ?? members.length,
    createdAt: t.created_at || t.createdAt,
    updatedAt: t.updated_at || t.updatedAt,
  };
}

// ── Service ────────────────────────────────────────────────────────────────────

export const teamService = {
  async getTeams(params?: Record<string, any>) {
    const response = await api.get("/teams", params);
    // api.ts unwraps data.data, so response may be: flat array, {data:[],pagination} or raw
    const rows: any[] =
      Array.isArray(response) ? response
      : Array.isArray(response?.data) ? response.data
      : [];
    return {
      data: rows.map(mapTeam),
      pagination: response?.pagination ?? null,
    };
  },

  async getTeamById(id: string) {
    const data = await api.get(`/teams/${id}`);
    return data ? mapTeam(data) : null;
  },

  async createTeam(teamData: {
    name: string;
    description?: string;
    lead_id: number;
    member_ids?: number[];
  }) {
    const created = await api.post("/teams", teamData);
    return created ? mapTeam(created) : null;
  },

  async updateTeam(
    id: string,
    teamData: { name?: string; description?: string; lead_id?: number; status?: string },
  ) {
    const updated = await api.put(`/teams/${id}`, teamData);
    return updated ? mapTeam(updated) : null;
  },

  async deleteTeam(id: string) {
    return api.delete(`/teams/${id}`);
  },

  /** Add a single member */
  async addMember(teamId: string, userId: string) {
    return api.post(`/teams/${teamId}/members`, { user_id: Number(userId) });
  },

  /** Add multiple members sequentially (backend only supports one at a time) */
  async addMembers(teamId: string, userIds: string[]) {
    const results = [];
    for (const uid of userIds) {
      try {
        const r = await api.post(`/teams/${teamId}/members`, { user_id: Number(uid) });
        results.push(r);
      } catch (e) {
        console.error(`Failed to add member ${uid}:`, e);
      }
    }
    return results;
  },

  async removeMember(teamId: string, userId: string) {
    return api.delete(`/teams/${teamId}/members/${userId}`);
  },
};
