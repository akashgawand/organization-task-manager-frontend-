"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/features/permissions";
import PermissionGate from "@/features/permissions/components/PermissionGate";
import {
  mockTasks,
  mockUsers,
  mockDepartments,
  mockProjects,
} from "@/lib/mockData";
import {
  calculatePerformanceMetrics,
  calculateTeamProductivity,
  generateTrendData,
  calculateStatusDistribution,
  calculatePriorityDistribution,
  calculateDepartmentWorkload,
  calculateProjectStats,
  calculateDeadlineStats,
  getDailyActiveUsers,
  getRiskAnalysis,
} from "@/lib/analytics";
import PerformanceChart from "@/components/charts/PerformanceChart";
import DistributionChart from "@/components/charts/DistributionChart";
import WorkloadChart from "@/components/charts/WorkloadChart";
import {
  TrendingUp,
  Users,
  Building2,
  AlertCircle,
  Clock,
  CheckCircle2,
  Layers,
  AlertTriangle,
  Flame,
  PauseCircle,
  ArrowRight,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const { user } = useAuth();

  // Calculate all metrics
  const trendData = generateTrendData(mockTasks, 14);
  const statusDistribution = calculateStatusDistribution(mockTasks);
  const priorityDistribution = calculatePriorityDistribution(mockTasks);
  const departmentWorkload = calculateDepartmentWorkload(
    mockDepartments,
    mockTasks,
    mockUsers,
  );
  const metrics = calculatePerformanceMetrics(mockTasks);
  const projectStats = calculateProjectStats(mockProjects);
  const deadlineStats = calculateDeadlineStats(mockTasks);
  const activeEmployees = getDailyActiveUsers(mockUsers);

  // Risk Analysis
  const riskAnalysis = getRiskAnalysis(mockProjects, mockTasks, mockUsers);

  return (
    <DashboardLayout user={user}>
      <PermissionGate requires="canViewAllAnalytics">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Comprehensive performance metrics and insights
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Active Projects */}
            <div className="card hover:shadow-lg transition-all duration-300 border-t-4 border-t-[rgb(var(--color-info))]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[rgb(var(--color-info-light))]">
                  <Layers className="w-6 h-6 text-[rgb(var(--color-info))]" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]">
                  ACTIVE
                </span>
              </div>
              <div className="text-4xl font-bold text-[rgb(var(--color-text-primary))] mb-1">
                {projectStats.active}
              </div>
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                Projects currently in progress
              </p>
            </div>

            {/* 2. Project Status Breakdown */}
            <div className="card hover:shadow-lg transition-all duration-300 border-t-4 border-t-[rgb(var(--color-accent))]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[rgb(var(--color-accent-light))]">
                  <Building2 className="w-6 h-6 text-[rgb(var(--color-accent))]" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]">
                  STATUS
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[rgb(var(--color-success))]">
                    {projectStats.completed}
                  </div>
                  <div className="text-xs text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider">
                    Done
                  </div>
                </div>
                <div className="h-8 w-px bg-[rgb(var(--color-border))]"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[rgb(var(--color-info))]">
                    {projectStats.active}
                  </div>
                  <div className="text-xs text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider">
                    Active
                  </div>
                </div>
                <div className="h-8 w-px bg-[rgb(var(--color-border))]"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[rgb(var(--color-danger))]">
                    {projectStats.delayed}
                  </div>
                  <div className="text-xs text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider">
                    Delayed
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Task Completion Rate */}
            <div className="card hover:shadow-lg transition-all duration-300 border-t-4 border-t-[rgb(var(--color-success))]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[rgb(var(--color-success-light))]">
                  <CheckCircle2 className="w-6 h-6 text-[rgb(var(--color-success))]" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]">
                  RATE
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-4xl font-bold text-[rgb(var(--color-text-primary))]">
                  {Math.round(metrics.completionRate)}%
                </div>
              </div>
              <div className="w-full bg-[rgb(var(--color-surface-hover))] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[rgb(var(--color-success))] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${metrics.completionRate}%` }}
                ></div>
              </div>
            </div>

            {/* 4. Active Employees */}
            <div className="card hover:shadow-lg transition-all duration-300 border-t-4 border-t-[rgb(var(--color-warning))]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[rgb(var(--color-warning-light))]">
                  <Users className="w-6 h-6 text-[rgb(var(--color-warning))]" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]">
                  ONLINE
                </span>
              </div>
              <div className="text-4xl font-bold text-[rgb(var(--color-text-primary))] mb-1">
                {activeEmployees}
              </div>
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                Employees active today
              </p>
            </div>

            {/* 5. Missed Deadlines */}
            <div className="card hover:shadow-lg transition-all duration-300 border-t-4 border-t-[rgb(var(--color-danger))]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[rgb(var(--color-danger-light))]">
                  <AlertCircle className="w-6 h-6 text-[rgb(var(--color-danger))]" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]">
                  MISSED
                </span>
              </div>
              <div
                className={`text-4xl font-bold mb-1 ${deadlineStats.missedThisWeek > 0 ? "text-[rgb(var(--color-danger))]" : "text-[rgb(var(--color-text-primary))]"}`}
              >
                {deadlineStats.missedThisWeek}
              </div>
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                Deadlines missed this week
              </p>
            </div>

            {/* 6. Avg Task Time */}
            <div className="card hover:shadow-lg transition-all duration-300 border-t-4 border-t-[rgb(var(--color-purple,var(--color-accent)))]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[rgb(var(--color-purple-light,var(--color-accent-light)))]">
                  <Clock className="w-6 h-6 text-[rgb(var(--color-purple,var(--color-accent)))]" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]">
                  AVG TIME
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <div className="text-4xl font-bold text-[rgb(var(--color-text-primary))]">
                  {metrics.averageCompletionTime.toFixed(1)}
                </div>
                <span className="text-xl text-[rgb(var(--color-text-tertiary))] font-medium">
                  hrs
                </span>
              </div>
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                Average completion time
              </p>
            </div>
          </div>

          {/* Performance Trends */}
          <PerformanceChart
            data={trendData}
            title="Task Completion Trends"
            type="area"
          />

          {/* 🚨 Risk & Alerts Radar (Redesigned) */}
          <div className="bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[rgb(var(--color-border))] flex items-center justify-between bg-gradient-to-r from-[rgb(var(--color-danger-light))] to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full  text-red-500 shadow-lg shadow-[rgb(var(--color-danger-light))]">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))] flex items-center gap-2">
                    Critical Risk Radar
                    
                  </h2>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                    Real-time monitoring of project health, burnout, and
                    critical issues
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[rgb(var(--color-border))]">
              {/* 1. At Risk Projects */}
              <div className="p-6">
                <h3 className="font-semibold flex items-center gap-2 text-[rgb(var(--color-text-primary))] mb-4 uppercase text-xs tracking-wider">
                  <AlertCircle className="w-4 h-4 text-[rgb(var(--color-warning))]" />{" "}
                  Project Health
                </h3>
                <div className="space-y-4">
                  {riskAnalysis.atRiskProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-[rgb(var(--color-text-tertiary))]">
                      <CheckCircle2 className="w-8 h-8 opacity-20 mb-2" />
                      <span className="text-sm">All projects healthy</span>
                    </div>
                  ) : (
                    riskAnalysis.atRiskProjects.slice(0, 3).map((p) => (
                      <div key={p.id} className="group relative">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-sm text-[rgb(var(--color-text-primary))] truncate w-24 md:w-full">
                            {p.name}
                          </p>
                          <span className="text-xs font-bold text-[rgb(var(--color-danger))] bg-[rgb(var(--color-danger-light))] px-1.5 py-0.5 rounded">
                            RISK
                          </span>
                        </div>
                        <div className="w-full bg-[rgb(var(--color-surface-hover))] rounded-full h-1.5 mb-1">
                          <div
                            className="bg-[rgb(var(--color-success))] h-1.5 rounded-full"
                            style={{ width: `${p.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))] flex justify-between">
                          <span>Progress: {p.progress}%</span>
                          <span>Timeline: 70%+</span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 2. Burnout Risk */}
              <div className="p-6">
                <h3 className="font-semibold flex items-center gap-2 text-[rgb(var(--color-text-primary))] mb-4 uppercase text-xs tracking-wider">
                  <Flame className="w-4 h-4 text-[rgb(var(--color-danger))]" />{" "}
                  Burnout Monitor
                </h3>
                <div className="space-y-4">
                  {riskAnalysis.burnoutRiskUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-[rgb(var(--color-text-tertiary))]">
                      <Users className="w-8 h-8 opacity-20 mb-2" />
                      <span className="text-sm">Workload balanced</span>
                    </div>
                  ) : (
                    riskAnalysis.burnoutRiskUsers.slice(0, 3).map((item) => (
                      <div
                        key={item.user.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--color-surface-hover))] border border-transparent hover:border-[rgb(var(--color-danger-light))] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[rgb(var(--color-surface))] flex items-center justify-center text-xs font-bold text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))]">
                            {item.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                              {item.user.name}
                            </p>
                            <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                              {item.taskCount} active tasks
                            </p>
                          </div>
                        </div>
                        <TrendingUp className="w-4 h-4 text-[rgb(var(--color-danger))]" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 3. Overdue Tasks */}
              <div className="p-6">
                <h3 className="font-semibold flex items-center gap-2 text-[rgb(var(--color-text-primary))] mb-4 uppercase text-xs tracking-wider">
                  <Clock className="w-4 h-4 text-[rgb(var(--color-danger))]" />{" "}
                  Critical Overdue
                </h3>
                <div className="space-y-3">
                  {riskAnalysis.overdueTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-[rgb(var(--color-text-tertiary))]">
                      <CheckCircle2 className="w-8 h-8 opacity-20 mb-2" />
                      <span className="text-sm">No overdue tasks</span>
                    </div>
                  ) : (
                    riskAnalysis.overdueTasks.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        className="border-l-2 border-[rgb(var(--color-danger))] pl-3 py-1"
                      >
                        <p className="font-medium text-sm text-[rgb(var(--color-text-primary))] truncate">
                          {t.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[rgb(var(--color-danger))] font-medium bg-[rgb(var(--color-danger-light))] px-1.5 rounded">
                            {t.priority}
                          </span>
                          <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                            Due{" "}
                            {t.dueDate
                              ? new Date(t.dueDate).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 4. Stagnant Projects */}
              <div className="p-6">
                <h3 className="font-semibold flex items-center gap-2 text-[rgb(var(--color-text-primary))] mb-4 uppercase text-xs tracking-wider">
                  <PauseCircle className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />{" "}
                  Stagnation
                </h3>
                {riskAnalysis.stagnantProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-[rgb(var(--color-text-tertiary))]">
                    <Activity className="w-8 h-8 opacity-20 mb-2" />
                    <span className="text-sm">Activity healthy</span>
                  </div>
                ) : (
                  riskAnalysis.stagnantProjects.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[rgb(var(--color-surface-hover))]"
                    >
                      <div>
                        <p className="font-medium text-sm text-[rgb(var(--color-text-primary))]">
                          {p.name}
                        </p>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-0.5">
                          Inactive &gt; 7 days
                        </p>
                      </div>
                      <Activity className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] opacity-50" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Charts & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DistributionChart
              data={statusDistribution}
              title="Task Status Distribution"
            />
            <DistributionChart
              data={priorityDistribution}
              title="Priority Distribution"
              colors={[
                "rgb(var(--color-danger))",
                "rgb(var(--color-warning))",
                "rgb(var(--color-info))",
                "rgb(var(--color-success))",
              ]}
            />
          </div>

          {/* Workload */}
          <WorkloadChart
            data={departmentWorkload}
            title="Department Workload"
          />
        </div>
      </PermissionGate>
    </DashboardLayout>
  );
}
