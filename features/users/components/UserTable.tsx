"use client";

import { User } from "@/types";
import Avatar from "@/components/shared/Avatar";
import Badge from "@/components/shared/Badge";
import { MoreVertical, Edit2, Trash2, Eye } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
      case "admin":
        return "accent";
      case "team_lead":
      case "senior_developer":
        return "info";
      default:
        return "default";
    }
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-[rgb(var(--color-text-secondary))]">
        No users found.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))]">
            <th className="px-6 py-4 font-medium">User</th>
            <th className="px-6 py-4 font-medium">Role</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Joined</th>
            <th className="px-6 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgb(var(--color-border))]">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} avatar={user.avatar} size="sm" />
                  <div>
                    <p className="font-medium text-[rgb(var(--color-text-primary))]">
                      {user.name}
                    </p>
                    <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                      {user.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant={
                    getRoleBadgeVariant(user.role) as
                      | "success"
                      | "warning"
                      | "danger"
                      | "info"
                      | "default"
                  }
                  label={formatRole(user.role)}
                />
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant={user.isActive ? "success" : "default"}
                  label={user.isActive ? "Active" : "Inactive"}
                />
              </td>
              <td className="px-6 py-4 text-[rgb(var(--color-text-secondary))]">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </td>
              <td className="px-6 py-4 text-right relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === user.id ? null : user.id);
                  }}
                  className="p-2 rounded-lg hover:bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {openMenuId === user.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-8 top-10 w-48 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl shadow-xl z-10 py-1"
                  >
                    <Link
                      href={`/dashboard/users/${user.id}`}
                      className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </Link>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onEdit(user);
                      }}
                      className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Role & Status
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenuId(null);
                        onDelete(user);
                      }}
                      className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete User
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
