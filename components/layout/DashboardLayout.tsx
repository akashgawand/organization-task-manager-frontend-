"use client";

import { ReactNode } from "react";
import { User } from "@/types";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateTaskModal from "@/features/tasks/components/CreateTaskModal";
import { taskService } from "@/app/services/taskServices";

interface DashboardLayoutProps {
  children: ReactNode;
  user: User;
}

export default function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleCreateTask = async (data: any) => {
    await taskService.createTask(data);
    setIsTaskModalOpen(false);
  };
  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      <Sidebar userRole={user.role} />
      <TopNav user={user} onOpenTaskModal={() => setIsTaskModalOpen(true)} />

      <main className="lg:ml-[var(--sidebar-width)] mt-[var(--header-height)] p-6">
        {children}
      </main>

      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Floating Action Button (FAB) for Mobile or quick access if TopNav doesn't have it yet */}
      <button
        onClick={() => setIsTaskModalOpen(true)}
        className="fixed bottom-8 right-8 btn btn-primary rounded-full p-4 shadow-lg lg:hidden"
        title="Create Task"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
