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
    active: "bg-green-100 text-green-700",
    idle: "bg-orange-100 text-orange-700",
    archived: "bg-gray-100 text-gray-700",
  };

  return (
    <Link
      href={`/dashboard/teams/${team.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-primary/50 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${team.avatar || "bg-gray-100 text-gray-600"}`}
          >
            {team.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
              {team.name}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded textxs font-medium ${statusColors[team.status] || "bg-gray-100"}`}
            >
              {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-6 line-clamp-2 h-10">
        {team.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-1 text-sm text-gray-600"
            title="Members"
          >
            <Users className="w-4 h-4 text-gray-400" />
            <span>{memberCount}</span>
          </div>
          <div
            className="flex items-center gap-1 text-sm text-gray-600"
            title="Active Projects"
          >
            <Folder className="w-4 h-4 text-gray-400" />
            <span>{activeProjectCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Lead:</span>
          {lead ? (
            <Avatar name={lead.name} size="sm" className="w-6 h-6 text-xs" />
          ) : (
            <span className="text-xs text-gray-400">None</span>
          )}
        </div>
      </div>
    </Link>
  );
}
