"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import {
  SearchIcon,
  SunIcon,
  MoonIcon,
  UserIcon, // Icon component
  SettingsIcon,
} from "@/components/icons";
import { Plus } from "lucide-react"; // Import Plus for the button
import Avatar from "@/components/shared/Avatar";
import NotificationPanel from "@/components/shared/NotificationPanel";
import RoleSwitcher from "@/components/shared/RoleSwitcher";
import { mockNotifications } from "@/lib/mockData";
import { authService } from "@/app/services/authServices";

export interface TopNavProps {
  user: User;
  onOpenTaskModal?: () => void;
}

export default function TopNav({ user, onOpenTaskModal }: TopNavProps) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = mockNotifications.filter((n) => n.userId === user.id);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleNavigate = (path: string) => {
    setShowUserMenu(false);
    router.push(path);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    authService.logout();
  };

  const handleMarkAsRead = (id: string) => {
    // In a real app, this would call an API
    console.log("Mark as read:", id);
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[var(--sidebar-width)] h-[var(--header-height)] bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] z-30 px-6 transition-all duration-300">
      <div className="flex items-center justify-between h-full">
        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))]">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search tasks, projects, teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Create Task Button - NEW */}
          {onOpenTaskModal && (
            <button
              onClick={onOpenTaskModal}
              className="btn btn-primary hidden sm:flex items-center gap-2 mr-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="btn btn-ghost p-2 text-[rgb(var(--color-text-secondary))]"
            aria-label="Toggle dark mode"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Notifications */}
          <NotificationPanel
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
          />

          {/* Role Switcher - For Testing (Kept for now, though Sidebar has one too) */}
          {/* <RoleSwitcher currentRole={user.role} /> */}
          {/* Commenting out duplicate role switcher if sidebar has better one, or keeping it as fallback. Let's keep it but maybe hide on small screens? Or just keep it. */}
          {/* <div className="hidden lg:block">
            <RoleSwitcher currentRole={user.role} />
          </div> */}

          <div className="h-6 w-px bg-[rgb(var(--color-border))] mx-1" />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[rgb(var(--color-surface-hover))] transition-smooth"
            >
              <Avatar name={user.name} avatar={user.avatar} size="sm" />
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                  {user.name}
                </p>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] capitalize">
                  {user.role.replace("_", " ")}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-12 w-56 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-[rgb(var(--color-border))] bg-gray-50/50">
                  <p className="font-medium text-[rgb(var(--color-text-primary))]">
                    {user.name}
                  </p>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))] truncate">
                    {user.email}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => handleNavigate("/dashboard/profile")}
                    className="flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg hover:bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-primary))] transition-colors"
                  >
                    <UserIcon />
                    <span className="text-sm">Profile</span>
                  </button>
                  <button
                    onClick={() => handleNavigate("/dashboard/settings")}
                    className="flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg hover:bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-primary))] transition-colors"
                  >
                    <SettingsIcon />
                    <span className="text-sm">Settings</span>
                  </button>
                </div>
                <div className="p-2 border-t border-[rgb(var(--color-border))]">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
