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
} from "lucide-react";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import CreateTaskModal from "@/features/tasks/components/CreateTaskModal";
import { taskService } from "@/app/services/taskServices";
import { projectService } from "@/app/services/projectServices";
import { ExtendedProject } from "@/features/projects/types";

type FilterType = "all" | "today" | "week" | "overdue";

export default function MyTasksPage() {
  const { user } = useAuth();

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ExtendedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchDate = async () => {
        try {
          setIsLoading(true);
          const [tasksRes, projectsRes] = await Promise.all([
            taskService.getTasks({ assigned_to: user.id }),
            projectService.getProjects(),
          ]);

          if (tasksRes && tasksRes.data) {
            setAllTasks(tasksRes.data);
          }
          if (projectsRes && projectsRes.data) {
            setProjects(projectsRes.data);
          }
        } catch (error) {
          console.error("Error fetching tasks/projects:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDate();
    }
  }, [user]);

  // Filter tasks based on selected filter
  const getFilteredTasks = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    let filtered = allTasks;

    // Filter by project
    if (selectedProjectId !== "all") {
      filtered = filtered.filter((t) => t.projectId === selectedProjectId);
    }

    // Filter by date
    switch (filter) {
      case "today":
        return filtered.filter((t) => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          return (
            dueDate >= today &&
            dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
          );
        });
      case "week":
        return filtered.filter((t) => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          return dueDate >= today && dueDate <= weekFromNow;
        });
      case "overdue":
        return filtered.filter((t) => {
          if (!t.dueDate) return false;
          return new Date(t.dueDate) < today && t.status !== "done";
        });
      default:
        return filtered;
    }
  };

  const filteredTasks = getFilteredTasks();

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
      if (user?.id) {
        const tasksRes = await taskService.getTasks({ assigned_to: user.id });
        if (tasksRes && tasksRes.data) {
          setAllTasks(tasksRes.data);
        }
      }
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
              {filteredTasks.length} {filter === "all" ? "" : filter} tasks
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

          {/* Sort Button */}
          <button className="btn btn-secondary btn-sm">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>
        </div>

        {/* Tasks Count */}
        <div className="flex items-center gap-4 text-sm">
          <div className="px-3 py-1.5 rounded-md bg-[rgb(var(--color-surface-hover))]">
            <span className="text-[rgb(var(--color-text-tertiary))]">
              Total:
            </span>{" "}
            <span className="font-medium">{filteredTasks.length}</span>
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
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
            />
          )}

          {viewMode === "list" && (
            <ListView tasks={filteredTasks} onTaskClick={handleTaskClick} />
          )}

          {viewMode === "calendar" && (
            <CalendarView tasks={filteredTasks} onTaskClick={handleTaskClick} />
          )}

          {viewMode === "timeline" && (
            <TimelineView tasks={filteredTasks} onTaskClick={handleTaskClick} />
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
