import { Team } from "@/types";
import { User } from "@/types";
import Avatar from "@/components/shared/Avatar";
import { MoreVertical, Users, Folder, Activity } from "lucide-react";
import Link from "next/link";

interface TeamCardProps {
  team: Team;
  lead: User | undefined;
  memberCount: number;
  activeProjectCount: number;
}

export default function TeamCard({
  team,
  lead,
  memberCount,
  activeProjectCount,
}: TeamCardProps) {
  const statusColors = {
    active:
      "bg-[rgb(var(--color-success-light))] text-[rgb(var(--color-success))]",
    idle: "bg-[rgb(var(--color-warning-light))] text-[rgb(var(--color-warning))]",
    archived:
      "bg-[rgb(var(--color-surface-active))] text-[rgb(var(--color-text-secondary))]",
  };

  return (
    <Link
      href={`/dashboard/teams/${team.id}`}
      className="block bg-[rgb(var(--color-surface))] rounded-xl border border-[rgb(var(--color-border))] p-5 hover:shadow-md hover:border-[rgb(var(--color-accent))] transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${team.avatar || "bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]"}`}
          >
            {team.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-accent))] transition-colors">
              {team.name}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[team.status] || "bg-[rgb(var(--color-surface-hover))]"}`}
            >
              {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-6 line-clamp-2 h-10">
        {team.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-[rgb(var(--color-border))]">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-1 text-sm text-[rgb(var(--color-text-secondary))]"
            title="Members"
          >
            <Users className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            <span>{memberCount}</span>
          </div>
          <div
            className="flex items-center gap-1 text-sm text-[rgb(var(--color-text-secondary))]"
            title="Active Projects"
          >
            <Folder className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            <span>{activeProjectCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
            Lead:
          </span>
          {lead ? (
            <Avatar name={lead.name} size="sm" className="w-6 h-6 text-xs" />
          ) : (
            <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
              None
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
