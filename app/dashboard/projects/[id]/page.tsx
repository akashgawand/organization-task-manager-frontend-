"use client";

import { use, useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/features/permissions";
import { projectService } from "@/app/services/projectServices";
import { taskService } from "@/app/services/taskServices";
import { ExtendedProject } from "@/features/projects/types";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  Layout,
  MoreVertical,
  Target,
  TrendingUp,
  User as UserIcon,
  ShieldAlert,
  Activity,
  ChevronRight,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  calculateProjectTeamPerformance,
  ProjectTeamPerformance,
} from "@/lib/analytics";

// ─── Sub Components ────────────────────────────────────────────────────────

function HealthBadge({ health }: { health: string }) {
  const colors =
    {
      green:
        "bg-[rgb(var(--color-success-light))] text-[rgb(var(--color-success))] border-[rgb(var(--color-success))] border-opacity-30",
      yellow:
        "bg-[rgb(var(--color-warning-light))] text-[rgb(var(--color-warning))] border-[rgb(var(--color-warning))] border-opacity-30",
      red: "bg-[rgb(var(--color-danger-light))] text-[rgb(var(--color-danger))] border-[rgb(var(--color-danger))] border-opacity-30",
    }[health] ||
    "bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))] border-[rgb(var(--color-border))]";

  const labels =
    {
      green: "On Track",
      yellow: "At Risk",
      red: "Delayed",
    }[health] || "Unknown";

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors}`}
    >
      {labels}
    </span>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;
  const colors: Record<string, string> = {
    critical:
      "bg-[rgb(var(--color-danger-light))] text-[rgb(var(--color-danger))] border-[rgb(var(--color-danger))] border-opacity-30",
    high: "bg-[rgb(var(--color-warning-light))] text-[rgb(var(--color-warning))] border-[rgb(var(--color-warning))] border-opacity-30",
    medium:
      "bg-[rgb(var(--color-warning-light))] text-[rgb(var(--color-warning))] border-[rgb(var(--color-warning))] border-opacity-30",
    low: "bg-[rgb(var(--color-info-light))] text-[rgb(var(--color-info))] border-[rgb(var(--color-info))] border-opacity-30",
  };
  const p = priority.toLowerCase();
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase ${colors[p] || "bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]"}`}
    >
      {p} Priority
    </span>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const [project, setProject] = useState<ExtendedProject | null>(null);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<
    ProjectTeamPerformance[]
  >([]);
  const [projectRisks, setProjectRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getProjectById(resolvedParams.id),
        taskService.getTasks({ project_id: resolvedParams.id, limit: 100 }),
      ]);

      if (projectRes?.data) {
        const fetchedProject = projectRes.data;
        const tasks = tasksRes?.data || [];
        setProject(fetchedProject);
        setProjectTasks(tasks);
        setTeamPerformance(
          calculateProjectTeamPerformance(fetchedProject, tasks),
        );
      } else {
        setProject(null);
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resolvedParams.id) fetchData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            The project you are looking for does not exist.
          </p>
          <button onClick={() => router.back()} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Derived values
  const projectOwner =
    project.members.find((m) => m.role === "owner") || project.members[0];
  const completionRate =
    projectTasks.length > 0
      ? Math.round(
          (projectTasks.filter(
            (t) =>
              t.status === "done" ||
              t.status === "verified" ||
              t.status === "completed",
          ).length /
            projectTasks.length) *
            100,
        )
      : project.progress;
  const activePhase =
    project.phases.find((p) => p.status === "active") || project.phases[0];

  // Data aggregations
  const todoCount = projectTasks.filter(
    (t) => t.status === "todo" || t.status === "created",
  ).length;
  const inProgressCount = projectTasks.filter(
    (t) => t.status === "in_progress" || t.status === "assigned",
  ).length;
  const doneCount = projectTasks.filter(
    (t) =>
      t.status === "done" ||
      t.status === "verified" ||
      t.status === "completed",
  ).length;

  // Time Tracking (Hours)
  const totalEstimatedHours = projectTasks.reduce(
    (acc, task) => acc + (Number(task.estimatedHours) || 0),
    0,
  );
  const totalActualHours = projectTasks.reduce(
    (acc, task) => acc + (Number(task.actualHours) || 0),
    0,
  );
  const hoursUtilization =
    totalEstimatedHours > 0
      ? Math.round((totalActualHours / totalEstimatedHours) * 100)
      : 0;

  // Urgent Tasks (Critical priority OR Overdue)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const urgentTasks = projectTasks.filter((t) => {
    const isDone =
      t.status === "done" ||
      t.status === "verified" ||
      t.status === "completed";
    if (isDone) return false;

    const isCritical = t.priority === "critical";
    const isOverdue = t.dueDate && new Date(t.dueDate) < today;

    return isCritical || isOverdue;
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
          <Link
            href="/dashboard/projects"
            className="hover:text-[rgb(var(--color-text-primary))]"
          >
            Projects
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[rgb(var(--color-text-primary))] font-medium truncate">
            {project.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header Card */}
            <div className="bg-[rgb(var(--color-surface))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                      {project.name}
                    </h1>
                    <HealthBadge health={project.health} />
                    <PriorityBadge priority={(project as any).priority} />
                  </div>
                  <p className="text-[rgb(var(--color-text-secondary))] max-w-2xl">
                    {project.description}
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  className="p-2 hover:bg-[rgb(var(--color-surface-hover))] rounded-lg text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-[rgb(var(--color-surface-hover))] rounded-lg border border-[rgb(var(--color-border))]">
                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide mb-1">
                    Owner
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-accent-light))] flex items-center justify-center text-[rgb(var(--color-accent))] text-xs font-bold border border-[rgb(var(--color-accent))] border-opacity-30">
                      {projectOwner?.name?.charAt(0) || "?"}
                    </div>
                    <span className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate">
                      {projectOwner?.name || "Unassigned"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide mb-1">
                    Current Phase
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--color-text-primary))]">
                    <Target className="w-4 h-4 text-[rgb(var(--color-accent))]" />
                    {activePhase?.name || "—"}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide mb-1">
                    Target Delivery
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--color-text-primary))]">
                    <Calendar className="w-4 h-4 text-[rgb(var(--color-accent))]" />
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : "No Date"}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide mb-1">
                    Overall Status
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--color-text-primary))]">
                    <Activity
                      className={`w-4 h-4 ${project.health === "green" ? "text-[rgb(var(--color-success))]" : "text-[rgb(var(--color-warning))]"}`}
                    />
                    {project.status.replace("_", " ").toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Phases */}
            {project.phases.length > 0 && (
              <div className="bg-[rgb(var(--color-surface))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] p-6">
                <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] mb-6 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
                  Project Phases
                </h2>
                <div className="space-y-3">
                  {project.phases.map((phase, idx) => {
                    const phaseStatus = String(phase.status).toLowerCase();
                    const isActive = phaseStatus === "active";
                    const isDone =
                      phaseStatus === "completed" || phaseStatus === "done";
                    return (
                      <div key={phase.id} className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2
                            ${isDone ? "bg-[rgb(var(--color-success))] border-[rgb(var(--color-success))] text-white" : isActive ? "border-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent-light))] text-[rgb(var(--color-accent))]" : "border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-tertiary))]"}`}
                        >
                          {isDone ? "✓" : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm font-medium ${isActive ? "text-[rgb(var(--color-accent))]" : isDone ? "text-[rgb(var(--color-text-secondary))] line-through" : "text-[rgb(var(--color-text-primary))]"}`}
                            >
                              {phase.name}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${isDone ? "bg-[rgb(var(--color-success-light))] text-[rgb(var(--color-success))]" : isActive ? "bg-[rgb(var(--color-accent-light))] text-[rgb(var(--color-accent))]" : "bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]"}`}
                            >
                              {phaseStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Team Performance */}
            {teamPerformance.length > 0 && (
              <div className="bg-[rgb(var(--color-surface))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
                    Team Performance
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-[rgb(var(--color-border))]">
                        <th className="pb-3 text-xs font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide">
                          Member
                        </th>
                        <th className="pb-3 text-xs font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide text-center">
                          Completed
                        </th>
                        <th className="pb-3 text-xs font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide text-center">
                          In Progress
                        </th>
                        <th className="pb-3 text-xs font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide text-center">
                          Overdue
                        </th>
                        <th className="pb-3 text-xs font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide text-right">
                          Efficiency
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgb(var(--color-border))]">
                      {teamPerformance.slice(0, 5).map((member) => (
                        <tr
                          key={member.userId}
                          className="hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-surface-hover))] flex items-center justify-center text-xs font-bold text-[rgb(var(--color-text-secondary))]">
                                {member.userName.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                {member.userName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-center text-sm text-[rgb(var(--color-text-secondary))]">
                            {member.tasksCompleted}
                          </td>
                          <td className="py-3 text-center text-sm text-[rgb(var(--color-text-secondary))]">
                            {member.tasksInProgress}
                          </td>
                          <td className="py-3 text-center">
                            {member.overdueTasks > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[rgb(var(--color-danger-light))] text-[rgb(var(--color-danger))]">
                                {member.overdueTasks}
                              </span>
                            ) : (
                              <span className="text-sm text-[rgb(var(--color-text-tertiary))]">
                                —
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                {member.efficiency}%
                              </span>
                              <div className="w-16 h-1.5 bg-[rgb(var(--color-surface-hover))] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${member.efficiency >= 90 ? "bg-[rgb(var(--color-success))]" : member.efficiency >= 70 ? "bg-[rgb(var(--color-accent))]" : "bg-[rgb(var(--color-warning))]"}`}
                                  style={{ width: `${member.efficiency}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-6">
            {/* Project Vital Signs */}
            <div className="bg-[rgb(var(--color-surface))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] p-6">
              <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wide mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[rgb(var(--color-accent))]" />
                Project Vital Signs
              </h3>
              <div className="space-y-4">
                {/* Task Breakdown */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide">
                    Task Breakdown
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      {
                        label: "Todo",
                        count: todoCount,
                        color: "text-[rgb(var(--color-text-secondary))]",
                      },
                      {
                        label: "Active",
                        count: inProgressCount,
                        color: "text-[rgb(var(--color-accent))]",
                      },
                      {
                        label: "completed",
                        count: doneCount,
                        color: "text-[rgb(var(--color-success))]",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="bg-[rgb(var(--color-surface-hover))] rounded-lg p-2"
                      >
                        <p className={`text-xl font-bold ${s.color}`}>
                          {s.count}
                        </p>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Utilization */}
                <div className="space-y-2 pt-2 border-t border-[rgb(var(--color-border))]">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wide">
                      Time Utilization
                    </span>
                    <span
                      className={`text-sm font-bold ${hoursUtilization > 100 ? "text-[rgb(var(--color-warning))]" : "text-[rgb(var(--color-text-primary))]"}`}
                    >
                      {totalActualHours} / {totalEstimatedHours} hrs
                    </span>
                  </div>
                  <div className="w-full bg-[rgb(var(--color-surface-hover))] rounded-full h-1.5">
                    <div
                      className={`${hoursUtilization > 100 ? "bg-[rgb(var(--color-warning))]" : "bg-[rgb(var(--color-accent))]"} h-1.5 rounded-full transition-all`}
                      style={{ width: `${Math.min(hoursUtilization, 100)}%` }}
                    />
                  </div>
                  {hoursUtilization > 100 && (
                    <p className="text-xs text-[rgb(var(--color-warning))] flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" /> Over estimated hours
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Urgent Tasks */}
            <div
              className={`bg-[rgb(var(--color-surface))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] p-6 border-l-4 ${urgentTasks.length > 0 ? "border-l-[rgb(var(--color-danger))]" : "border-l-[rgb(var(--color-border-strong))]"}`}
            >
              <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wide mb-4 flex items-center gap-2">
                <AlertTriangle
                  className={`w-4 h-4 ${urgentTasks.length > 0 ? "text-[rgb(var(--color-danger))]" : "text-[rgb(var(--color-text-tertiary))]"}`}
                />
                Action Required ({urgentTasks.length})
              </h3>
              <div className="space-y-3">
                {urgentTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-[rgb(var(--color-success))] opacity-20 mb-2" />
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                      No overdue or urgent tasks!
                    </p>
                  </div>
                ) : (
                  urgentTasks.slice(0, 5).map((task) => {
                    const isOverdue =
                      task.dueDate && new Date(task.dueDate) < today;
                    return (
                      <div
                        key={task.id}
                        className="p-3 bg-[rgb(var(--color-danger-light))] bg-opacity-30 rounded-lg border border-[rgb(var(--color-danger-light))] border-opacity-50 flex flex-col gap-1"
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate pr-2">
                            {task.title}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${isOverdue ? "bg-[rgb(var(--color-danger-light))] bg-opacity-80 text-[rgb(var(--color-danger))]" : "bg-[rgb(var(--color-warning-light))] bg-opacity-80 text-[rgb(var(--color-warning))]"}`}
                          >
                            {isOverdue ? "OVERDUE" : "CRITICAL"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[rgb(var(--color-text-tertiary))]">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className="capitalize">
                            {task.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {urgentTasks.length > 5 && (
                  <button className="w-full text-center text-xs text-[rgb(var(--color-danger))] font-medium hover:underline pt-2">
                    View all {urgentTasks.length} urgent tasks
                  </button>
                )}
              </div>
            </div>

            {/* Active Tasks */}
            <div className="bg-[rgb(var(--color-surface))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] p-6">
              <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wide mb-4 flex justify-between items-center">
                Team Tasks
                <span className="text-xs bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))] px-2 py-1 rounded-full">
                  {projectTasks.length}
                </span>
              </h3>
              <div className="space-y-2">
                {projectTasks.length === 0 ? (
                  <p className="text-sm text-[rgb(var(--color-text-tertiary))] italic text-center py-4">
                    No tasks yet.
                  </p>
                ) : (
                  projectTasks.slice(0, 6).map((task) => {
                    const firstAssignee = task.assignees?.[0];
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[rgb(var(--color-surface-hover))] transition-colors border border-transparent hover:border-[rgb(var(--color-border))] group"
                      >
                        <div
                          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                            task.priority === "critical"
                              ? "bg-[rgb(var(--color-danger))]"
                              : task.priority === "high"
                                ? "bg-[rgb(var(--color-warning))]"
                                : "bg-[rgb(var(--color-info))]"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate group-hover:text-[rgb(var(--color-accent))] transition-colors">
                            {task.title}
                          </p>
                          {firstAssignee && (
                            <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-0.5">
                              {firstAssignee.name}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                            task.status === "done" ||
                            task.status === "completed"
                              ? "bg-[rgb(var(--color-success-light))] text-[rgb(var(--color-success))]"
                              : task.status === "in_progress"
                                ? "bg-[rgb(var(--color-accent-light))] text-[rgb(var(--color-accent))]"
                                : "bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]"
                          }`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })
                )}
                {projectTasks.length > 6 && (
                  <button className="w-full text-center text-xs text-[rgb(var(--color-accent))] font-medium hover:underline pt-2">
                    View all {projectTasks.length} tasks
                  </button>
                )}
              </div>
            </div>

            {/* Team Members */}
            {project.members.length > 0 && (
              <div className="bg-[rgb(var(--color-surface))] rounded-xl shadow-sm border border-[rgb(var(--color-border))] p-6">
                <h3 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] uppercase tracking-wide mb-4">
                  Team Members ({project.members.length})
                </h3>
                <div className="space-y-2">
                  {project.members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-accent-light))] flex items-center justify-center text-[rgb(var(--color-accent))] text-xs font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] capitalize">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
