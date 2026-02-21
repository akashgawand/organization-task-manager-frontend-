"use client";

import { useState, useEffect } from "react";
import { teamService } from "@/app/services/teamServices";
import { userService } from "@/app/services/userServices";
import Avatar from "@/components/shared/Avatar";
import { Search, X, Plus, Users, Loader2 } from "lucide-react";

interface AddMemberModalProps {
  team: { id: string; name: string };
  currentMembers: { id: string }[];
  onClose: () => void;
  onAdded: () => void;
}

export default function AddMemberModal({
  team,
  currentMembers,
  onClose,
  onAdded,
}: AddMemberModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await userService.getUsers({ limit: 200 });
        setAllUsers(result?.data ?? []);
      } catch {
        setAllUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const currentMemberIds = new Set(currentMembers.map((m) => m.id));
  const available = allUsers.filter((u) => !currentMemberIds.has(u.id));
  const filtered = available.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await teamService.addMembers(team.id, selectedIds);
      onAdded();
    } catch (err: any) {
      setError(err?.message || "Failed to add members");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[rgb(var(--color-surface))] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
          <div>
            <h2 className="text-xl font-bold">Add Members</h2>
            <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
              Add new members to {team.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--color-surface-hover))] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            {error && (
              <div className="p-3 bg-[rgb(var(--color-danger-light))] text-[rgb(var(--color-danger))] rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))] text-sm"
              />
            </div>

            {/* User list */}
            <div className="border border-[rgb(var(--color-border))] rounded-lg max-h-80 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--color-accent))]" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-[rgb(var(--color-text-tertiary))] text-sm">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>
                    {available.length === 0
                      ? "All users are already members"
                      : "No users found"}
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filtered.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[rgb(var(--color-surface-hover))] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, u.id]);
                          } else {
                            setSelectedIds(
                              selectedIds.filter((id) => id !== u.id),
                            );
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <Avatar name={u.name} avatar={u.avatar} size="sm" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                          {u.role?.replace("_", " ")} • {u.email}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {selectedIds.length > 0 && (
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {selectedIds.length} member{selectedIds.length > 1 ? "s" : ""}{" "}
                selected
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-[rgb(var(--color-border))]">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedIds.length === 0 || submitting}
              className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {submitting
                ? "Adding…"
                : `Add ${selectedIds.length > 0 ? selectedIds.length : ""} Member${selectedIds.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
