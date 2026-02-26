"use client";

import { AlertTriangle } from "lucide-react";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  isDeleting: boolean;
}

export default function DeleteUserDialog({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isDeleting,
}: DeleteUserDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
      <div className="bg-[rgb(var(--color-surface))] rounded-2xl shadow-2xl w-full max-w-sm flex flex-col border border-[rgb(var(--color-border))] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4 mx-auto">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] text-center mb-2">
            Delete User
          </h2>
          <p className="text-center text-[rgb(var(--color-text-secondary))] mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[rgb(var(--color-text-primary))]">
              {userName}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 rounded-xl font-medium text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
