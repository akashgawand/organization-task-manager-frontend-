"use client";

import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  KanbanBoard,
  ListView,
  CalendarView,
  TimelineView,
  Task,
  TaskStatus,
  ViewMode,
} from "@/features/tasks";
import { useAuth } from "@/features/permissions";
import {
  LayoutGrid,
  List,
  Calendar,
  GanttChart,
  Filter,
  Plus,
  ArrowUpDown,
  ChevronDown,
  Search,
} from "lucide-react";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import CreateTaskModal from "@/features/tasks/components/CreateTaskModal";
import Pagination from "@/components/shared/Pagination";
import { taskService } from "@/app/services/taskServices";
import { projectService } from "@/app/services/projectServices";
import { ExtendedProject } from "@/features/projects/types";

type FilterType = "all" | "today" | "week" | "overdue";
type TaskScopeType = "my_tasks" | "team_tasks" | "all_tasks";

export default function MyTasksPage() {
  const { user } = useAuth();

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ExtendedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filter, setFilter] = useState<FilterType>("all");
  const [taskScope, setTaskScope] = useState<TaskScopeType>("my_tasks");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "status">(
    "dueDate",
  );

  // New Enhanced Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Backend tracking for Pagination metadata
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTasksData = async () => {
    try {
      setIsLoading(true);

      const isPrivileged =
        user?.role === "admin" || user?.role === "super_admin";

      const baseParams: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (!isPrivileged) {
        baseParams.assigned_to = user?.id;
      }
      if (selectedProjectId !== "all") {
        baseParams.project_id = selectedProjectId;
      }
      if (priorityFilter !== "all") {
        baseParams.priority = priorityFilter.toUpperCase();
      }

      let allFetchedTasks: Task[] = [];
      let maxTotalPages = 1;
      let sumTotalCount = 0;

      if (statusFilter === "all") {
        // Fetch limit per column/status to populate the Kanban board evenly
        const statusesToFetch = [
          "TODO",
          "IN_PROGRESS",
          "REVIEW",
          "DONE",
          "BLOCKED",
        ];
        const statusPromises = statusesToFetch.map((st) =>
          taskService.getTasks({ ...baseParams, status: st }),
        );

        const results = await Promise.all(statusPromises);

        results.forEach((res) => {
          if (res?.data) {
            allFetchedTasks = [...allFetchedTasks, ...res.data];
          }
          if (res?.pagination) {
            maxTotalPages = Math.max(
              maxTotalPages,
              res.pagination.totalPages || 1,
            );
            sumTotalCount += res.pagination.total || 0;
          } else {
            sumTotalCount += (res?.data || []).length;
          }
        });
      } else {
        const fetchParams = {
          ...baseParams,
          status: statusFilter.toUpperCase(),
        };
        const res = await taskService.getTasks(fetchParams);

        if (res?.data) {
          allFetchedTasks = res.data;
        }
        if (res?.pagination) {
          maxTotalPages = res.pagination.totalPages || 1;
          sumTotalCount = res.pagination.total || 0;
        } else {
          sumTotalCount = (res?.data || []).length;
        }
      }

      const projectsRes = await projectService.getProjects();

      setAllTasks(allFetchedTasks);
      setTotalPages(maxTotalPages);
      setTotalCount(sumTotalCount);

      if (Array.isArray(projectsRes)) {
        setProjects(projectsRes);
      }
    } catch (error) {
      console.error("Error fetching tasks/projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasksData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    currentPage,
    itemsPerPage,
    selectedProjectId,
    statusFilter,
    priorityFilter,
  ]);

  const getFilteredTasks = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    let filtered = allTasks;

    // Apply Scope Filter (only relevant if they fetched more than just their own tasks)
    if (taskScope === "my_tasks" && user) {
      filtered = filtered.filter(
        (t) =>
          t.assigneeIds.includes(String(user.id)) ||
          t.creatorId === String(user.id),
      );
    } else if (taskScope === "team_tasks" && user) {
      const teamProjectIds = projects
        .filter((p) =>
          p.members.some((m) => String(m.userId) === String(user.id)),
        )
        .map((p) => p.id);

      filtered = filtered.filter((t) => teamProjectIds.includes(t.projectId));
    }

    // Filter by date
    switch (filter) {
      case "today":
        filtered = filtered.filter((t) => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          return (
            dueDate >= today &&
            dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
          );
        });
        break;
      case "week":
        filtered = filtered.filter((t) => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          return dueDate >= today && dueDate <= weekFromNow;
        });
        break;
      case "overdue":
        filtered = filtered.filter((t) => {
          if (!t.dueDate) return false;
          return new Date(t.dueDate) < today && t.status !== "done";
        });
        break;
    }

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q),
      );
    }

    // Sort the tasks
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === "priority") {
        const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        return (
          (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
        );
      }
      if (sortBy === "status") {
        const statusWeight = {
          blocked: 5,
          todo: 4,
          in_progress: 3,
          review: 2,
          done: 1,
        };
        return (statusWeight[b.status] || 0) - (statusWeight[a.status] || 0);
      }
      return 0;
    });

    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  // With Backend Pagination, the slice is obsolete. Our API has pruned it.
  // We mirror the filtered data array directly off the backend.
  const paginatedTasks = filteredTasks;

  // Reset pagination if filters alter the array size radically
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  // Get user's projects (projects where user is a member)
  const userProjects = useMemo(() => {
    if (!user?.id) return projects;
    return projects.filter((project) =>
      project.members.some((m) => String(m.userId) === String(user.id)),
    );
  }, [projects, user]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedTask(null), 150);
  };

  const handleSubtaskToggle = async (taskId: string, subtaskId: string) => {
    // Optimistic update
    setAllTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st,
          );
          return { ...task, subtasks: updatedSubtasks };
        }
        return task;
      }),
    );
    // TODO: Call backend to toggle subtask (Need API support for subtasks)
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      setAllTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task,
        ),
      );
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleAddTask = (status: TaskStatus) => {
    setIsCreateModalOpen(true);
  };

  const handleCreateTaskSubmit = async (taskData: any) => {
    try {
      // CreateTaskModal already sends assignee_ids — don't override with assigned_to
      await taskService.createTask(taskData);
      // Refetch to stay in sync with backend
      fetchTasksData();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const viewModes = [
    {
      id: "kanban" as ViewMode,
      label: "Board",
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      id: "list" as ViewMode,
      label: "List",
      icon: <List className="w-5 h-5" />,
    },
    {
      id: "calendar" as ViewMode,
      label: "Calendar",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: "timeline" as ViewMode,
      label: "Timeline",
      icon: <GanttChart className="w-5 h-5" />,
    },
  ];

  const filters = [
    { id: "all" as FilterType, label: "All Tasks" },
    { id: "today" as FilterType, label: "Due Today" },
    { id: "week" as FilterType, label: "This Week" },
    { id: "overdue" as FilterType, label: "Overdue" },
  ];

  const selectedProject = userProjects.find((p) => p.id === selectedProjectId);

  if (isLoading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-accent))]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Showing {filteredTasks.length} {filter === "all" ? "" : filter}{" "}
              tasks of {totalCount} total
              {selectedProjectId !== "all" && selectedProject
                ? ` in ${selectedProject.name}`
                : ""}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        {/* Task Scope Filter (For Admins/Super Admins) */}
        {(user?.role === "admin" || user?.role === "super_admin") && (
          <div className="flex bg-[rgb(var(--color-surface))] p-1 rounded-lg border border-[rgb(var(--color-border))] w-fit">
            <button
              onClick={() => setTaskScope("my_tasks")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                taskScope === "my_tasks"
                  ? "bg-[rgb(var(--color-accent))] text-white shadow-sm"
                  : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))]"
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setTaskScope("team_tasks")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                taskScope === "team_tasks"
                  ? "bg-[rgb(var(--color-accent))] text-white shadow-sm"
                  : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))]"
              }`}
            >
              Team Tasks
            </button>
            <button
              onClick={() => setTaskScope("all_tasks")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                taskScope === "all_tasks"
                  ? "bg-[rgb(var(--color-accent))] text-white shadow-sm"
                  : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))]"
              }`}
            >
              All Tasks
            </button>
          </div>
        )}

        {/* Project Selector - NEW FEATURE */}
        <div className="bg-[rgb(var(--color-surface))] rounded-lg p-4 border border-[rgb(var(--color-border))]">
          <div className="flex items-center gap-4">
            <label
              htmlFor="project-filter"
              className="text-sm font-medium text-[rgb(var(--color-text-secondary))]"
            >
              Project:
            </label>
            <div className="relative flex-1 max-w-md">
              <select
                id="project-filter"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full appearance-none px-4 py-2 pr-10 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-accent))] focus:border-[rgb(var(--color-accent))] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="all">
                  All Projects ({allTasks.length} tasks)
                </option>
                {userProjects.map((project) => {
                  const taskCount = allTasks.filter(
                    (t) => t.projectId === project.id,
                  ).length;
                  return (
                    <option key={project.id} value={project.id}>
                      {project.name} ({taskCount} tasks)
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-tertiary))] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* View Mode Switcher */}
          <div className="flex gap-2">
            {viewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`btn btn-sm ${
                  viewMode === mode.id ? "btn-primary" : "btn-ghost"
                }`}
                title={mode.label}
              >
                {mode.icon}
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[rgb(var(--color-text-secondary))]">
              Filter:
            </span>
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`btn btn-sm ${
                  filter === f.id ? "btn-primary" : "btn-secondary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort Button / Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[rgb(var(--color-text-secondary))]">
              Sort By:
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-accent))] focus:outline-none focus:border-[rgb(var(--color-accent))] cursor-pointer font-medium"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Enhanced Secondary Filters (Search, Status, Priority) */}
        <div className="flex items-center gap-4 flex-wrap bg-[rgb(var(--color-surface))] p-3 rounded-lg border border-[rgb(var(--color-border))]">
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
              <option value="done">Done</option>
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
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="px-3 py-1.5 rounded-md bg-[rgb(var(--color-surface-hover))]">
            <span className="text-[rgb(var(--color-text-tertiary))]">
              Page Total:
            </span>{" "}
            <span className="font-medium">{filteredTasks.length}</span> /{" "}
            <span className="text-[rgb(var(--color-text-tertiary))]">
              {totalCount} total queries matches
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-[rgb(var(--color-info-light))]">
            <span className="text-[rgb(var(--color-info))]">In Progress:</span>{" "}
            <span className="font-medium">
              {filteredTasks.filter((t) => t.status === "in_progress").length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-[rgb(var(--color-success-light))]">
            <span className="text-[rgb(var(--color-success))]">Completed:</span>{" "}
            <span className="font-medium">
              {filteredTasks.filter((t) => t.status === "done").length}
            </span>
          </div>
        </div>

        {/* View Container */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg p-6">
          {viewMode === "kanban" && (
            <KanbanBoard
              tasks={paginatedTasks}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
              isRestrictedRole={
                user?.role === "senior_developer" || user?.role === "employee"
              }
            />
          )}

          {viewMode === "list" && (
            <ListView tasks={paginatedTasks} onTaskClick={handleTaskClick} />
          )}

          {viewMode === "calendar" && (
            <CalendarView
              tasks={paginatedTasks}
              onTaskClick={handleTaskClick}
            />
          )}

          {viewMode === "timeline" && (
            <TimelineView
              tasks={paginatedTasks}
              onTaskClick={handleTaskClick}
            />
          )}

          {(viewMode === "kanban" || viewMode === "list") &&
            filteredTasks.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
        </div>
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubtaskToggle={handleSubtaskToggle}
        onStatusChange={handleStatusChange}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTaskSubmit}
      />
    </DashboardLayout>
  );
}
