"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth, PermissionGate } from "@/features/permissions";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  FileText,
  Timer,
  Send,
  CheckCheck,
  Calendar,
  Bell,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { taskService } from "@/app/services/taskServices";
import {
  notificationService,
  Notification,
} from "@/app/services/notificationServices";
import { Task } from "@/features/tasks/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          // Fetch tasks assigned to user
          // Assuming backend supports filtering by assigned_to
          const tasksResponse = await taskService.getTasks({
            assigned_to: user.id,
            limit: 100, // Fetch a reasonable amount for dashboard summary
          });

          if (tasksResponse && tasksResponse.data) {
            setTasks(tasksResponse.data);
          }

          // Fetch notifications
          const notifs = await notificationService.getNotifications();
          setNotifications(notifs);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  // Today's date for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  if (isLoading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-accent))]"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate "Today" metrics
  const tasksDueToday = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  }).length;

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "done",
  );

  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;

  const completedToday = tasks.filter((t) => {
    if (t.status !== "done") return false;
    const updated = new Date(t.updatedAt);
    updated.setHours(0, 0, 0, 0);
    return updated.getTime() === today.getTime();
  }).length;

  // My Focus - Top 5 priority tasks (auto-sorted)
  const focusTasks = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      // Sort by: overdue > critical > high > due date
      const aOverdue = a.dueDate && new Date(a.dueDate) < today ? 1 : 0;
      const bOverdue = b.dueDate && new Date(b.dueDate) < today ? 1 : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;

      const priorityWeight = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      // @ts-ignore
      const aPriority = priorityWeight[a.priority] || 0;
      // @ts-ignore
      const bPriority = priorityWeight[b.priority] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    })
    .slice(0, 5);

  // Deadline timeline
  const deadlinesToday = tasks.filter((t) => {
    if (!t.dueDate || t.status === "done") return false;
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  const deadlinesTomorrow = tasks.filter((t) => {
    if (!t.dueDate || t.status === "done") return false;
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === tomorrow.getTime();
  });

  const deadlinesThisWeek = tasks.filter((t) => {
    if (!t.dueDate || t.status === "done") return false;
    const dueDate = new Date(t.dueDate);
    return dueDate > tomorrow && dueDate <= endOfWeek;
  });

  // Calculate global metrics (for admin/managers)
  // For now, using local tasks as approximation or need a separate stat call
  const globalCompletionRate =
    tasks.length > 0
      ? (tasks.filter((t) => t.status === "done").length / tasks.length) * 100
      : 0;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">
            Good {new Date().getHours() < 12 ? "morning" : "afternoon"},{" "}
            {user.name?.split(" ")[0]}
          </h1>
          <p className="text-[rgb(var(--color-text-secondary))]">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Today Summary Cards - Clickable numbers that filter tasks page */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/my-tasks?filter=today"
            className="group hover:scale-105 transition-transform"
          >
            <AnalyticsCard
              title="Due Today"
              value={tasksDueToday}
              icon={<Calendar className="w-5 h-5" />}
              color="rgb(var(--color-info))"
            />
          </Link>
          <Link
            href="/dashboard/my-tasks?filter=overdue"
            className="group hover:scale-105 transition-transform"
          >
            <AnalyticsCard
              title="Overdue"
              value={overdueTasks.length}
              icon={<AlertCircle className="w-5 h-5" />}
              color="rgb(var(--color-danger))"
            />
          </Link>
          <Link
            href="/dashboard/my-tasks?filter=in_progress"
            className="group hover:scale-105 transition-transform"
          >
            <AnalyticsCard
              title="In Progress"
              value={inProgressTasks}
              icon={<Clock className="w-5 h-5" />}
              color="rgb(var(--color-warning))"
            />
          </Link>
          <div className="group hover:scale-105 transition-transform">
            <AnalyticsCard
              title="Done Today"
              value={completedToday}
              icon={<CheckCheck className="w-5 h-5" />}
              color="rgb(var(--color-success))"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - My Focus */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Focus Widget */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">My Focus</h2>
                <Link
                  href="/dashboard/my-tasks"
                  className="text-sm text-[rgb(var(--color-accent))] hover:underline"
                >
                  View all →
                </Link>
              </div>

              {focusTasks.length === 0 ? (
                <div className="text-center py-8 text-[rgb(var(--color-text-tertiary))]">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>All caught up! No urgent tasks.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {focusTasks.map((task) => {
                    const isOverdue =
                      task.dueDate && new Date(task.dueDate) < today;
                    const priorityColors: Record<string, string> = {
                      critical: "rgb(var(--color-danger))",
                      high: "rgb(var(--color-warning))",
                      medium: "rgb(var(--color-info))",
                      low: "rgb(var(--color-text-tertiary))",
                      CRITICAL: "rgb(var(--color-danger))",
                      HIGH: "rgb(var(--color-warning))",
                      MEDIUM: "rgb(var(--color-info))",
                      LOW: "rgb(var(--color-text-tertiary))",
                    };

                    return (
                      <Link
                        key={task.id}
                        href={`/dashboard/my-tasks?task=${task.id}`}
                        className="block p-4 rounded-lg border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))] hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    priorityColors[task.priority] ||
                                    priorityColors.low,
                                }}
                              />
                              <h3 className="font-medium truncate">
                                {task.title}
                              </h3>
                            </div>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))] line-clamp-1">
                              {task.description}
                            </p>
                          </div>
                          {task.dueDate && (
                            <div
                              className={`text-xs px-2 py-1 rounded shrink-0 ${
                                isOverdue
                                  ? "bg-[rgb(var(--color-danger-light))] text-[rgb(var(--color-danger))]"
                                  : "bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]"
                              }`}
                            >
                              {new Date(task.dueDate).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Analytics Section - Only for users with permission */}
            <PermissionGate requires="canViewAnalytics">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Team Overview</h2>
                  <Link
                    href="/dashboard/analytics"
                    className="text-sm text-[rgb(var(--color-accent))] hover:underline"
                  >
                    Full analytics →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AnalyticsCard
                    title="Total Tasks"
                    value={tasks.length}
                    icon={<CheckSquare className="w-5 h-5" />}
                  />
                  <AnalyticsCard
                    title="Completion Rate"
                    value={`${Math.round(globalCompletionRate)}%`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="rgb(var(--color-success))"
                  />
                  <AnalyticsCard
                    title="Active Projects"
                    value={3} // Stats API needed for this
                    icon={<BarChart3 className="w-5 h-5" />}
                    color="rgb(var(--color-info))"
                  />
                </div>
              </div>
            </PermissionGate>
          </div>

          {/* Right Column - Deadlines & Notifications */}
          <div className="space-y-6">
            {/* Deadline Timeline */}
            <div className="card">
              <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
              <div className="space-y-4">
                {/* Today */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[rgb(var(--color-danger))]" />
                    <span className="text-sm font-medium">Today</span>
                    <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                      ({deadlinesToday.length})
                    </span>
                  </div>
                  {deadlinesToday.length === 0 ? (
                    <p className="text-xs text-[rgb(var(--color-text-tertiary))] ml-4">
                      No deadlines
                    </p>
                  ) : (
                    <div className="ml-4 space-y-1">
                      {deadlinesToday.slice(0, 3).map((task) => (
                        <Link
                          key={task.id}
                          href={`/dashboard/my-tasks?task=${task.id}`}
                          className="block text-sm text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-accent))] truncate"
                        >
                          {task.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tomorrow */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[rgb(var(--color-warning))]" />
                    <span className="text-sm font-medium">Tomorrow</span>
                    <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                      ({deadlinesTomorrow.length})
                    </span>
                  </div>
                  {deadlinesTomorrow.length === 0 ? (
                    <p className="text-xs text-[rgb(var(--color-text-tertiary))] ml-4">
                      No deadlines
                    </p>
                  ) : (
                    <div className="ml-4 space-y-1">
                      {deadlinesTomorrow.slice(0, 3).map((task) => (
                        <Link
                          key={task.id}
                          href={`/dashboard/my-tasks?task=${task.id}`}
                          className="block text-sm text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-accent))] truncate"
                        >
                          {task.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* This Week */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[rgb(var(--color-info))]" />
                    <span className="text-sm font-medium">This Week</span>
                    <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                      ({deadlinesThisWeek.length})
                    </span>
                  </div>
                  {deadlinesThisWeek.length === 0 ? (
                    <p className="text-xs text-[rgb(var(--color-text-tertiary))] ml-4">
                      No deadlines
                    </p>
                  ) : (
                    <div className="ml-4 space-y-1">
                      {deadlinesThisWeek.slice(0, 3).map((task) => (
                        <Link
                          key={task.id}
                          href={`/dashboard/my-tasks?task=${task.id}`}
                          className="block text-sm text-[rgb(var(--color-text-primary))] hover:text-[rgb(var(--color-accent))] truncate"
                        >
                          {task.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications Mini Feed */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Updates</h3>
                <Bell className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
              </div>
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="text-sm p-3 rounded bg-[rgb(var(--color-surface-hover))] hover:bg-[rgb(var(--color-surface))] transition-colors cursor-pointer"
                    >
                      {notif.text}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                    No recent updates
                  </p>
                )}
              </div>
            </div>

            {/* Team Pulse - Very Light */}
            <PermissionGate requires="canManageTeam">
              <div className="card bg-[rgb(var(--color-accent-light))] border-[rgb(var(--color-accent))]">
                <h3 className="font-semibold mb-3 text-[rgb(var(--color-accent))]">
                  Team Pulse
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">
                      Tasks waiting review
                    </span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[rgb(var(--color-text-secondary))]">
                      Sprint ends in
                    </span>
                    <span className="font-medium">2 days</span>
                  </div>
                </div>
              </div>
            </PermissionGate>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
