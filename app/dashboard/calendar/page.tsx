"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CalendarView } from "@/features/tasks";
import { useAuth } from "@/features/permissions";
import { taskService } from "@/app/services/taskServices";
import { Filter, Users, RefreshCw } from "lucide-react";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import DateTasksModal from "@/components/modals/DateTasksModal";
import { Task } from "@/features/tasks/types";

type CalendarFilter = "my-tasks" | "all-tasks" | "team-tasks";

export default function CalendarPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<CalendarFilter>("my-tasks");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);

  // ── Fetch tasks from backend ────────────────────────────────────────────────
  const fetchTasks = useCallback(
    async (currentFilter: CalendarFilter) => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const params: Record<string, any> = { limit: 500 };
        if (currentFilter === "my-tasks") {
          params.assigned_to = user.id;
        }
        // "all-tasks" and "team-tasks" fetch everything; team-tasks filtered client-side
        const result = await taskService.getTasks(params);
        let fetched: Task[] = result?.data ?? [];

        if (currentFilter === "team-tasks") {
          fetched = fetched.filter((t) => (t.assigneeIds?.length ?? 0) > 1);
        }
        setTasks(fetched);
      } catch (err) {
        console.error("Failed to fetch calendar tasks:", err);
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    fetchTasks(filter);
  }, [fetchTasks, filter]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = (newFilter: CalendarFilter) => {
    setFilter(newFilter);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDateClick = (date: Date, dayTasks: Task[]) => {
    setSelectedDate(date);
    setSelectedDateTasks(dayTasks);
    setIsDateModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setTimeout(() => setSelectedTask(null), 150);
  };

  const handleCloseDateModal = () => {
    setIsDateModalOpen(false);
    setTimeout(() => {
      setSelectedDate(null);
      setSelectedDateTasks([]);
    }, 150);
  };

  const handleTaskToggle = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newStatus = task.status === "done" ? "in_progress" : "done";
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    setSelectedDateTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error("Failed to update task status:", err);
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t)),
      );
    }
  };

  const handleSubtaskToggle = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s,
              ),
            }
          : t,
      ),
    );
  };

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const filters: {
    id: CalendarFilter;
    label: string;
    icon?: React.ReactNode;
  }[] = [
    { id: "my-tasks", label: "My Tasks" },
    { id: "all-tasks", label: "All Tasks" },
    {
      id: "team-tasks",
      label: "Team Tasks",
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Calendar</h1>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Your life status map — click on dates to see tasks
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Refresh */}
            <button
              onClick={() => fetchTasks(filter)}
              disabled={loading}
              className="btn btn-ghost btn-sm p-2"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFilterChange(f.id)}
                  className={`btn btn-sm ${filter === f.id ? "btn-primary" : "btn-secondary"}`}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-sm text-[rgb(var(--color-text-tertiary))]">
              Total Tasks
            </div>
            <div className="text-2xl font-bold mt-1">{tasks.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-[rgb(var(--color-text-tertiary))]">
              With Deadlines
            </div>
            <div className="text-2xl font-bold mt-1">
              {tasks.filter((t) => t.dueDate).length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-[rgb(var(--color-text-tertiary))]">
              Completed
            </div>
            <div className="text-2xl font-bold mt-1 text-[rgb(var(--color-success))]">
              {completedTasks}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-[rgb(var(--color-text-tertiary))]">
              Completion Rate
            </div>
            <div className="text-2xl font-bold mt-1 text-[rgb(var(--color-accent))]">
              {completionRate}%
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg p-6">
          {loading ? (
            <div className="flex items-center justify-center h-96 text-[rgb(var(--color-text-tertiary))]">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading calendar…
            </div>
          ) : (
            <CalendarView
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onDateClick={handleDateClick}
            />
          )}
        </div>
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSubtaskToggle={handleSubtaskToggle}
        onStatusChange={handleStatusChange}
      />

      <DateTasksModal
        isOpen={isDateModalOpen}
        onClose={handleCloseDateModal}
        date={selectedDate}
        tasks={selectedDateTasks}
        onTaskToggle={handleTaskToggle}
        onTaskClick={handleTaskClick}
      />
    </DashboardLayout>
  );
}
