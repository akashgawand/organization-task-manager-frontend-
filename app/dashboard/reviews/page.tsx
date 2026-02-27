"use client";

import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/features/permissions";
import { getReviewableTasks } from "@/features/reviews/utils";
import ListView from "@/features/tasks/components/views/ListView";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import Pagination from "@/components/shared/Pagination";
import { Task } from "@/types";
import { ClipboardCheck, Loader2, Search, ChevronDown } from "lucide-react";
import { taskService } from "@/app/services/taskServices";
import { userService } from "@/app/services/userServices";

export default function ReviewsPage() {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Backend tracking for Pagination metadata
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const baseParams: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (priorityFilter !== "all") {
        baseParams.priority = priorityFilter.toUpperCase();
      }

      let allFetchedTasks: Task[] = [];
      let maxTotalPages = 1;
      let sumTotalCount = 0;

      if (statusFilter === "all") {
        const statusesToFetch = ["TODO", "IN_PROGRESS", "REVIEW"];
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

      const usersRes = await userService.getUsers();

      setTasks(allFetchedTasks);
      setTotalPages(maxTotalPages);
      setTotalCount(sumTotalCount);

      setUsers(
        Array.isArray(usersRes?.data)
          ? usersRes.data
          : Array.isArray(usersRes)
            ? usersRes
            : [],
      );
    } catch (error) {
      console.error("Failed to fetch data for reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, statusFilter, priorityFilter]);

  const reviewableTasks = useMemo(() => {
    if (!user) return [];
    return getReviewableTasks(user, tasks, users);
  }, [user, tasks, users]);

  const filteredTasks = useMemo(() => {
    let filtered = reviewableTasks;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [reviewableTasks, searchQuery]);

  // Mirror filteredTasks directly since backend sliced the array
  const paginatedTasks = filteredTasks;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const handleReviewClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Title & Info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-accent))]/10 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-6 h-6 text-[rgb(var(--color-accent))]" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                    Task Reviews
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] border border-[rgb(var(--color-accent))]/20">
                    {isLoading ? "..." : `${reviewableTasks.length} Pending`}
                  </span>
                </div>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                  Review tasks from your team members &middot; {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Right: Quick Stats */}
            <div className="flex items-center gap-4 md:gap-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-warning))] animate-pulse" />
                <div className="text-sm">
                  <span className="font-semibold text-[rgb(var(--color-text-primary))]">{reviewableTasks.filter(t => t.status === "review").length}</span>
                  <span className="text-[rgb(var(--color-text-tertiary))] ml-1">Under Review</span>
                </div>
              </div>
              <div className="w-px h-6 bg-[rgb(var(--color-border))]" />
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-info))]" />
                <div className="text-sm">
                  <span className="font-semibold text-[rgb(var(--color-text-primary))]">{reviewableTasks.filter(t => t.status === "in_progress").length}</span>
                  <span className="text-[rgb(var(--color-text-tertiary))] ml-1">In Progress</span>
                </div>
              </div>
              <div className="w-px h-6 bg-[rgb(var(--color-border))]" />
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-success))]" />
                <div className="text-sm">
                  <span className="font-semibold text-[rgb(var(--color-text-primary))]">{totalCount}</span>
                  <span className="text-[rgb(var(--color-text-tertiary))] ml-1">Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tasks to Review</p>
              <h3 className="text-2xl font-bold">{reviewableTasks.length}</h3>
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
              <option value="review">Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="todo">To Do</option>
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
                  setCurrentPage(1); // Reset to first page
                  fetchData(); // Force reload from server immediately
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

        {/* Task List */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Pending Reviews</h3>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-accent))]" />
            </div>
          ) : filteredTasks.length > 0 ? (
            <>
              <ListView
                tasks={paginatedTasks}
                onTaskClick={handleReviewClick}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <p className="text-[rgb(var(--color-text-tertiary))]">
              No tasks found.
            </p>
          )}
        </div>

        {/* Task Detail Modal */}
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onStatusChange={async (taskId, status) => {
              try {
                await taskService.updateTaskStatus(taskId, status);
                fetchData(); // Refresh the list to reflect status changes
              } catch (error) {
                console.error("Failed to update task status:", error);
                alert("Failed to update task. Please try again.");
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
