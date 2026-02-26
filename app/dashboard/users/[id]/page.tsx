"use client";

import { useEffect, useState, use } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { User, Task } from "@/types";
import { userService } from "@/app/services/userServices";
import { taskService } from "@/app/services/taskServices";
import {
  analyticsServices,
  UserAnalyticsOverview,
} from "@/app/services/analyticsServices";
import { useAuth } from "@/features/permissions";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Activity,
  CheckCircle,
  Clock,
} from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import Badge from "@/components/shared/Badge";
import TaskCard from "@/components/shared/TaskCard";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import TaskDistributionChart from "@/components/analytics/TaskDistributionChart";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalyticsOverview | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser || currentUser.id === "guest") return;
      try {
        setIsLoading(true);
        const [userRes, tasksRes, analyticsRes] = await Promise.all([
          userService.getUserById(id),
          taskService.getTasks({ assigned_to: id }),
          analyticsServices.getUserOverview(id).catch(() => null),
        ]);

        setUser(userRes);
        setTasks(tasksRes.data || []);
        setAnalytics(analyticsRes);
      } catch (error) {
        console.error("Failed to fetch user details", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id, currentUser]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
      case "admin":
        return "accent";
      case "team_lead":
      case "senior_developer":
        return "info";
      default:
        return "default";
    }
  };

  const formatRole = (role: string) => {
    if (!role) return "Unknown";
    return role
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 rounded-full border-4 border-[rgb(var(--color-border))] border-t-[rgb(var(--color-accent))] animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="p-8 text-center text-[rgb(var(--color-text-secondary))]">
          User not found.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/users"
            className="inline-flex items-center gap-2 text-sm text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Users
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} avatar={user.avatar} size="lg" />
              <div>
                <h1 className="text-3xl font-bold mb-1 text-[rgb(var(--color-text-primary))]">
                  {user.name}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      getRoleBadgeVariant(user.role) as
                        | "success"
                        | "warning"
                        | "danger"
                        | "info"
                        | "default"
                    }
                    label={formatRole(user.role)}
                  />
                  <Badge
                    variant={user.isActive ? "success" : "default"}
                    label={user.isActive ? "Active" : "Inactive"}
                  />
                </div>
              </div>
            </div>
            {/* Action buttons could go here */}
          </div>
        </div>

        {/* User Info & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 card flex flex-col gap-4">
            <h3 className="font-semibold text-lg border-b border-[rgb(var(--color-border))] pb-3">
              Contact Info
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
              <span className="text-[rgb(var(--color-text-secondary))]">
                {user.email}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
              <span className="text-[rgb(var(--color-text-secondary))]">
                Joined{" "}
                {new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AnalyticsCard
              title="Productivity Score"
              value={`${analytics?.productivityScore || 0}`}
              icon={<Activity className="text-white" />}
              color="rgb(var(--color-accent))"
            />
            <AnalyticsCard
              title="Completed Tasks"
              value={analytics?.tasksCompletedCount || 0}
              icon={<CheckCircle className="text-white" />}
              color="rgb(var(--color-success))"
            />
            <AnalyticsCard
              title="Overdue Tasks"
              value={analytics?.overdueTasksCount || 0}
              icon={<Clock className="text-white" />}
              color="rgb(var(--color-error))"
            />
          </div>
        </div>

        {/* Tasks and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Assigned Tasks ({tasks.length})
              </h3>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => {}} />
                ))
              ) : (
                <p className="text-sm text-[rgb(var(--color-text-secondary))] text-center py-8">
                  No tasks assigned to this user.
                </p>
              )}
            </div>
          </div>
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">
              Task Status Distribution
            </h3>
            {analytics?.statusDistribution &&
            analytics.statusDistribution.length > 0 ? (
              <TaskDistributionChart data={analytics.statusDistribution} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-[rgb(var(--color-text-secondary))] border border-dashed border-[rgb(var(--color-border))] rounded-xl">
                Not enough data
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
