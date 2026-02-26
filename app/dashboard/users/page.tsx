"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { User, UserRole } from "@/types";
import { userService } from "@/app/services/userServices";
import { useAuth } from "@/features/permissions";
import UserTable from "@/features/users/components/UserTable";
import EditUserModal from "@/components/modals/EditUserModal";
import DeleteUserDialog from "@/features/users/components/DeleteUserDialog";
import { Search } from "lucide-react";

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Manage system users, roles, and access controls
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))]" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]/30 transition-all w-full md:w-64"
              />
            </div>
            {/* Add User Button can be implemented if needed, omitted as per requirements */}
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
