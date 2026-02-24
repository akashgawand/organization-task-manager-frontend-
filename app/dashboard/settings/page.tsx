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
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { User } from "@/types";

const TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "users", label: "Users", icon: Users },
  { id: "teams", label: "Teams", icon: UsersRound },
  { id: "notifications", label: "Notifications", icon: Bell },

  // { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        if (data) setSettings(data);
      } catch (error) {
        console.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Redirect if not admin or super_admin
  if (user.role !== "super_admin" && user.role !== "admin") {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your workspace settings and preferences
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">{renderContent()}</div>
        </div>
      </div>
    </DashboardLayout>
  );
}

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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          General Settings
        </h2>
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={formData.company_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={formData.timezone || ""}
              onChange={(e) =>
                setFormData({ ...formData, timezone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option>(UTC-05:00) Eastern Time (US & Canada)</option>
              <option>(UTC-08:00) Pacific Time (US & Canada)</option>
              <option>(UTC+00:00) London</option>
              <option>(UTC+01:00) Central European Time</option>
              <option>(UTC+05:30) India Standard Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={formData.date_format || ""}
              onChange={(e) =>
                setFormData({ ...formData, date_format: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Format
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="timeFormat"
                  checked={formData.time_format === "12-hour"}
                  onChange={() =>
                    setFormData({ ...formData, time_format: "12-hour" })
                  }
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-gray-700">12-hour</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="timeFormat"
                  checked={formData.time_format === "24-hour"}
                  onChange={() =>
                    setFormData({ ...formData, time_format: "24-hour" })
                  }
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-gray-700">24-hour</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
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
      </div>
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
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await userService.deleteUser(id);
      toast.success("User deleted successfully");
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            <button
              className="btn btn-primary"
              onClick={() => setIsAddingUser(true)}
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} src={user.avatar} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                        {(user.role || "").replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.department || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600"
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
      </div>

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
    </div>
  );
}

// Team Management Tab
function TeamManagement() {
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    fetchTeams();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Team Management</h2>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Create Team
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {teams.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                No teams found.
              </div>
            ) : (
              teams.map((team, i) => (
                <div
                  key={team.id || i}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>
                          {team.memberCount || team.members?.length || 0}{" "}
                          members
                        </span>
                        <span>
                          {team.projectCount || team.projects?.length || 0}{" "}
                          projects
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                            team.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {team.status || "Active"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Notification Preferences
        </h2>
        <div className="space-y-6 max-w-2xl">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Email Notifications
            </h3>
            <div className="space-y-3">
              {NOTIF_MAP.map((item, i) => (
                <label
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!!formData[item.key as keyof SystemSettings]}
                    onChange={(e) =>
                      setFormData({ ...formData, [item.key]: e.target.checked })
                    }
                    className="w-4 h-4 mt-0.5 text-primary rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option>Instant</option>
              <option>Daily digest</option>
              <option>Weekly digest</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
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
      </div>
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Security Settings
        </h2>
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout
            </label>
            <select
              value={formData.session_timeout || ""}
              onChange={(e) =>
                setFormData({ ...formData, session_timeout: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>4 hours</option>
              <option>Never</option>
            </select>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Password Policy
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.pass_min_length}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pass_min_length: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-gray-700">
                  Require minimum 8 characters
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.pass_require_uppercase}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pass_require_uppercase: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-gray-700">
                  Require uppercase and lowercase letters
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.pass_require_numbers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pass_require_numbers: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-gray-700">Require numbers</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.pass_require_special}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pass_require_special: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-gray-700">
                  Require special characters
                </span>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Two-Factor Authentication
            </h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Enable 2FA for all users
                </p>
                <p className="text-xs text-gray-500 mt-1">
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
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
      </div>
    </div>
  );
}
