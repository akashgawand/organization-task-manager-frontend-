"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  KanbanBoard,
  ListView,
  CalendarView,
  TimelineView,
} from "@/features/tasks";
import { taskService } from "@/app/services/taskServices";
import { useAuth } from "@/features/permissions";
import { Task, TaskStatus, ViewMode } from "@/types";
import {
  GridIcon,
  ListIcon,
  CalendarIcon,
  TimelineIcon,
  FilterIcon,
} from "@/components/icons";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import { TaskIcon, ClockIcon, CheckIcon } from "@/components/icons";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Search, ChevronDown } from "lucide-react";
import Pagination from "@/components/shared/Pagination";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  // Enhanced Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTasksData = async () => {
    try {
      setIsLoading(true);
      if (!user || user.id === "guest") {
        setIsLoading(false);
        return;
      }
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter.toUpperCase();
      }
      if (priorityFilter !== "all") {
        params.priority = priorityFilter.toUpperCase();
      }

      const tasksResponse = await taskService.getTasks(params);
      const tasks = tasksResponse.data || [];

      // Apply client-side text search if needed (since backend might not support it yet)
      const filteredTasks = searchQuery
        ? tasks.filter((t: Task) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        : tasks;

      setUserTasks(filteredTasks);

      if (tasksResponse.pagination) {
        setTotalPages(tasksResponse.pagination.totalPages || 1);
        setTotalCount(tasksResponse.pagination.total || 0);
      } else {
        setTotalCount(filteredTasks.length);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage, itemsPerPage, statusFilter, priorityFilter, searchQuery]);

  // Calculate metrics based on ALL items if possible, or currently fetched for now
  const totalTasks = totalCount;
  const completedTasks = userTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = userTasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const overdueTasks = userTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done",
  ).length;

  const handleTaskClick = (task: Task) => {
    // In real app, open modal
    console.log("Open task:", task);
  };

  const handleAddTask = (status: TaskStatus) => {
    console.log("Add task with status:", status);
    // In real app, open create modal
  };

  const viewModes: {
    mode: ViewMode;
    icon: React.ComponentType;
    label: string;
  }[] = [
      { mode: "kanban", icon: GridIcon, label: "Board" },
      { mode: "list", icon: ListIcon, label: "List" },
      { mode: "calendar", icon: CalendarIcon, label: "Calendar" },
      { mode: "timeline", icon: TimelineIcon, label: "Timeline" },
    ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Greeting & Info */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-secondary,var(--color-accent)))] flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                    Welcome back, {user?.name?.split(" ")[0] || "User"}
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] border border-[rgb(var(--color-accent))]/20 capitalize">
                    {user?.role?.replace(/_/g, " ") || "Employee"}
                  </span>
                </div>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            {/* Right: Quick Status Strip */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-danger))] animate-pulse" />
                <div className="text-sm">
                  <span className="font-semibold text-[rgb(var(--color-text-primary))]">{overdueTasks}</span>
                  <span className="text-[rgb(var(--color-text-tertiary))] ml-1">Overdue</span>
                </div>
              </div>
              <div className="w-px h-6 bg-[rgb(var(--color-border))]" />
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-info))]" />
                <div className="text-sm">
                  <span className="font-semibold text-[rgb(var(--color-text-primary))]">{inProgressTasks}</span>
                  <span className="text-[rgb(var(--color-text-tertiary))] ml-1">In Progress</span>
                </div>
              </div>
              <div className="w-px h-6 bg-[rgb(var(--color-border))]" />
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-success))]" />
                <div className="text-sm">
                  <span className="font-semibold text-[rgb(var(--color-text-primary))]">{completedTasks}</span>
                  <span className="text-[rgb(var(--color-text-tertiary))] ml-1">Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Total Tasks"
            value={totalTasks}
            icon={<TaskIcon />}
          />
          <AnalyticsCard
            title="In Progress"
            value={inProgressTasks}
            icon={<ClockIcon />}
            color="rgb(var(--color-info))"
          />
          <AnalyticsCard
            title="Completed"
            value={completedTasks}
            icon={<CheckIcon />}
            color="rgb(var(--color-success))"
          />
          <AnalyticsCard
            title="Overdue"
            value={overdueTasks}
            icon={<ClockIcon />}
            color="rgb(var(--color-danger))"
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {viewModes.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`btn btn-sm ${viewMode === mode ? "btn-primary" : "btn-secondary"}`}
              >
                <Icon />
                <span className="hidden md:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Secondary Filters (Search, Status, Priority) */}
        <div className="flex items-center gap-4 flex-wrap bg-[rgb(var(--color-surface))] p-3 rounded-lg border border-[rgb(var(--color-border))] mt-4">
          {/* Text Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] focus:border-[rgb(var(--color-accent))] focus:outline-none transition-colors"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-2 text-sm rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-accent))] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Under Review</option>
              <option value="done">completed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))] pointer-events-none" />
          </div>

          {/* Priority Dropdown */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-2 text-sm rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-accent))] focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))] pointer-events-none" />
          </div>

          {/* Items Per Page Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
              Show:
            </span>
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing page size
                  fetchTasksData(); // Re-fetch immediately
                }}
                className="appearance-none pl-3 pr-8 py-2 text-sm rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-accent))] focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg p-6 min-h-[400px]">
          {isLoading ? (
            <LoadingSpinner size="lg" />
          ) : (
            <>
              {viewMode === "kanban" && (
                <KanbanBoard
                  tasks={userTasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTask}
                  isRestrictedRole={false}
                />
              )}
              {viewMode === "list" && (
                <ListView tasks={userTasks} onTaskClick={handleTaskClick} />
              )}
              {viewMode === "calendar" && (
                <CalendarView tasks={userTasks} onTaskClick={handleTaskClick} />
              )}
              {viewMode === "timeline" && (
                <TimelineView tasks={userTasks} onTaskClick={handleTaskClick} />
              )}

              <div className="mt-6 border-t border-[rgb(var(--color-border))] pt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
