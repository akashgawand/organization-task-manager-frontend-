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
} from "lucide-react";
import { mockUsers } from "@/lib/mockData";
import Avatar from "@/components/shared/Avatar";

const TABS = [
  { id: "general", label: "General", icon: Globe },
  { id: "users", label: "Users", icon: Users },
  { id: "teams", label: "Teams", icon: UsersRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  // { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");

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
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;
      case "users":
        return <UserManagement />;
      case "teams":
        return <TeamManagement />;
      case "notifications":
        return <NotificationSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "security":
        return <SecuritySettings />;
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
function GeneralSettings() {
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
              defaultValue="Acme Corporation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
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
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
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
                  defaultChecked
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-gray-700">12-hour</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="timeFormat"
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-gray-700">24-hour</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button className="btn btn-primary">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button className="btn btn-secondary">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// User Management Tab
function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            <button className="btn btn-primary">
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
                      <Avatar name={user.name} size="sm" />
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
                      {user.role.replace("_", " ")}
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
                      <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-primary">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Team Management Tab
function TeamManagement() {
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

        <div className="space-y-4">
          {[
            {
              name: "Engineering Team Alpha",
              members: 5,
              projects: 3,
              status: "active",
            },
            {
              name: "Product Team",
              members: 3,
              projects: 2,
              status: "active",
            },
            { name: "QA Team", members: 2, projects: 1, status: "idle" },
          ].map((team, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>{team.members} members</span>
                    <span>{team.projects} projects</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        team.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {team.status}
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
          ))}
        </div>
      </div>
    </div>
  );
}

// Notification Settings Tab
function NotificationSettings() {
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
              {[
                {
                  label: "Task assignments",
                  description: "Get notified when you're assigned to a task",
                },
                {
                  label: "Task updates",
                  description: "Updates to tasks you're involved with",
                },
                {
                  label: "Comments",
                  description: "When someone comments on your tasks",
                },
                { label: "Mentions", description: "When someone mentions you" },
              ].map((item, i) => (
                <label
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    defaultChecked={i < 2}
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
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option>Instant</option>
              <option>Daily digest</option>
              <option>Weekly digest</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button className="btn btn-primary">
              <Save className="w-4 h-4" />
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Appearance Settings Tab
function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Appearance Settings
        </h2>
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "Light", value: "light" },
                { name: "Dark", value: "dark" },
                { name: "System", value: "system" },
              ].map((theme) => (
                <label
                  key={theme.value}
                  className="relative border-2 border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer"
                >
                  <input type="radio" name="theme" className="sr-only" />
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{theme.name}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Primary Color
            </label>
            <div className="flex gap-3">
              {["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"].map(
                (color) => (
                  <button
                    key={color}
                    className="w-10 h-10 rounded-full border-2 border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ),
              )}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button className="btn btn-primary">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Security Settings Tab
function SecuritySettings() {
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
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
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
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-gray-700">
                  Require minimum 8 characters
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-gray-700">
                  Require uppercase and lowercase letters
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm text-gray-700">Require numbers</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
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
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button className="btn btn-primary">
              <Save className="w-4 h-4" />
              Save Security Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
