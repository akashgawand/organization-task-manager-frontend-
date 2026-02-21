"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/features/permissions";
import { mockTasks, mockUsers } from "@/lib/mockData";
import { getReviewableTasks } from "@/features/reviews/utils";
import ListView from "@/features/tasks/components/views/ListView";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import { Task } from "@/types";
import { ClipboardCheck } from "lucide-react";

export default function ReviewsPage() {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reviewableTasks = useMemo(() => {
    return getReviewableTasks(user, mockTasks, mockUsers);
  }, [user]);

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
          {reviewableTasks.length > 0 ? (
            <ListView tasks={reviewableTasks} onTaskClick={handleReviewClick} />
          ) : (
            <p className="text-gray-500">No tasks found for review.</p>
          )}
        </div>

        {/* Task Detail Modal */}
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onStatusChange={(taskId, status) => {
              console.log("Status changed:", taskId, status);
              // In a real app, you'd update the task status via API here
              // For now, we can just close the modal or refresh data
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
