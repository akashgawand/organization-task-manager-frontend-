"use client";

import { useState, useEffect } from "react";
import {
  ProjectIcon,
  TeamIcon,
  TaskIcon,
  UserIcon,
  AnalyticsIcon,
  SettingsIcon,
} from "@/components/icons";
import ProductivityTrendChart from "@/components/analytics/ProductivityTrendChart";
import TaskDistributionChart from "@/components/analytics/TaskDistributionChart";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { User, Project, Team, Task } from "@/types";
import { userService } from "@/app/services/userServices";
import { projectService } from "@/app/services/projectServices";
import { teamService } from "@/app/services/teamServices";
import { taskService } from "@/app/services/taskServices";
import {
  analyticsServices,
  AnalyticsOverview,
  TrendDataPoint,
} from "@/app/services/analyticsServices";
import { activityService } from "@/app/services/activityServices";
import { useAuth } from "@/features/permissions";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";

import Avatar from "@/components/shared/Avatar";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trend, setTrend] = useState<TrendDataPoint[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!user || user.id === "guest") return;

        const [
          usersRes,
          projectsRes,
          teamsRes,
          overviewRes,
          tasksRes,
          activityRes,
        ] = await Promise.all([
          userService.getUsers(),
          projectService.getProjects(),
          teamService.getTeams(),
          analyticsServices.getOverview().catch(() => null),
          taskService.getTasks(),
          activityService.getMyActivity().catch(() => ({ data: [] })),
        ]);

        setUsers(usersRes.data || []);

        const projData = Array.isArray(projectsRes)
          ? projectsRes
          : (projectsRes as any)?.projects || [];
        setProjects(projData);

        setTeams((teamsRes.data as unknown as Team[]) || []);
        setTasks(tasksRes.data || tasksRes.tasks || []);
        setOverview(overviewRes as AnalyticsOverview | null);
        setActivities(activityRes?.data || []);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Separate effect for trend that reacts to timeRange changes
  useEffect(() => {
    if (!user || user.id === "guest") return;
    async function fetchTrend() {
      const end = new Date();
      const start = new Date();
      if (timeRange === "7d") start.setDate(end.getDate() - 7);
      else if (timeRange === "30d") start.setDate(end.getDate() - 30);
      else if (timeRange === "90d") start.setDate(end.getDate() - 90);

      try {
        const trendRes = await analyticsServices.getTrend(
          start.toISOString(),
          end.toISOString(),
        );
        setTrend(trendRes || []);
      } catch (error) {
        console.error("Failed to fetch trend", error);
      }
    }
    fetchTrend();
  }, [user, timeRange]);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const totalProjects = projects.length;
  const activeProjects =
    overview?.activeProjectsCount ||
    projects.filter((p) => p.status === "active").length;
  const totalTasks = tasks.length;
  const completedTasks =
    overview?.completedTasksCount ||
    tasks.filter((t) => t.status === "done").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Greeting & Info */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-secondary,var(--color-accent)))] flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                    Executive Dashboard
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] border border-[rgb(var(--color-accent))]/20 capitalize">
                    {user?.role?.replace(/_/g, " ") || "Super Admin"}
                  </span>
                </div>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                  Organization-wide analytics and oversight &middot; {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Total Users"
            value={totalUsers}
            icon={<UserIcon />}
            color="rgb(var(--color-accent))"
          />
          <AnalyticsCard
            title="Active Projects"
            value={activeProjects}
            icon={<ProjectIcon />}
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
            color="rgb(var(--color-success))"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productivity Trend — Highcharts Column Chart */}
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

            <ProductivityTrendChart data={trend} />

            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[rgb(var(--color-accent))]" />
                <span className="text-[rgb(var(--color-text-secondary))]">
                  Tasks Completed
                </span>
              </div>
            </div>
          </div>

          {/* Task Distribution — Highcharts Pie Chart */}
          <div className="card">
            <h3 className="font-semibold mb-4">Task Distribution by Status</h3>
            <TaskDistributionChart data={overview?.statusDistribution || []} />
          </div>
        </div>

        {/* Department Overview & User Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Departments */}
          <div className="lg:col-span-2 card">
            <h3 className="font-semibold mb-4">Departments & Teams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Loading teams...
                </p>
              ) : teams.length === 0 ? (
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  No teams found.
                </p>
              ) : (
                teams.map((team) => {
                  const lead = users.find((u) => u.id === team.leadId) ||
                    (team as any).lead || { name: "Unassigned" };
                  const members = (team as any).members || [];
                  // If the team gives a project list, match it to tasks to calculate completion.
                  // Alternatively fallback to 0.
                  const teamTasks = tasks.filter((t) =>
                    team.projectIds?.includes(t.projectId),
                  );
                  const completedTeamTasks = teamTasks.filter(
                    (t) => t.status === "done",
                  ).length;
                  const teamCompletionRate =
                    teamTasks.length > 0
                      ? Math.round(
                        (completedTeamTasks / teamTasks.length) * 100,
                      )
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
                })
              )}
            </div>
          </div>

          {/* User Management */}
          <div className="card">
            <h3 className="font-semibold mb-4">User Management</h3>
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Loading users...
                </p>
              ) : (
                users.slice(0, 6).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-[rgb(var(--color-surface-hover))] transition-smooth"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} avatar={u.avatar} size="sm" />
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))] capitalize">
                          {u.role ? u.role.replace("_", " ") : "User"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${u.isActive ? "bg-[rgb(var(--color-success))]" : "bg-[rgb(var(--color-text-tertiary))]"}`}
                    />
                  </div>
                ))
              )}
            </div>
            <Link href="/dashboard/users">
              <button className="btn btn-secondary w-full mt-4">
                View All Users
              </button>
            </Link>
          </div>
        </div>

        {/* System Activity */}
        <div className="card">
          <h3 className="font-semibold mb-4">Recent System Activity</h3>
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                Loading activity...
              </p>
            ) : activities.length > 0 ? (
              activities.slice(0, 4).map((activity, index) => {
                const activityUser = users.find(
                  (u) =>
                    u.id === activity.user_id?.toString() ||
                    u.id === activity.userId,
                ) || { name: "System User" };

                // Get display action text
                const actionText =
                  activity.description ||
                  (activity.activity_type
                    ? activity.activity_type.replace(/_/g, " ").toLowerCase()
                    : "performed an action");

                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[rgb(var(--color-surface-hover))]"
                  >
                    <Avatar name={activityUser.name} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activityUser.name}</span>{" "}
                        <span className="text-[rgb(var(--color-text-secondary))]">
                          {actionText}
                        </span>
                      </p>
                      <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                        {new Date(
                          activity.created_at ||
                          activity.createdAt ||
                          Date.now(),
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                No recent activity found.
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
