"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/features/permissions";
import TeamCard from "@/features/teams/components/TeamCard";
import AddMemberModal from "@/features/teams/components/AddMemberModal";
import EditTeamModal from "@/features/teams/components/EditTeamModal";
import { teamService } from "@/app/services/teamServices";
import { userService } from "@/app/services/userServices";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Users,
  X,
  UserPlus,
  Loader2,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";

type TeamStatus = "active" | "idle" | "archived";

export default function TeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TeamStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "size" | "projects">("size");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Add-member state (used from the per-card dropdown)
  const [addMemberTarget, setAddMemberTarget] = useState<any | null>(null);
  const [editTeamTarget, setEditTeamTarget] = useState<any | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await teamService.getTeams({ limit: 100 });
      setTeams(result?.data ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openMenuId) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const filteredTeams = teams
    .filter((team) => {
      const matchesSearch =
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || team.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return (b.memberCount ?? 0) - (a.memberCount ?? 0);
      return (b.projectCount ?? 0) - (a.projectCount ?? 0);
    });

  const handleTeamCreated = (newTeam: any) => {
    setTeams((prev) => [newTeam, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleMembersAdded = async () => {
    setAddMemberTarget(null);
    await fetchTeams(); // re-fetch to reflect updated counts
  };

  const handleTeamUpdated = (updated: any) => {
    setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setEditTeamTarget(null);
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      await teamService.deleteTeam(teamId);
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      setOpenMenuId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete team");
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Title & Info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-accent))]/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-[rgb(var(--color-accent))]" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                    Teams
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] border border-[rgb(var(--color-accent))]/20">
                    {loading ? "..." : `${teams.length} Total`}
                  </span>
                </div>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                  Manage your organisation&apos;s teams and their resources &middot; {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Right: Quick Stats + Actions */}
            <div className="flex items-center gap-4 md:gap-6 flex-wrap">
              {/* Quick Stats */}
              <div className="flex items-center gap-4 md:gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-success))]" />
                  <div className="text-sm">
                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">{teams.filter(t => t.status === "active" || !t.status).length}</span>
                    <span className="text-[rgb(var(--color-text-tertiary))] ml-1">Active</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-[rgb(var(--color-border))]" />
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-info))]" />
                  <div className="text-sm">
                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">{teams.reduce((sum, t) => sum + (t.memberCount ?? 0), 0)}</span>
                    <span className="text-[rgb(var(--color-text-tertiary))] ml-1">Members</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-[rgb(var(--color-border))] hidden md:block" />

              {/* Actions */}
              <div className="flex items-center gap-2">
               {/*  <button
                  onClick={fetchTeams}
                  className="p-2 rounded-lg border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                </button> */}
                <button
                  className="btn btn-primary flex items-center gap-2"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Create Team
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 bg-[rgb(var(--color-surface))] p-4 rounded-xl border border-[rgb(var(--color-border))]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            <input
              type="text"
              placeholder="Search teams..."
              className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))] text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                className="appearance-none pl-10 pr-8 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))] cursor-pointer text-sm"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as TeamStatus | "all")
                }
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="archived">Archived</option>
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            </div>
            <div className="relative">
              <select
                className="appearance-none pl-10 pr-8 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))] cursor-pointer text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="size">Sort by Size</option>
                <option value="projects">Sort by Projects</option>
                <option value="name">Sort by Name</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-20 min-h-[300px]">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {!loading && error && (
          <div className="text-center py-12 text-[rgb(var(--color-danger))]">
            {error}
          </div>
        )}

        {/* Team Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div key={team.id} className="relative group">
                <TeamCard
                  team={team}
                  lead={team.lead}
                  memberCount={team.memberCount ?? team.members?.length ?? 0}
                  activeProjectCount={
                    team.projectCount ?? team.projects?.length ?? 0
                  }
                />

                {/* Per-card action menu */}
                <div
                  className="absolute top-3 right-3 z-10"
                  onClick={(e) => e.preventDefault()}
                  ref={openMenuId === team.id ? menuRef : null}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === team.id ? null : team.id);
                    }}
                    className={`p-1.5 rounded-lg bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-all shadow-sm z-20 ${openMenuId === team.id
                      ? "opacity-100 shadow-md"
                      : "opacity-0 group-hover:opacity-100"
                      }`}
                    title="Team actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenuId === team.id && (
                    <div
                      className="absolute right-0 top-8 w-44 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg shadow-lg py-1 z-30 animate-in fade-in zoom-in duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[rgb(var(--color-surface-hover))] transition-colors text-left"
                        onClick={() => {
                          setOpenMenuId(null);
                          setAddMemberTarget(team);
                        }}
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Member
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[rgb(var(--color-surface-hover))] transition-colors text-left"
                        onClick={() => {
                          setOpenMenuId(null);
                          setEditTeamTarget(team);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Team
                      </button>
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[rgb(var(--color-surface-hover))] transition-colors text-left text-[rgb(var(--color-danger))]"
                        onClick={() => {
                          handleDeleteTeam(team.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Team
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[rgb(var(--color-surface-hover))] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
            </div>
            <h3 className="text-lg font-medium">No teams found</h3>
            <p className="text-[rgb(var(--color-text-secondary))] mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "Create your first team to get started."}
            </p>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <CreateTeamModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleTeamCreated}
        />
      )}

      {/* Add Member Modal (from team card dropdown) */}
      {addMemberTarget && (
        <AddMemberModal
          team={addMemberTarget}
          currentMembers={addMemberTarget.members ?? []}
          onClose={() => setAddMemberTarget(null)}
          onAdded={handleMembersAdded}
        />
      )}

      {/* Edit Team Modal (from team card dropdown) */}
      {editTeamTarget && (
        <EditTeamModal
          team={editTeamTarget}
          onClose={() => setEditTeamTarget(null)}
          onSaved={handleTeamUpdated}
        />
      )}
    </DashboardLayout>
  );
}

// ── Create Team Modal ──────────────────────────────────────────────────────────

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (team: any) => void;
}

function CreateTeamModal({ isOpen, onClose, onCreated }: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leadId, setLeadId] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const result = await userService.getUsers({ limit: 200 });
        setAllUsers(result?.data ?? []);
      } catch {
        setAllUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [isOpen]);

  if (!isOpen) return null;

  const eligibleLeads = allUsers.filter((u) =>
    ["admin", "team_lead", "super_admin"].includes(u.role),
  );

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;
    setError(null);
    setSubmitting(true);
    try {
      const created = await teamService.createTeam({
        name,
        description,
        lead_id: Number(leadId),
        member_ids: selectedMembers.map(Number),
      });
      if (created) onCreated(created);
    } catch (err: any) {
      setError(err?.message || "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[rgb(var(--color-surface))] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-accent-light))] flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[rgb(var(--color-accent))]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create New Team</h2>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                Build a team to collaborate on projects
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

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {error && (
              <div className="p-3 bg-[rgb(var(--color-danger-light))] text-[rgb(var(--color-danger))] rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Team Name{" "}
                <span className="text-[rgb(var(--color-danger))]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Engineering Team Alpha"
                className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the team's focus and objectives..."
                className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))] resize-none"
              />
            </div>

            {/* Team Lead */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Team Lead{" "}
                <span className="text-[rgb(var(--color-danger))]">*</span>
              </label>
              {loadingUsers ? (
                <div className="text-sm text-[rgb(var(--color-text-tertiary))]">
                  Loading users…
                </div>
              ) : (
                <select
                  required
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))]"
                >
                  <option value="">Select a team lead</option>
                  {eligibleLeads.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.replace("_", " ")})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Team Members */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Team Members
              </label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))] text-sm"
                />
              </div>
              <div className="border border-[rgb(var(--color-border))] rounded-lg max-h-60 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {filteredUsers.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[rgb(var(--color-surface-hover))] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, u.id]);
                          } else {
                            setSelectedMembers(
                              selectedMembers.filter((id) => id !== u.id),
                            );
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                          {u.role.replace("_", " ")} • {u.email}
                        </p>
                      </div>
                    </label>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-sm text-[rgb(var(--color-text-tertiary))] p-2">
                      No users found
                    </p>
                  )}
                </div>
              </div>
              {selectedMembers.length > 0 && (
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-2">
                  {selectedMembers.length} member
                  {selectedMembers.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[rgb(var(--color-border))]">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !leadId}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {submitting ? "Creating…" : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
