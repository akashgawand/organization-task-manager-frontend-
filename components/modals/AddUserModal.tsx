"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { UserRole } from "@/types";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  onSubmit,
}: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee" as UserRole,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 ">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Add New User</h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Temporary Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters, with 1 uppercase, 1 lowercase, 1
              number.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
            >
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="team_lead">Team Lead</option>
              <option value="senior_developer">Senior Developer</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
