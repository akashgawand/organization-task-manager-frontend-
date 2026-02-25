"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { User, UserRole } from "@/types";
import RoleSelect from "@/components/shared/RoleSelect";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (id: string, data: Partial<User>) => void;
}

const modalInputClasses = "w-full px-4 py-2.5 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/30 focus:border-[rgb(var(--color-accent))] transition-all duration-200";

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onSubmit,
}: EditUserModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(user.id, formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60  animate-in fade-in duration-200">
      <div className="bg-[rgb(var(--color-surface))] rounded-2xl shadow-2xl shadow-black/20 w-full max-w-md flex flex-col border border-[rgb(var(--color-border))] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))] bg-gradient-to-r from-[rgba(var(--color-surface-hover),0.5)] to-transparent rounded-t-2xl">
          <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">Edit User</h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl hover:bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">Name</label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={modalInputClasses}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">Email</label>
            <input
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={modalInputClasses}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">Role</label>
            <RoleSelect
              value={(formData.role as UserRole) || "employee"}
              onChange={(role) => setFormData({ ...formData, role })}
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))]">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive || false}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 accent-[rgb(var(--color-accent))] rounded"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-[rgb(var(--color-text-primary))] cursor-pointer"
            >
              Active User
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 flex justify-end gap-3 border-t border-[rgb(var(--color-border))]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text-primary))] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[rgb(var(--color-accent))] rounded-xl hover:bg-[rgb(var(--color-accent))]/90 shadow-sm shadow-[rgb(var(--color-accent))]/20 hover:shadow-md active:scale-[0.97] transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
