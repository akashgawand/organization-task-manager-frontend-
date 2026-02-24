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
  getProjectRisks,
  ProjectTeamPerformance,
  ProjectRisk,
} from "@/lib/analytics";

// ─── Sub Components ────────────────────────────────────────────────────────

function HealthBadge({ health }: { health: string }) {
  const colors =
    {
      green: "bg-green-100 text-green-700 border-green-200",
      yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
      red: "bg-red-100 text-red-700 border-red-200",
    }[health] || "bg-gray-100 text-gray-700 border-gray-200";

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
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-blue-100 text-blue-700 border-blue-200",
  };
  const p = priority.toLowerCase();
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase ${colors[p] || "bg-gray-100 text-gray-700"}`}
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
  const [projectRisks, setProjectRisks] = useState<ProjectRisk[]>([]);
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
        setProjectRisks(getProjectRisks(fetchedProject));
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
          <p className="text-gray-500 mb-4">
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

  // Task stats
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

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard/projects" className="hover:text-primary">
            Projects
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate">
            {project.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left Column ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {project.name}
                    </h1>
                    <HealthBadge health={project.health} />
                    <PriorityBadge priority={(project as any).priority} />
                  </div>
                  <p className="text-gray-500 max-w-2xl">
                    {project.description}
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Owner
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold border border-indigo-200">
                      {projectOwner?.name?.charAt(0) || "?"}
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {projectOwner?.name || "Unassigned"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Current Phase
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Target className="w-4 h-4 text-blue-500" />
                    {activePhase?.name || "—"}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Target Delivery
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : "No Date"}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Overall Status
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Activity
                      className={`w-4 h-4 ${project.health === "green" ? "text-green-500" : "text-orange-500"}`}
                    />
                    {project.status.replace("_", " ").toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Phases */}
            {project.phases.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-gray-400" />
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
                            ${isDone ? "bg-green-500 border-green-500 text-white" : isActive ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-400"}`}
                        >
                          {isDone ? "✓" : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm font-medium ${isActive ? "text-blue-700" : isDone ? "text-gray-500 line-through" : "text-gray-700"}`}
                            >
                              {phase.name}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${isDone ? "bg-green-100 text-green-700" : isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    Team Performance
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-100">
                        <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Member
                        </th>
                        <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                          Completed
                        </th>
                        <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                          In Progress
                        </th>
                        <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">
                          Overdue
                        </th>
                        <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                          Efficiency
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {teamPerformance.slice(0, 5).map((member) => (
                        <tr
                          key={member.userId}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                {member.userName.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {member.userName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-center text-sm text-gray-600">
                            {member.tasksCompleted}
                          </td>
                          <td className="py-3 text-center text-sm text-gray-600">
                            {member.tasksInProgress}
                          </td>
                          <td className="py-3 text-center">
                            {member.overdueTasks > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                {member.overdueTasks}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {member.efficiency}%
                              </span>
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${member.efficiency >= 90 ? "bg-green-500" : member.efficiency >= 70 ? "bg-blue-500" : "bg-orange-500"}`}
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
            {/* Progress Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Project Vital Signs
              </h3>
              <div className="space-y-6">
                {/* Overall Progress */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Overall Progress
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Task Breakdown */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Task Breakdown
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      {
                        label: "Todo",
                        count: todoCount,
                        color: "text-gray-600",
                      },
                      {
                        label: "Active",
                        count: inProgressCount,
                        color: "text-blue-600",
                      },
                      {
                        label: "Done",
                        count: doneCount,
                        color: "text-green-600",
                      },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-50 rounded-lg p-2">
                        <p className={`text-xl font-bold ${s.color}`}>
                          {s.count}
                        </p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Risks & Issues */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 border-l-orange-500">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                Key Risks & Issues
              </h3>
              <div className="space-y-3">
                {projectRisks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20 mb-2" />
                    <p className="text-sm text-gray-500">
                      No open risks identified.
                    </p>
                  </div>
                ) : (
                  projectRisks.map((risk) => (
                    <div
                      key={risk.id}
                      className="p-3 bg-orange-50 rounded-lg border border-orange-100"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            risk.type === "budget"
                              ? "bg-green-100 text-green-700"
                              : risk.type === "timeline"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {risk.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(risk.dateIdentified).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {risk.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex justify-between items-center">
                Team Tasks
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {projectTasks.length}
                </span>
              </h3>
              <div className="space-y-2">
                {projectTasks.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">
                    No tasks yet.
                  </p>
                ) : (
                  projectTasks.slice(0, 6).map((task) => {
                    const firstAssignee = task.assignees?.[0];
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
                      >
                        <div
                          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                            task.priority === "critical"
                              ? "bg-red-500"
                              : task.priority === "high"
                                ? "bg-orange-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                            {task.title}
                          </p>
                          {firstAssignee && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {firstAssignee.name}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                            task.status === "done" ||
                            task.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : task.status === "in_progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })
                )}
                {projectTasks.length > 6 && (
                  <button className="w-full text-center text-xs text-primary font-medium hover:underline pt-2">
                    View all {projectTasks.length} tasks
                  </button>
                )}
              </div>
            </div>

            {/* Team Members */}
            {project.members.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  Team Members ({project.members.length})
                </h3>
                <div className="space-y-2">
                  {project.members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
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
