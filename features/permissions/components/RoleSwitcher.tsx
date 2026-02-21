"use client";

import { useState, useEffect } from "react";
import { UserRole } from "@/types";
import { setMockUserRole, useAuth } from "../hooks/usePermission";
import { Shield, ChevronUp, Check } from "lucide-react";

export default function RoleSwitcher() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: "super_admin", label: "Super Admin", desc: "Full Access" },
    { id: "admin", label: "Admin", desc: "Dept Manager" },
    { id: "team_lead", label: "Team Lead", desc: "Team Scope" },
    { id: "senior_developer", label: "Senior Developer", desc: "Team Scope" },
    { id: "employee", label: "Employee", desc: "Self Scope" },
  ];

  const handleRoleChange = (role: UserRole) => {
    setMockUserRole(role);
    setIsOpen(false);
  };

  return (
    <div className="relative border-t border-[rgb(var(--color-border))] p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[rgb(var(--color-surface-hover))] transition-colors text-left group"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
          <Shield className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate">
            {roles.find((r) => r.id === user.role)?.label}
          </p>
          <p className="text-xs text-[rgb(var(--color-text-secondary))] truncate">
            Switch Role
          </p>
        </div>
        <ChevronUp className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-2 px-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-1 overflow-hidden">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleChange(role.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                  ${
                    user.role === role.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }
                `}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{role.label}</span>
                  <span className="text-[10px] text-gray-500">{role.desc}</span>
                </div>
                {user.role === role.id && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
