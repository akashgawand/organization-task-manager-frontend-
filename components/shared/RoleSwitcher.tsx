"use client";

import { setMockUserRole } from "@/features/permissions/hooks/usePermission";
import { UserRole } from "@/types";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface RoleSwitcherProps {
  currentRole: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  team_lead: "Team Lead",
  senior_developer: "Senior Developer",
  employee: "Employee",
};

export default function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setMockUserRole(role);
    setIsOpen(false);
  };

  const roles: UserRole[] = [
    "super_admin",
    "admin",
    "team_lead",
    "senior_developer",
    "employee",
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgb(var(--color-surface-hover))] hover:bg-[rgb(var(--color-surface))] transition-colors border border-[rgb(var(--color-border))]"
        aria-label="Switch role"
      >
        <span className="text-sm font-medium">{roleLabels[currentRole]}</span>
        <ChevronDown
          className="w-4 h-4 transition-transform"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2">
            <p className="text-xs text-[rgb(var(--color-text-tertiary))] px-3 py-2">
              Switch Role (Testing)
            </p>
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  role === currentRole
                    ? "bg-[rgb(var(--color-accent-light))] text-[rgb(var(--color-accent))] font-medium"
                    : "hover:bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-primary))]"
                }`}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
