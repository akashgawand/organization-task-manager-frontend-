"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { teamService } from "@/app/services/teamServices";

interface EditTeamModalProps {
  team: { id: string; name: string; description?: string };
  onClose: () => void;
  onSaved: (updated: any) => void;
}

export default function EditTeamModal({
  team,
  onClose,
  onSaved,
}: EditTeamModalProps) {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await teamService.updateTeam(team.id, {
        name,
        description,
      });
      onSaved(updated);
    } catch (err: any) {
      setError(err?.message || "Failed to update team");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-[rgb(var(--color-surface))] rounded-xl shadow-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
          <h2 className="text-xl font-bold">Edit Team Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--color-surface-hover))] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-[rgb(var(--color-danger-light))] text-[rgb(var(--color-danger))] rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">
                Team Name{" "}
                <span className="text-[rgb(var(--color-danger))]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-[rgb(var(--color-border))] rounded-lg bg-[rgb(var(--color-surface))] focus:outline-none focus:border-[rgb(var(--color-accent))] resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-[rgb(var(--color-border))]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-hover))] transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-[rgb(var(--color-accent))] text-white rounded-lg hover:bg-[rgb(var(--color-accent-hover))] transition-colors disabled:opacity-60 text-sm font-medium shadow-lg shadow-indigo-500/20"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
