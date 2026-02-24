"use client";

import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/features/permissions";
import { getReviewableTasks } from "@/features/reviews/utils";
import ListView from "@/features/tasks/components/views/ListView";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import { Task } from "@/types";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { taskService } from "@/app/services/taskServices";
import { userService } from "@/app/services/userServices";

export default function ReviewsPage() {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tasksRes, usersRes] = await Promise.all([
        taskService.getTasks(),
        userService.getUsers(),
      ]);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
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
  }, []);

  const reviewableTasks = useMemo(() => {
    if (!user) return [];
    return getReviewableTasks(user, tasks, users);
  }, [user, tasks, users]);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Task Reviews</h1>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Review tasks from your team members
            </p>
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

        {/* Task List */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Pending Reviews</h3>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-accent))]" />
            </div>
          ) : reviewableTasks.length > 0 ? (
            <ListView tasks={reviewableTasks} onTaskClick={handleReviewClick} />
          ) : (
            <p className="text-[rgb(var(--color-text-tertiary))]">
              No tasks found for review.
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
