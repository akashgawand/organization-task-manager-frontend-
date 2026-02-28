"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/features/permissions";
import {
  Settings as SettingsIcon,
  Globe,
  Users,
  UsersRound,
  Palette,
  Shield,
  Bell,
  Mail,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  Trash2,
  Edit,
  Save,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { mockUsers } from "@/lib/mockData";
import Avatar from "@/components/shared/Avatar";
import EditUserModal from "@/components/modals/EditUserModal";
import AddUserModal from "@/components/modals/AddUserModal";
import {
  settingsService,
  SystemSettings,
} from "@/app/services/settingsServices";
import { userService } from "@/app/services/userServices";
import { teamService, mapTeam } from "@/app/services/teamServices";
import LeadSelect from "@/components/shared/LeadSelect";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { User } from "@/types";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const TABS = [
  // { id: "general", label: "General", icon: Globe },
  { id: "users", label: "Users", icon: Users },
  { id: "teams", label: "Teams", icon: UsersRound },
  //{ id: "notifications", label: "Notifications", icon: Bell },
  // { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // API call commented out as it is currently unused
        // const data = await settingsService.getSettings();
        // if (data) setSettings(data);
      } catch (error) {
        console.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Wait until user is loaded from localStorage
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-background))]">
        <Loader2 className="w-10 h-10 animate-spin text-[rgb(var(--color-accent))]" />
      </div>
    );
  }

  // Redirect if not admin or super_admin
  if (user.role !== "super_admin" && user.role !== "admin") {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="w-16 h-16 text-[rgb(var(--color-text-tertiary))] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
              Access Denied
            </h2>
            <p className="text-[rgb(var(--color-text-secondary))]">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96 min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    switch (activeTab) {
      case "general":
        return (
          <GeneralSettings settings={settings} setSettings={setSettings} />
        );
      case "users":
        return <UserManagement />;
      case "teams":
        return <TeamManagement />;
      case "notifications":
        return (
          <NotificationSettings settings={settings} setSettings={setSettings} />
        );
      case "security":
        return (
          <SecuritySettings settings={settings} setSettings={setSettings} />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        {/* Header */}
        <div className="mb-8 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-accent))]/10 flex items-center justify-center shrink-0">
              <SettingsIcon className="w-6 h-6 text-[rgb(var(--color-accent))]" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                  Settings
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] border border-[rgb(var(--color-accent))]/20">
                  Workspace
                </span>
              </div>
              <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                Manage your workspace settings and preferences &middot;{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-60 flex-shrink-0">
            <div className="bg-[rgb(var(--color-surface))] rounded-2xl border border-[rgb(var(--color-border))] shadow-sm p-2 sticky top-24">
              <nav className="flex lg:flex-col gap-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        isActive
                          ? "bg-[rgb(var(--color-accent-light))] text-[rgb(var(--color-accent))] shadow-sm"
                          : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text-primary))]"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">{renderContent()}</div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ─── Reusable Card Shell ────────────────────────────────────────────── */
function SettingsCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[rgb(var(--color-surface))] rounded-2xl border border-[rgb(var(--color-border))] shadow-sm overflow-hidden transition-all duration-300 hover:border-[rgb(var(--color-border-hover))] ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))] bg-gradient-to-r from-[rgba(var(--color-surface-hover),0.5)] to-transparent">
      <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
      {children}
    </label>
  );
}

const inputClasses =
  "w-full px-4 py-2.5 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/30 focus:border-[rgb(var(--color-accent))] transition-all duration-200";

// General Settings Tab
function GeneralSettings({
  settings,
  setSettings,
}: {
  settings: SystemSettings | null;
  setSettings: any;
}) {
  const [formData, setFormData] = useState<Partial<SystemSettings>>(
    settings || {
      company_name: "Acme Corporation",
      timezone: "(UTC-05:00) Eastern Time (US & Canada)",
      date_format: "MM/DD/YYYY",
      time_format: "12-hour",
    },
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await settingsService.updateSettings({
        company_name: formData.company_name,
        timezone: formData.timezone,
        date_format: formData.date_format,
        time_format: formData.time_format,
      });
      if (updated) {
        setSettings(updated);
        toast.success("General settings saved");
      }
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* <SettingsCard>
        <CardHeader title="General Settings" />
        <div className="p-6 space-y-6 max-w-2xl">
          <div>
            <FieldLabel>Company Name</FieldLabel>
            <input
              type="text"
              value={formData.company_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
              className={inputClasses}
            />
          </div>

          <div>
            <FieldLabel>Timezone</FieldLabel>
            <select
              value={formData.timezone || ""}
              onChange={(e) =>
                setFormData({ ...formData, timezone: e.target.value })
              }
              className={inputClasses}
            >
              <option>(UTC-05:00) Eastern Time (US &amp; Canada)</option>
              <option>(UTC-08:00) Pacific Time (US &amp; Canada)</option>
              <option>(UTC+00:00) London</option>
              <option>(UTC+01:00) Central European Time</option>
              <option>(UTC+05:30) India Standard Time</option>
            </select>
          </div>

          <div>
            <FieldLabel>Date Format</FieldLabel>
            <select
              value={formData.date_format || ""}
              onChange={(e) =>
                setFormData({ ...formData, date_format: e.target.value })
              }
              className={inputClasses}
            >
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <FieldLabel>Time Format</FieldLabel>
            <div className="flex gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="timeFormat"
                  checked={formData.time_format === "12-hour"}
                  onChange={() =>
                    setFormData({ ...formData, time_format: "12-hour" })
                  }
                  className="w-4 h-4 text-[rgb(var(--color-accent))] accent-[rgb(var(--color-accent))]"
                />
                <span className="text-sm text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-accent))] transition-colors">12-hour</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="timeFormat"
                  checked={formData.time_format === "24-hour"}
                  onChange={() =>
                    setFormData({ ...formData, time_format: "24-hour" })
                  }
                  className="w-4 h-4 text-[rgb(var(--color-accent))] accent-[rgb(var(--color-accent))]"
                />
                <span className="text-sm text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-accent))] transition-colors">24-hour</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-[rgb(var(--color-border))]">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
            <button
              onClick={() => setFormData(settings || {})}
              className="btn btn-secondary"
            >
              Reset
            </button>
          </div>
        </div>
      </SettingsCard> */}
    </div>
  );
}

// User Management Tab
function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      if (response && response.data) setUsers(response.data);
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditSubmit = async (id: string, data: Partial<User>) => {
    try {
      const updated = await userService.updateUser(id, data);
      if (updated) {
        toast.success("User updated successfully");
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.deleteUser(id);
      toast.success("User deleted successfully");
      setDeletingUserId(null);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleAddSubmit = async (data: any) => {
    try {
      const created = await userService.createUser(data);
      if (created) {
        toast.success("User added successfully");
        setIsAddingUser(false);
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(searchStr)) ||
      (u.email && u.email.toLowerCase().includes(searchStr))
    );
  });

  return (
    <div className="space-y-6">
      <SettingsCard>
        <CardHeader title="User Management">
          <button
            className="cursor-pointer btn btn-primary"
            onClick={() => setIsAddingUser(true)}
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </CardHeader>

        {/* Search */}
        <div className="p-4 border-b border-[rgb(var(--color-border))]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClasses} pl-10`}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--color-accent))]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider border-b border-[rgb(var(--color-border))] bg-[rgba(var(--color-surface-hover),0.5)]">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  {/* <th className="px-6 py-3">Department</th> */}
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--color-border))]">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={user.name}
                          avatar={user.avatar}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                            {user.name}
                          </p>
                          <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const roleColors: Record<string, string> = {
                          super_admin:
                            "bg-red-500/10 text-red-500 border-red-500/20",
                          admin:
                            "bg-violet-500/10 text-violet-500 border-violet-500/20",
                          team_lead:
                            "bg-amber-500/10 text-amber-500 border-amber-500/20",
                          senior_developer:
                            "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
                          employee:
                            "bg-[rgba(var(--color-accent),0.1)] text-[rgb(var(--color-accent))] border-[rgba(var(--color-accent),0.15)]",
                        };
                        const cls =
                          roleColors[user.role] || roleColors.employee;
                        return (
                          <span
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border capitalize ${cls}`}
                          >
                            {(user.role || "").replace(/_/g, " ")}
                          </span>
                        );
                      })()}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-secondary))]">
                      {user.department || "N/A"}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                          user.isActive
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-tertiary))] border-[rgb(var(--color-border))]"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 rounded-lg hover:bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-accent))] transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUserId(user.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-[rgb(var(--color-text-tertiary))] hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingsCard>

      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditSubmit}
      />

      <AddUserModal
        isOpen={isAddingUser}
        onClose={() => setIsAddingUser(false)}
        onSubmit={handleAddSubmit}
      />

      {/* Delete Confirmation Modal */}
      {deletingUserId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
          <div className="bg-[rgb(var(--color-surface))] rounded-2xl shadow-2xl shadow-black/20 w-full max-w-sm border border-[rgb(var(--color-border))] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                Delete User
              </h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>
            </div>
            <div className="flex gap-3 p-4 border-t border-[rgb(var(--color-border))] bg-[rgba(var(--color-surface-hover),0.3)]">
              <button
                onClick={() => setDeletingUserId(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl hover:bg-[rgb(var(--color-surface-hover))] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingUserId)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-sm shadow-red-500/20 active:scale-[0.97] transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Team Management Tab
function TeamManagement() {
  const [teams, setTeams] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      const response = await teamService.getTeams();
      if (response && response.data) setTeams(response.data);
    } catch (e) {
      console.error("Failed to load teams", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      if (response && response.data) setAllUsers(response.data);
    } catch (e) {
      console.error("Failed to load users", e);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const handleCreate = async (data: {
    name: string;
    description: string;
    lead_id: number;
  }) => {
    try {
      const created = await teamService.createTeam(data);
      if (created) {
        toast.success("Team created successfully");
        setShowCreateModal(false);
        fetchTeams();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create team");
    }
  };

  const handleUpdate = async (
    id: string,
    data: { name?: string; description?: string; status?: string },
  ) => {
    try {
      const updated = await teamService.updateTeam(id, data);
      if (updated) {
        toast.success("Team updated successfully");
        setEditingTeam(null);
        fetchTeams();
      }
    } catch (error) {
      toast.error("Failed to update team");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await teamService.deleteTeam(id);
      toast.success("Team deleted successfully");
      setDeletingTeamId(null);
      fetchTeams();
    } catch (error) {
      toast.error("Failed to delete team");
    }
  };

  // Color palette for team cards
  const teamColors = [
    {
      bg: "bg-violet-500/10",
      icon: "text-violet-500",
      border: "border-violet-500/20",
    },
    {
      bg: "bg-cyan-500/10",
      icon: "text-cyan-500",
      border: "border-cyan-500/20",
    },
    {
      bg: "bg-amber-500/10",
      icon: "text-amber-500",
      border: "border-amber-500/20",
    },
    {
      bg: "bg-rose-500/10",
      icon: "text-rose-500",
      border: "border-rose-500/20",
    },
    {
      bg: "bg-emerald-500/10",
      icon: "text-emerald-500",
      border: "border-emerald-500/20",
    },
    {
      bg: "bg-blue-500/10",
      icon: "text-blue-500",
      border: "border-blue-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <SettingsCard>
        <CardHeader title="Team Management">
          <button
            className="cursor-pointer btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        </CardHeader>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--color-accent))]" />
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center p-12 text-[rgb(var(--color-text-tertiary))]">
              <UsersRound className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No teams found</p>
              <p className="text-sm mt-1">
                Create your first team to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {teams.map((team, i) => {
                const color = teamColors[i % teamColors.length];
                return (
                  <div
                    key={team.id || i}
                    className="group border border-[rgb(var(--color-border))] rounded-2xl p-5 hover:border-[rgb(var(--color-border-hover))] hover:shadow-md transition-all duration-300 bg-[rgb(var(--color-surface))]"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl ${color.bg} ${color.border} border flex items-center justify-center`}
                        >
                          <UsersRound className={`w-5 h-5 ${color.icon}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[rgb(var(--color-text-primary))] leading-tight">
                            {team.name}
                          </h3>
                          {team.description && (
                            <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-0.5 line-clamp-1">
                              {team.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          team.status === "active"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-tertiary))] border-[rgb(var(--color-border))]"
                        }`}
                      >
                        {team.status || "Active"}
                      </span>
                    </div>

                    {/* Lead */}
                    {team.lead && (
                      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))]">
                        <Avatar
                          name={team.lead.name}
                          avatar={team.lead.avatar}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[rgb(var(--color-text-primary))] truncate">
                            {team.lead.name}
                          </p>
                          <p className="text-[10px] text-[rgb(var(--color-text-tertiary))]">
                            Team Lead
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--color-text-secondary))]">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-medium">
                          {team.memberCount || team.members?.length || 0}
                        </span>
                        <span className="text-[rgb(var(--color-text-tertiary))]">
                          members
                        </span>
                      </div>
                      <div className="w-px h-3 bg-[rgb(var(--color-border))]" />
                      <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--color-text-secondary))]">
                        <span className="font-medium">
                          {team.projectCount || team.projects?.length || 0}
                        </span>
                        <span className="text-[rgb(var(--color-text-tertiary))]">
                          projects
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-[rgb(var(--color-border))]">
                      <button
                        onClick={() => setEditingTeam(team)}
                        className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text-primary))] transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingTeamId(team.id)}
                        className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-[rgb(var(--color-text-secondary))] hover:bg-red-500/10 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Create Team Modal */}
      {showCreateModal && (
        <TeamFormModal
          title="Create Team"
          submitLabel="Create Team"
          users={allUsers}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => handleCreate(data)}
        />
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <TeamFormModal
          title="Edit Team"
          submitLabel="Save Changes"
          team={editingTeam}
          users={allUsers}
          onClose={() => setEditingTeam(null)}
          onSubmit={(data) => handleUpdate(editingTeam.id, data)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingTeamId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
          <div className="bg-[rgb(var(--color-surface))] rounded-2xl shadow-2xl shadow-black/20 w-full max-w-sm border border-[rgb(var(--color-border))] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                Delete Team
              </h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                Are you sure you want to delete this team? All team data will be
                permanently removed.
              </p>
            </div>
            <div className="flex gap-3 p-4 border-t border-[rgb(var(--color-border))] bg-[rgba(var(--color-surface-hover),0.3)]">
              <button
                onClick={() => setDeletingTeamId(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl hover:bg-[rgb(var(--color-surface-hover))] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingTeamId)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-sm shadow-red-500/20 active:scale-[0.97] transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Team Form Modal (Create & Edit)
function TeamFormModal({
  title,
  submitLabel,
  team,
  users,
  onClose,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  team?: any;
  users: any[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [name, setName] = useState(team?.name || "");
  const [description, setDescription] = useState(team?.description || "");
  const [leadId, setLeadId] = useState(team?.leadId || "");
  const [status, setStatus] = useState(team?.status?.toUpperCase() || "ACTIVE");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data: any = { name, description };
      if (leadId) data.lead_id = Number(leadId);
      if (team) data.status = status;
      await onSubmit(data);
    } finally {
      setIsSaving(false);
    }
  };

  const formInput =
    "w-full px-4 py-2.5 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/30 focus:border-[rgb(var(--color-accent))] transition-all duration-200";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
      <div className="bg-[rgb(var(--color-surface))] rounded-2xl shadow-2xl shadow-black/20 w-full max-w-md flex flex-col border border-[rgb(var(--color-border))] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))] bg-gradient-to-r from-[rgba(var(--color-surface-hover),0.5)] to-transparent rounded-t-2xl">
          <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            {title}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl hover:bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
              Team Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Frontend Team"
              className={formInput}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the team..."
              rows={3}
              className={`${formInput} resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
              Team Lead
            </label>
            <LeadSelect
              value={leadId}
              onChange={(id: string) => setLeadId(id)}
              users={users}
            />
          </div>

          {/* Status toggle only for edit */}
          {team && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))]">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                  Team Status
                </p>
                <p className="text-[11px] text-[rgb(var(--color-text-tertiary))] mt-0.5">
                  {status === "ACTIVE"
                    ? "Team is currently active"
                    : "Team is idle"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={status === "ACTIVE"}
                  onChange={(e) =>
                    setStatus(e.target.checked ? "ACTIVE" : "IDLE")
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[rgb(var(--color-border))] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[rgba(var(--color-accent),0.2)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[rgb(var(--color-border))] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--color-accent))]"></div>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 flex justify-end gap-3 border-t border-[rgb(var(--color-border))]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text-primary))] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[rgb(var(--color-accent))] rounded-xl hover:bg-[rgb(var(--color-accent))]/90 shadow-sm shadow-[rgb(var(--color-accent))]/20 hover:shadow-md active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Notification Settings Tab
function NotificationSettings({
  settings,
  setSettings,
}: {
  settings: SystemSettings | null;
  setSettings: any;
}) {
  const [formData, setFormData] = useState<Partial<SystemSettings>>(
    settings || {
      notify_task_assignments: true,
      notify_task_updates: true,
      notify_comments: true,
      notify_mentions: true,
      notification_frequency: "Instant",
    },
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await settingsService.updateSettings({
        notify_task_assignments: formData.notify_task_assignments,
        notify_task_updates: formData.notify_task_updates,
        notify_comments: formData.notify_comments,
        notify_mentions: formData.notify_mentions,
        notification_frequency: formData.notification_frequency,
      });
      if (updated) {
        setSettings(updated);
        toast.success("Notification settings saved");
      }
    } catch (e) {
      toast.error("Failed to save notification settings");
    } finally {
      setIsSaving(false);
    }
  };

  const NOTIF_MAP = [
    {
      key: "notify_task_assignments",
      label: "Task assignments",
      description: "Get notified when you're assigned to a task",
    },
    {
      key: "notify_task_updates",
      label: "Task updates",
      description: "Updates to tasks you're involved with",
    },
    {
      key: "notify_comments",
      label: "Comments",
      description: "When someone comments on your tasks",
    },
    {
      key: "notify_mentions",
      label: "Mentions",
      description: "When someone mentions you",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <SettingsCard>
        <CardHeader title="Notification Preferences" />
        <div className="p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
              Email Notifications
            </h3>
            <div className="space-y-2">
              {NOTIF_MAP.map((item, i) => (
                <label
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-[rgb(var(--color-surface-hover))] cursor-pointer transition-colors border border-transparent hover:border-[rgb(var(--color-border))]"
                >
                  <input
                    type="checkbox"
                    checked={!!formData[item.key as keyof SystemSettings]}
                    onChange={(e) =>
                      setFormData({ ...formData, [item.key]: e.target.checked })
                    }
                    className="w-4 h-4 mt-0.5 accent-[rgb(var(--color-accent))] rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                      {item.label}
                    </p>
                    <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[rgb(var(--color-border))]">
            <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
              Frequency
            </h3>
            <select
              value={formData.notification_frequency || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  notification_frequency: e.target.value,
                })
              }
              className={inputClasses}
            >
              <option>Instant</option>
              <option>Daily digest</option>
              <option>Weekly digest</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3 border-t border-[rgb(var(--color-border))]">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Preferences
            </button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

// Security Settings Tab
function SecuritySettings({
  settings,
  setSettings,
}: {
  settings: SystemSettings | null;
  setSettings: any;
}) {
  const [formData, setFormData] = useState<Partial<SystemSettings>>(
    settings || {
      session_timeout: "15 minutes",
      pass_min_length: true,
      pass_require_uppercase: true,
      pass_require_numbers: false,
      pass_require_special: false,
      require_2fa: false,
    },
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await settingsService.updateSettings({
        session_timeout: formData.session_timeout,
        pass_min_length: formData.pass_min_length,
        pass_require_uppercase: formData.pass_require_uppercase,
        pass_require_numbers: formData.pass_require_numbers,
        pass_require_special: formData.pass_require_special,
        require_2fa: formData.require_2fa,
      });
      if (updated) {
        setSettings(updated);
        toast.success("Security settings saved");
      }
    } catch (e) {
      toast.error("Failed to save security settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsCard>
        <CardHeader title="Security Settings" />
        <div className="p-6 space-y-6 max-w-2xl">
          <div>
            <FieldLabel>Session Timeout</FieldLabel>
            <select
              value={formData.session_timeout || ""}
              onChange={(e) =>
                setFormData({ ...formData, session_timeout: e.target.value })
              }
              className={inputClasses}
            >
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>4 hours</option>
              <option>Never</option>
            </select>
          </div>

          <div className="border-t border-[rgb(var(--color-border))] pt-6">
            <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
              Password Policy
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[rgb(var(--color-surface-hover))] transition-colors">
                <input
                  type="checkbox"
                  checked={!!formData.pass_min_length}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pass_min_length: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-[rgb(var(--color-accent))] rounded"
                />
                <span className="text-sm text-[rgb(var(--color-text-primary))]">
                  Require minimum 8 characters
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[rgb(var(--color-surface-hover))] transition-colors">
                <input
                  type="checkbox"
                  checked={!!formData.pass_require_uppercase}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pass_require_uppercase: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-[rgb(var(--color-accent))] rounded"
                />
                <span className="text-sm text-[rgb(var(--color-text-primary))]">
                  Require uppercase and lowercase letters
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[rgb(var(--color-surface-hover))] transition-colors">
                <input
                  type="checkbox"
                  checked={!!formData.pass_require_numbers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pass_require_numbers: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-[rgb(var(--color-accent))] rounded"
                />
                <span className="text-sm text-[rgb(var(--color-text-primary))]">
                  Require numbers
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-[rgb(var(--color-surface-hover))] transition-colors">
                <input
                  type="checkbox"
                  checked={!!formData.pass_require_special}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pass_require_special: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-[rgb(var(--color-accent))] rounded"
                />
                <span className="text-sm text-[rgb(var(--color-text-primary))]">
                  Require special characters
                </span>
              </label>
            </div>
          </div>

          <div className="border-t border-[rgb(var(--color-border))] pt-6">
            <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">
              Two-Factor Authentication
            </h3>
            <div className="flex items-center justify-between p-4 bg-[rgb(var(--color-background))] rounded-xl border border-[rgb(var(--color-border))]">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                  Enable 2FA for all users
                </p>
                <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-1">
                  Require authentication codes for login
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.require_2fa}
                  onChange={(e) =>
                    setFormData({ ...formData, require_2fa: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[rgb(var(--color-border))] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[rgba(var(--color-accent),0.2)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[rgb(var(--color-border))] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--color-accent))]"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-[rgb(var(--color-border))]">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Security Settings
            </button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
