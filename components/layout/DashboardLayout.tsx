"use client";

import { ReactNode } from "react";
import { User } from "@/types";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import CreateTaskModal from "@/features/tasks/components/CreateTaskModal";
import { taskService } from "@/app/services/taskServices";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface DashboardLayoutProps {
  children: ReactNode;
  user: User | null;
}

export default function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initialize push notifications
  const { permission, requestPermission } = usePushNotifications(
    String(user?.id || ""),
  );

  useEffect(() => {
    // Automatically prompt Chrome native permission API if not fully determined
    if (permission === "default") {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleCreateTask = async (data: any) => {
    const result = await taskService.createTask(data);
    setIsTaskModalOpen(false);
    return result;
  };
  return (
    <div className="min-h-screen bg-[rgb(var(--color-background))]">
      <Sidebar
        userRole={user?.role ?? "employee"}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <TopNav
        user={user}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <main
        className={`mt-[var(--header-height)] p-6 transition-all duration-300 ${isSidebarCollapsed ? "lg:ml-[var(--sidebar-collapsed-width)]" : "lg:ml-[var(--sidebar-width)]"}`}
      >
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
