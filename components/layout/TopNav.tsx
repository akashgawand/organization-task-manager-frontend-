"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "@/types";
import {
  SunIcon,
  MoonIcon,
} from "@/components/icons";
import { Plus, ChevronDown, LogOut } from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import NotificationPanel from "@/components/shared/NotificationPanel";
import { mockNotifications } from "@/lib/mockData";
import { authService } from "@/app/services/authServices";

export interface TopNavProps {
  user: User;
  onOpenTaskModal?: () => void;
}

export default function TopNav({ user, onOpenTaskModal }: TopNavProps) {
  const [isDark, setIsDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync dark state on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  const notifications = mockNotifications.filter((n) => n.userId === user.id);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    authService.logout();
  };

  const handleMarkAsRead = (id: string) => {
    console.log("Mark as read:", id);
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[var(--sidebar-width)] h-[var(--header-height)] bg-[rgb(var(--color-surface))]/80 border-b border-[rgb(var(--color-border))]/60 z-30 px-4 md:px-6 transition-all duration-300">
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
          />

          {/* Separator */}
          <div className="h-5 w-px bg-[rgb(var(--color-border))]/60 mx-1" />

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`cursor-pointer flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 ${showUserMenu
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
                className={`w-3.5 h-3.5 text-[rgb(var(--color-text-tertiary))] hidden md:block transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""
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
