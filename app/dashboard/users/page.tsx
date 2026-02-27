"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { User, UserRole } from "@/types";
import { userService } from "@/app/services/userServices";
import { useAuth } from "@/features/permissions";
import UserTable from "@/features/users/components/UserTable";
import EditUserModal from "@/components/modals/EditUserModal";
import DeleteUserDialog from "@/features/users/components/DeleteUserDialog";
import { Search, Users } from "lucide-react";

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q),
        ),
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    if (!user || user.id === "guest") return;
    try {
      setIsLoading(true);
      const res = await userService.getUsers();
      setUsers(res.data || []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (u: User) => {
    setSelectedUser(u);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (u: User) => {
    setSelectedUser(u);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (id: string, data: Partial<User>) => {
    try {
      // First update the user details (name, email, isActive)
      await userService.updateUser(id, data);

      // If role changed, call the role endpoint (unless we just merged it into the main update,
      // but userService has a separate changeUserRole for it)
      if (data.role && data.role !== selectedUser?.role) {
        await userService.changeUserRole(id, data.role as UserRole);
      }

      await fetchUsers(); // Refresh
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      setIsDeleting(true);
      await userService.deleteUser(selectedUser.id);
      await fetchUsers();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to delete user", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Title & Info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-accent))]/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-[rgb(var(--color-accent))]" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                    User Management
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] border border-[rgb(var(--color-accent))]/20">
                    {isLoading ? "..." : `${users.length} Users`}
                  </span>
                </div>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                  Manage system users, roles, and access controls &middot; {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Right: Quick Stats + Search */}
            <div className="flex items-center gap-4 md:gap-6 flex-wrap">
              {/* Quick Stats */}
              <div className="flex items-center gap-4 md:gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-success))]" />
                  <div className="text-sm">
                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">{users.filter(u => u.isActive).length}</span>
                    <span className="text-[rgb(var(--color-text-tertiary))] ml-1">Active</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-[rgb(var(--color-border))]" />
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-text-tertiary))]" />
                  <div className="text-sm">
                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">{users.filter(u => !u.isActive).length}</span>
                    <span className="text-[rgb(var(--color-text-tertiary))] ml-1">Inactive</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-[rgb(var(--color-border))] hidden md:block" />

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))]" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg text-sm focus:outline-none focus:border-[rgb(var(--color-accent))] transition-colors w-full md:w-56"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="card p-0! overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-[rgb(var(--color-border))] border-t-[rgb(var(--color-accent))] animate-spin" />
            </div>
          ) : (
            <UserTable
              users={filteredUsers}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          )}
        </div>
      </div>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={handleEditSubmit}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        userName={selectedUser?.name || "this user"}
        isDeleting={isDeleting}
      />
    </DashboardLayout>
  );
}
