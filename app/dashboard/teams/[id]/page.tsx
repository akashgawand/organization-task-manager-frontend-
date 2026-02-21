"use client";

import { use, useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/features/permissions";
import { teamService } from "@/app/services/teamServices";
import { taskService } from "@/app/services/taskServices";
import AddMemberModal from "@/features/teams/components/AddMemberModal";
import EditTeamModal from "@/features/teams/components/EditTeamModal";
import {
  Users,
  LayoutDashboard,
  Folder,
  Activity,
  Settings,
  MoreVertical,
  Mail,
  Calendar,
  CheckCircle2,
  PlusCircle,
  Repeat,
  Plus,
  Search,
  X,
  Save,
  Loader2,
  RefreshCw,
  Flag,
  Briefcase,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@/components/shared/Avatar";

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users },
  { id: "projects", label: "Projects", icon: Folder },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TeamWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState("overview");
  const [team, setTeam] = useState<any | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamService.getTeamById(resolvedParams.id);
      setTeam(data);
    } catch (err: any) {
      setError(err?.message || "Team not found");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-accent))]" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !team) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <h2 className="text-2xl font-bold">Team Not Found</h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            {error || "This team does not exist."}
          </p>
          <button onClick={() => router.back()} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const lead = team.lead;
  const members = team.members ?? [];
  const projects = team.projects ?? [];

  const handleTeamUpdated = (updated: any) => {
    setTeam((prev: any) => ({ ...prev, ...updated }));
    setIsEditModalOpen(false);
  };

  const handleMembersAdded = async () => {
    setIsAddMemberModalOpen(false);
    await fetchTeam(); // re-fetch to get updated member list
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            team={team}
            lead={lead}
            members={members}
            projects={projects}
            onViewAllClick={() => setActiveTab("activity")}
          />
        );
      case "members":
        return (
          <MembersTab
            team={team}
            members={members}
            leadId={lead?.id}
            onMemberClick={(m: any) => setSelectedMember(m)}
            currentUser={user}
            onMemberRemoved={fetchTeam}
          />
        );
      case "projects":
        return <ProjectsTab projects={projects} />;
      case "activity":
        return <ActivityTab activities={activities} />;
      case "settings":
        return <SettingsTab team={team} onSaved={handleTeamUpdated} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout user={user}>
      {/* Header */}
      <div className="bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold bg-[rgb(var(--color-surface-hover))]">
                {team.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{team.name}</h1>
                <div className="flex items-center gap-4 text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {members.length} Members
                  </span>
                  <span className="flex items-center gap-1">
                    <Folder className="w-4 h-4" /> {projects.length} Projects
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 capitalize">
                    {team.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="p-2 rounded-lg border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
                onClick={fetchTeam}
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </button>
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setIsAddMemberModalOpen(true)}
              >
                <Plus className="w-4 h-4" /> Add Member
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-[rgb(var(--color-accent))] text-[rgb(var(--color-accent))]"
                      : "border-transparent text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Edit Team Modal */}
      {isEditModalOpen && team && (
        <EditTeamModal
          team={team}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={handleTeamUpdated}
        />
      )}

      {/* Add Member Modal */}
      {isAddMemberModalOpen && team && (
        <AddMemberModal
          team={team}
          currentMembers={members}
          onClose={() => setIsAddMemberModalOpen(false)}
          onAdded={handleMembersAdded}
        />
      )}
    </DashboardLayout>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({
  team,
  lead,
  members,
  projects,
  onViewAllClick,
}: {
  team: any;
  lead?: any;
  members: any[];
  projects: any[];
  onViewAllClick: () => void;
}) {
  const completedProjects = projects.filter(
    (p) => p.status === "completed",
  ).length;
  const avgProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((s, p) => s + (p.progress ?? 0), 0) / projects.length,
        )
      : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Description */}
        <div className="bg-[rgb(var(--color-surface))] p-6 rounded-xl border border-[rgb(var(--color-border))]">
          <h3 className="font-semibold mb-2">About Team</h3>
          <p className="text-[rgb(var(--color-text-secondary))]">
            {team.description || "No description provided."}
          </p>
        </div>

        {/* Recent Members */}
        <div className="bg-[rgb(var(--color-surface))] p-6 rounded-xl border border-[rgb(var(--color-border))]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Team Members</h3>
            <span className="text-sm text-[rgb(var(--color-text-secondary))]">
              {members.length} total
            </span>
          </div>
          <div className="space-y-3">
            {members.slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar name={m.name} avatar={m.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                    {m.position || m.role?.replace("_", " ")}
                  </p>
                </div>
                {m.id === lead?.id && (
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded uppercase font-bold">
                    Lead
                  </span>
                )}
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                No members yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Team Lead */}
        <div className="bg-[rgb(var(--color-surface))] p-6 rounded-xl border border-[rgb(var(--color-border))]">
          <h3 className="text-xs font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide mb-4">
            Team Lead
          </h3>
          {lead ? (
            <div className="flex items-center gap-3">
              <Avatar name={lead.name} avatar={lead.avatar} size="md" />
              <div>
                <p className="font-medium">{lead.name}</p>
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {lead.position || lead.role?.replace("_", " ")}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
              No lead assigned.
            </p>
          )}
        </div>

        {/* Project Stats */}
        <div className="bg-[rgb(var(--color-surface))] p-6 rounded-xl border border-[rgb(var(--color-border))]">
          <h3 className="text-xs font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide mb-4">
            Performance
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Avg Project Progress
                </span>
                <span className="font-semibold text-[rgb(var(--color-accent))]">
                  {avgProgress}%
                </span>
              </div>
              <div className="w-full bg-[rgb(var(--color-border))] rounded-full h-1.5">
                <div
                  className="bg-[rgb(var(--color-accent))] h-1.5 rounded-full"
                  style={{ width: `${avgProgress}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[rgb(var(--color-text-secondary))]">
                Completed Projects
              </span>
              <span className="font-semibold">
                {completedProjects} / {projects.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Members Tab ───────────────────────────────────────────────────────────────

function MembersTab({
  team,
  members,
  leadId,
  onMemberClick,
  currentUser,
  onMemberRemoved,
}: {
  team: any;
  members: any[];
  leadId?: string;
  onMemberClick: (m: any) => void;
  currentUser: any;
  onMemberRemoved: () => void;
}) {
  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);

  const canManage =
    currentUser?.role === "super_admin" ||
    currentUser?.role === "admin" ||
    currentUser?.role === "team_lead";

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove this member from the team?")) return;
    setRemoving(userId);
    try {
      await teamService.removeMember(team.id, userId);
      onMemberRemoved();
    } catch (e) {
      console.error("Remove failed:", e);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden">
      <div className="p-4 border-b border-[rgb(var(--color-border))] flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-sm border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))]"
          />
        </div>
        <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
          {filtered.length} member{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>
      <table className="w-full">
        <thead className="bg-[rgb(var(--color-surface-hover))]">
          <tr className="text-left text-xs font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider">
            <th className="px-6 py-3">Member</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Department</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgb(var(--color-border))]">
          {filtered.map((member) => (
            <tr
              key={member.id}
              className="hover:bg-[rgb(var(--color-surface-hover))] cursor-pointer"
              onClick={() => onMemberClick(member)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} avatar={member.avatar} size="sm" />
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {member.name}
                      {member.id === leadId && (
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded uppercase font-bold">
                          Lead
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                      {member.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-secondary))]">
                {member.position || member.role?.replace("_", " ")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-secondary))]">
                {member.department || "—"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div
                  className="flex items-center justify-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={`mailto:${member.email}`}
                    className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-accent))]"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  {canManage && member.id !== leadId && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      disabled={removing === member.id}
                      className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-danger))] disabled:opacity-50"
                      title="Remove member"
                    >
                      {removing === member.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-12 text-center text-[rgb(var(--color-text-tertiary))] text-sm"
              >
                No members found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Projects Tab ──────────────────────────────────────────────────────────────

function ProjectsTab({ projects }: { projects: any[] }) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-[rgb(var(--color-text-tertiary))]">
        No projects assigned to this team.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-[rgb(var(--color-surface))] p-6 rounded-xl border border-[rgb(var(--color-border))] hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg">{project.name}</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                project.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : project.status === "active"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {project.status}
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4 line-clamp-2">
              {project.description}
            </p>
          )}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Progress
                </span>
                <span className="font-semibold">{project.progress ?? 0}%</span>
              </div>
              <div className="w-full bg-[rgb(var(--color-border))] rounded-full h-2">
                <div
                  className="bg-[rgb(var(--color-accent))] h-2 rounded-full"
                  style={{ width: `${project.progress ?? 0}%` }}
                />
              </div>
            </div>
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="block w-full text-center py-2 border border-[rgb(var(--color-border))] rounded-lg text-sm font-medium hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
            >
              View Workspace
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Activity Tab ──────────────────────────────────────────────────────────────

type ActivityType =
  | "TASK_COMPLETED"
  | "TASK_CREATED"
  | "TASK_REASSIGNED"
  | string;

interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: string;
  target?: string;
  metadata?: string;
  createdAt: string;
}

function getActivityConfig(type: string) {
  switch (type) {
    case "TASK_COMPLETED":
      return {
        icon: CheckCircle2,
        iconBg: "bg-emerald-500",
        text: "completed",
      };
    case "TASK_CREATED":
      return { icon: PlusCircle, iconBg: "bg-blue-500", text: "created" };
    case "TASK_REASSIGNED":
      return { icon: Repeat, iconBg: "bg-amber-500", text: "reassigned" };
    default:
      return { icon: CheckCircle2, iconBg: "bg-gray-400", text: "updated" };
  }
}

function ActivityTab({ activities }: { activities: ActivityItem[] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-[rgb(var(--color-surface))] p-6 rounded-xl border border-[rgb(var(--color-border))]">
        <h3 className="font-semibold mb-6">Activity Stream</h3>
        <p className="text-[rgb(var(--color-text-tertiary))] text-sm">
          No activity yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[rgb(var(--color-surface))] p-6 rounded-xl border border-[rgb(var(--color-border))]">
      <h3 className="font-semibold mb-6">Activity Stream</h3>
      <div className="space-y-6">
        {activities.map((activity) => {
          const config = getActivityConfig(activity.type);
          const Icon = config.icon;
          return (
            <div key={activity.id} className="flex gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${config.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-medium">{activity.actor}</span>{" "}
                  {config.text}
                  {activity.target && (
                    <>
                      {" "}
                      <span className="font-medium">{activity.target}</span>
                    </>
                  )}
                </p>
                {activity.metadata && (
                  <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-0.5">
                    {activity.metadata}
                  </p>
                )}
                <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-0.5">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab({
  team,
  onSaved,
}: {
  team: any;
  onSaved: (updated: any) => void;
}) {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await teamService.updateTeam(team.id, {
        name,
        description,
      });
      setSuccess(true);
      onSaved(updated);
    } catch (err: any) {
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[rgb(var(--color-surface))] p-6 rounded-xl border border-[rgb(var(--color-border))]">
      <h3 className="font-semibold mb-6">Team Settings</h3>
      <form onSubmit={handleSave} className="space-y-4 max-w-lg">
        {error && (
          <div className="p-3 bg-[rgb(var(--color-danger-light))] text-[rgb(var(--color-danger))] rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            Changes saved successfully.
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Team Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-[rgb(var(--color-border))] rounded-lg px-3 py-2 bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-[rgb(var(--color-border))] rounded-lg px-3 py-2 bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))] resize-none"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Member Detail Modal ───────────────────────────────────────────────────────

function MemberDetailModal({
  member,
  onClose,
}: {
  member: any;
  onClose: () => void;
}) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await taskService.getTasks({ assigned_to: member.id });
        setTasks(result?.data ?? []);
      } catch {
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetch();
  }, [member.id]);

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter(
      (t) => t.status === "done" || t.status === "completed",
    ).length,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[rgb(var(--color-surface))] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
          <div className="flex items-center gap-4">
            <Avatar name={member.name} avatar={member.avatar} size="lg" />
            <div>
              <h2 className="text-2xl font-bold">{member.name}</h2>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {member.email}
              </p>
              <p className="text-xs text-[rgb(var(--color-text-tertiary))] capitalize">
                {member.role?.replace("_", " ")}
                {member.department ? ` • ${member.department}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--color-surface-hover))] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — Info */}
            <div className="lg:col-span-1 space-y-4">
              {/* Task Stats */}
              <div className="bg-[rgb(var(--color-surface-hover))] rounded-lg p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide mb-3">
                  Task Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[rgb(var(--color-text-secondary))]">
                      Total Tasks
                    </span>
                    <span className="font-bold">{taskStats.total}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[rgb(var(--color-text-secondary))]">
                      To Do
                    </span>
                    <span className="font-medium text-blue-600">
                      {taskStats.todo}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[rgb(var(--color-text-secondary))]">
                      In Progress
                    </span>
                    <span className="font-medium text-yellow-600">
                      {taskStats.inProgress}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[rgb(var(--color-text-secondary))]">
                      Completed
                    </span>
                    <span className="font-medium text-green-600">
                      {taskStats.completed}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {member.skills && member.skills.length > 0 && (
                <div className="bg-[rgb(var(--color-surface-hover))] rounded-lg p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide mb-3">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right — Tasks */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Assigned Tasks</h3>
              {loadingTasks ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--color-accent))]" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12 text-[rgb(var(--color-text-tertiary))]">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No tasks assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium flex-1">{task.title}</h4>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ml-2 ${
                            task.status === "done" ||
                            task.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : task.status === "in_progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : task.status === "review"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-[rgb(var(--color-text-tertiary))]">
                        <div className="flex items-center gap-1">
                          <Flag
                            className={`w-3 h-3 ${
                              task.priority === "critical"
                                ? "text-red-500"
                                : task.priority === "high"
                                  ? "text-orange-500"
                                  : task.priority === "medium"
                                    ? "text-yellow-500"
                                    : "text-gray-400"
                            }`}
                          />
                          <span className="capitalize">{task.priority}</span>
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>
                              {
                                task.subtasks.filter(
                                  (st: any) => st.isCompleted,
                                ).length
                              }
                              /{task.subtasks.length} subtasks
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
