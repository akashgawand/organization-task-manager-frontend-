"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "@/types";
import { SunIcon, MoonIcon } from "@/components/icons";
import {
  Plus,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import NotificationPanel from "@/components/shared/NotificationPanel";
import { authService } from "@/app/services/authServices";
import {
  notificationService,
  Notification,
} from "@/app/services/notificationServices";
import Link from "next/link";

export interface TopNavProps {
  user: User;
  onOpenTaskModal?: () => void;
  isSidebarCollapsed?: boolean;
}

export default function TopNav({
  user,
  onOpenTaskModal,
  isSidebarCollapsed = false,
}: TopNavProps) {
  const [isDark, setIsDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Poll for notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Sync dark state on mount
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);

    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    authService.logout();
  };

  const handleMarkAsRead = async (id: string | number) => {
    try {
      if (typeof id === "number") {
        await notificationService.markAsRead(id);
        // Optimistically update UI
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === id ? { ...n, is_read: true } : n,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 ${isSidebarCollapsed ? "lg:left-[var(--sidebar-collapsed-width)]" : "lg:left-[var(--sidebar-width)]"} h-[var(--header-height)] bg-[rgb(var(--color-surface))]/80 border-b border-[rgb(var(--color-border))]/60 z-30 px-4 md:px-6 transition-all duration-300`}
    >
      <div className="flex items-center justify-between h-full max-w-[1600px] mx-auto">
        {/* Left — Page Context (empty for now, keeps layout balanced) */}
        <div className="flex-1" />

        {/* Right — Actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Create Task CTA */}
          {onOpenTaskModal && (
            <button
              onClick={onOpenTaskModal}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent))]/90 shadow-sm shadow-[rgb(var(--color-accent))]/20 hover:shadow-md hover:shadow-[rgb(var(--color-accent))]/30 active:scale-[0.97] transition-all duration-200"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>New Task</span>
            </button>
          )}

          {/* Separator */}
          <div className="hidden sm:block h-5 w-px bg-[rgb(var(--color-border))]/60 mx-1" />

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="relative p-2.5 rounded-xl text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-surface-hover))] active:scale-95 transition-all duration-200"
            aria-label="Toggle dark mode"
          >
            <div className="relative w-[18px] h-[18px]">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </div>
          </button>

          {/* Notifications */}
          <NotificationPanel
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onOpen={fetchNotifications}
          />

          {/* Separator */}
          <div className="h-5 w-px bg-[rgb(var(--color-border))]/60 mx-1" />

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`cursor-pointer flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 ${
                showUserMenu
                  ? "bg-[rgb(var(--color-surface-hover))] ring-1 ring-[rgb(var(--color-border))]"
                  : "hover:bg-[rgb(var(--color-surface-hover))]"
              }`}
            >
              <Avatar name={user.name} avatar={user.avatar} size="sm" />
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-[rgb(var(--color-text-primary))] leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-[rgb(var(--color-text-tertiary))] capitalize leading-tight mt-0.5">
                  {user.role.replace(/_/g, " ")}
                </p>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[rgb(var(--color-text-tertiary))] hidden md:block transition-transform duration-200 ${
                  showUserMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-2xl shadow-2xl shadow-black/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Card */}
                <div className="p-5 bg-gradient-to-br from-[rgba(var(--color-accent),0.06)] via-transparent to-transparent">
                  <div className="flex items-center gap-3.5">
                    <Avatar name={user.name} avatar={user.avatar} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[rgb(var(--color-text-primary))] truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate mt-0.5">
                        {user.email}
                      </p>
                      <span className="inline-flex items-center mt-2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[rgba(var(--color-accent),0.1)] text-[rgb(var(--color-accent))] border border-[rgba(var(--color-accent),0.15)]">
                        {user.role.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2 border-t border-[rgb(var(--color-border))]/60">
                  <Link
                    href="/dashboard/user-settings"
                    onClick={() => setShowUserMenu(false)}
                    className="group cursor-pointer flex items-center gap-3 w-full px-4 py-2.5 text-left rounded-xl text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text-primary))] transition-all duration-200"
                  >
                    <SettingsIcon className="w-4 h-4 group-hover:rotate-45 transition-transform duration-200" />
                    <span className="text-sm font-medium">User Settings</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="group cursor-pointer flex items-center gap-3 w-full px-4 py-2.5 text-left rounded-xl text-[rgb(var(--color-text-secondary))] hover:bg-red-500/8 hover:text-red-500 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                    <span className="text-sm font-medium">Sign Out</span>
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
