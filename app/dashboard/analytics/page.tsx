"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/features/permissions";
import PermissionGate from "@/features/permissions/components/PermissionGate";
import { analyticsServices, AnalyticsOverview, TrendDataPoint } from "@/app/services/analyticsServices";
import {
  TrendHighchart,
  DonutHighchart,
  UserCompletedTasksChart,
} from "@/components/charts/HighchartsComponents";
import {
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ListTodo,
  BarChart3,
} from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();

  const [trendFilter, setTrendFilter] = useState<"7" | "14" | "custom">("14");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch standard overview
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await analyticsServices.getOverview();
        setOverview(data);
      } catch (error) {
        console.error("Failed to load analytics overview:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  // Fetch dynamic trend data
  useEffect(() => {
    const fetchTrend = async () => {
      try {
        let data: TrendDataPoint[] = [];
        if (trendFilter === "custom" && customStart && customEnd) {
          data = await analyticsServices.getTrend(customStart, customEnd);
        } else {
          // If 7 or 14 is active, calculate start from today
          const days = parseInt(trendFilter) || 14;
          const end = new Date();
          const start = new Date();
          start.setDate(end.getDate() - (days - 1));

          data = await analyticsServices.getTrend(
            start.toISOString().split("T")[0],
            end.toISOString().split("T")[0]
          );
        }
        setTrendData(data);
      } catch (error) {
        console.error("Failed to load analytics trend:", error);
      }
    };
    fetchTrend();
  }, [trendFilter, customStart, customEnd]);

  if (loading || !overview) {
    return (
      <DashboardLayout user={user}>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(var(--color-accent))]"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Colors for donut chart
  const statusColors = [
    "rgb(var(--color-surface-hover))", // todo
    "rgb(var(--color-info))",          // in_progress
    "rgb(var(--color-warning))",       // review
    "rgb(var(--color-success))",       // done
    "rgb(var(--color-danger))",        // blocked
  ];

  return (
    <DashboardLayout user={user}>
      <PermissionGate requires="canViewAllAnalytics">
        <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent))]/70 flex items-center justify-center shadow-lg shadow-[rgb(var(--color-accent))]/20">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--color-text-primary))]">
                  Analytics Overview
                </h1>
                <p className="text-sm text-[rgb(var(--color-text-tertiary))] mt-0.5">
                  High-level operational metrics and team performance
                </p>
              </div>
            </div>
            {/* <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-success))] bg-[rgb(var(--color-success-light))] px-3 py-1.5 rounded-full font-medium shadow-sm border border-[rgba(var(--color-success),0.2)]">
              <TrendingUp className="w-4 h-4" />
              <span>System healthy</span>
            </div> */}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Projects"
              value={overview.activeProjectsCount}
              icon={<Briefcase className="w-5 h-5 text-[#60A5FA]" />}
              trend="In Production"
              trendUp={true}
              trendColor={{ text: '#60A5FA', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)' }}
            />
            <MetricCard
              title="Active Tasks"
              value={overview.activeTasksCount}
              icon={<ListTodo className="w-5 h-5 text-[#FBBF24]" />}
              trend="Pending Work"
              trendUp={true}
              trendColor={{ text: '#FBBF24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' }}
            />
            <MetricCard
              title="Completed Tasks"
              value={overview.completedTasksCount}
              icon={<CheckCircle2 className="w-5 h-5 text-[#34D399]" />}
              trend="All Time"
              trendUp={true}
              trendColor={{ text: '#34D399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)' }}
            />
            <MetricCard
              title="Overdue Tasks"
              value={overview.overdueTasksCount}
              icon={<AlertCircle className="w-5 h-5 text-[#FB7185]" />}
              trend="Action Required"
              trendUp={false}
              trendColor={{ text: '#FB7185', bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.25)' }}
            />
          </div>

          {/* Main Chart */}
          <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:border-[rgb(var(--color-border-hover))]">
            <div className="p-6 border-b border-[rgb(var(--color-border))] bg-gradient-to-r from-[rgba(var(--color-surface-hover),0.5)] to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                Performance Activity {trendFilter !== 'custom' ? `(${trendFilter} Days)` : ''}
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                {trendFilter === "custom" && (
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="bg-[rgb(var(--color-surface-hover))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] rounded-md px-2 py-1 outline-none focus:border-[rgb(var(--color-accent))]"
                    />
                    <span className="text-[rgb(var(--color-text-secondary))]">to</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="bg-[rgb(var(--color-surface-hover))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] rounded-md px-2 py-1 outline-none focus:border-[rgb(var(--color-accent))]"
                    />
                  </div>
                )}
                <select
                  value={trendFilter}
                  onChange={(e) => setTrendFilter(e.target.value as "7" | "14" | "custom")}
                  className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] text-sm rounded-lg px-3 py-1.5 outline-none focus:border-[rgb(var(--color-accent))] cursor-pointer hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
                >
                  <option value="7">Last 7 Days</option>
                  <option value="14">Last 14 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>
            <div className="p-4">
              <TrendHighchart data={trendData} />
            </div>
          </div>

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:border-[rgb(var(--color-border-hover))]">
              <div className="p-6 border-b border-[rgb(var(--color-border))] bg-gradient-to-r from-[rgba(var(--color-surface-hover),0.5)] to-transparent">
                <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                  Task Status Distribution
                </h2>
              </div>
              <div className="p-4">
                <DonutHighchart data={overview.statusDistribution} colors={statusColors} />
              </div>
            </div>

            <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:border-[rgb(var(--color-border-hover))]">
              <div className="p-6 border-b border-[rgb(var(--color-border))] bg-gradient-to-r from-[rgba(var(--color-surface-hover),0.5)] to-transparent">
                <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                  User Completed Tasks
                </h2>
              </div>
              <div className="p-4">
                <UserCompletedTasksChart data={overview.userCompletedTasks} />
              </div>
            </div>
          </div>
        </div>
      </PermissionGate>
    </DashboardLayout>
  );
}

function MetricCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  trendColor,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  trendColor?: { text: string; bg: string; border: string };
}) {
  return (
    <div className="relative overflow-hidden bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-[rgb(var(--color-border-hover))] hover:-translate-y-1 group bg-gradient-to-b from-transparent to-[rgba(var(--color-surface-hover),0.5)]">
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 scale-150 transform translate-x-4 -translate-y-4 pointer-events-none">
        {icon}
      </div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
            {title}
          </p>
          <div className="text-3xl font-bold text-[rgb(var(--color-text-primary))] tracking-tight">
            {value}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] shadow-sm group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 relative z-10">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-md border"
          style={
            trendColor
              ? { color: trendColor.text, backgroundColor: trendColor.bg, borderColor: trendColor.border }
              : trendUp
                ? { color: 'rgb(var(--color-success))', backgroundColor: 'rgb(var(--color-success-light))', borderColor: 'rgba(var(--color-success),0.2)' }
                : { color: 'rgb(var(--color-danger))', backgroundColor: 'rgb(var(--color-danger-light))', borderColor: 'rgba(var(--color-danger),0.2)' }
          }
        >
          {trend}
        </span>
        <span className="text-[11px] text-[rgb(var(--color-text-tertiary))] font-medium uppercase tracking-wider">
          vs last period
        </span>
      </div>
    </div>
  );
}
