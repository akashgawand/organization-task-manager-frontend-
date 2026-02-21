"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  mockUsers,
  mockProjects,
  mockTeams,
  mockTasks,
  mockProductivityMetrics,
} from "@/lib/mockData";
import { useAuth } from "@/features/permissions";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import {
  ProjectIcon,
  TeamIcon,
  TaskIcon,
  UserIcon,
  AnalyticsIcon,
  SettingsIcon,
} from "@/components/icons";
import Avatar from "@/components/shared/Avatar";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter((u) => u.isActive).length;
  const totalProjects = mockProjects.length;
  const activeProjects = mockProjects.filter(
    (p) => p.status === "active",
  ).length;
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter((t) => t.status === "done").length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Executive Dashboard</h1>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Organization-wide analytics and oversight
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary">
              <SettingsIcon />
              System Settings
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Total Users"
            value={totalUsers}
            icon={<UserIcon />}
            trend={{ value: 8, isPositive: true }}
            color="rgb(var(--color-accent))"
          />
          <AnalyticsCard
            title="Active Projects"
            value={activeProjects}
            icon={<ProjectIcon />}
            trend={{ value: 12, isPositive: true }}
            color="rgb(var(--color-info))"
          />
          <AnalyticsCard
            title="Total Tasks"
            value={totalTasks}
            icon={<TaskIcon />}
            color="rgb(var(--color-warning))"
          />
          <AnalyticsCard
            title="Completion Rate"
            value={`${completionRate}%`}
            icon={<AnalyticsIcon />}
            trend={{ value: 5, isPositive: true }}
            color="rgb(var(--color-success))"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productivity Trend — Recharts BarChart */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Productivity Trend</h3>
              <div className="flex gap-2">
                {(["7d", "30d", "90d"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`btn btn-sm ${timeRange === range ? "btn-primary" : "btn-secondary"}`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={mockProductivityMetrics.map((m) => ({
                  day: m.date.getDate(),
                  Tasks: m.tasksCompleted,
                }))}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{
                    fontSize: 11,
                    fill: "rgb(var(--color-text-tertiary))",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "rgb(var(--color-text-tertiary))",
                  }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid rgba(0,0,0,0.08)",
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(v: number) => [`${v} tasks`, "Completed"]}
                />
                <Bar
                  dataKey="Tasks"
                  fill="rgb(var(--color-accent))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[rgb(var(--color-accent))]" />
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Tasks Completed
                </span>
              </div>
            </div>
          </div>

          {/* Task Distribution — Recharts PieChart */}
          <div className="card">
            <h3 className="font-semibold mb-4">Task Distribution by Status</h3>
            {(() => {
              const pieData = [
                {
                  name: "To Do",
                  value: mockTasks.filter((t) => t.status === "todo").length,
                  fill: "#94a3b8",
                },
                {
                  name: "In Progress",
                  value: mockTasks.filter((t) => t.status === "in_progress")
                    .length,
                  fill: "rgb(var(--color-info))",
                },
                {
                  name: "Review",
                  value: mockTasks.filter((t) => t.status === "review").length,
                  fill: "rgb(var(--color-warning))",
                },
                {
                  name: "Done",
                  value: mockTasks.filter((t) => t.status === "done").length,
                  fill: "rgb(var(--color-success))",
                },
                {
                  name: "Blocked",
                  value: mockTasks.filter((t) => t.status === "blocked").length,
                  fill: "rgb(var(--color-danger))",
                },
              ].filter((d) => d.value > 0);

              return (
                <div className="flex flex-col items-center gap-4">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid rgba(0,0,0,0.08)",
                          fontSize: 12,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                        formatter={(v: number, name: string) => [
                          `${v} (${Math.round((v / totalTasks) * 100)}%)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="w-full space-y-2">
                    {pieData.map((item) => (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: item.fill }}
                            />
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                            {item.value} (
                            {Math.round((item.value / totalTasks) * 100)}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-[rgb(var(--color-border))] rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${(item.value / totalTasks) * 100}%`,
                              backgroundColor: item.fill,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Department Overview & User Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Departments */}
          <div className="lg:col-span-2 card">
            <h3 className="font-semibold mb-4">Departments & Teams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTeams.map((team) => {
                const lead = mockUsers.find((u) => u.id === team.leadId)!;
                const members = team.memberIds
                  .map((id) => mockUsers.find((u) => u.id === id))
                  .filter(Boolean);
                const teamTasks = mockTasks.filter((t) =>
                  team.projectIds.includes(t.projectId),
                );
                const completedTeamTasks = teamTasks.filter(
                  (t) => t.status === "done",
                ).length;
                const teamCompletionRate =
                  teamTasks.length > 0
                    ? Math.round((completedTeamTasks / teamTasks.length) * 100)
                    : 0;

                return (
                  <div
                    key={team.id}
                    className="p-4 rounded-lg bg-[rgb(var(--color-surface-hover))]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold mb-1">{team.name}</h4>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                          {members.length} members
                        </p>
                      </div>
                      <TeamIcon />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar name={lead.name} size="sm" />
                      <div>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                          Team Lead
                        </p>
                        <p className="text-sm font-medium">{lead.name}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-[rgb(var(--color-border))]">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-[rgb(var(--color-text-tertiary))]">
                          Completion
                        </span>
                        <span className="font-medium">
                          {teamCompletionRate}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[rgb(var(--color-border))] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[rgb(var(--color-success))]"
                          style={{ width: `${teamCompletionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Management */}
          <div className="card">
            <h3 className="font-semibold mb-4">User Management</h3>
            <div className="space-y-3">
              {mockUsers.slice(0, 6).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-[rgb(var(--color-surface-hover))] transition-smooth"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} avatar={user.avatar} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-[rgb(var(--color-text-tertiary))] capitalize">
                        {user.role.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${user.isActive ? "bg-[rgb(var(--color-success))]" : "bg-[rgb(var(--color-text-tertiary))]"}`}
                  />
                </div>
              ))}
            </div>
            <button className="btn btn-secondary w-full mt-4">
              View All Users
            </button>
          </div>
        </div>

        {/* System Activity */}
        <div className="card">
          <h3 className="font-semibold mb-4">Recent System Activity</h3>
          <div className="space-y-3">
            {[
              {
                action: "New project created",
                user: "Michael Chen",
                time: "2 hours ago",
                type: "project",
              },
              {
                action: "Team member added",
                user: "Sarah Johnson",
                time: "3 hours ago",
                type: "team",
              },
              {
                action: "Task completed",
                user: "Emily Rodriguez",
                time: "5 hours ago",
                type: "task",
              },
              {
                action: "User permissions updated",
                user: "Michael Chen",
                time: "1 day ago",
                type: "security",
              },
            ].map((activity, index) => {
              const activityUser = mockUsers.find(
                (u) => u.name === activity.user,
              )!;

              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[rgb(var(--color-surface-hover))]"
                >
                  <Avatar name={activityUser.name} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-[rgb(var(--color-text-secondary))]">
                        {activity.action}
                      </span>
                    </p>
                    <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
