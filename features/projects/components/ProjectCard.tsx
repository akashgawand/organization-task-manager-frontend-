import Link from "next/link";
import { ExtendedProject } from "../types";
import HealthIndicator from "./HealthIndicator";
import Avatar from "@/components/shared/Avatar";
import { Calendar, Users, MoreVertical } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProjectCardProps {
  project: ExtendedProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const members = project.members.slice(0, 4);

  const statusColors: Record<string, string> = {
    planning: "bg-[rgb(var(--color-info-light))] text-[rgb(var(--color-info))]",
    active:
      "bg-[rgb(var(--color-success-light))] text-[rgb(var(--color-success))]",
    on_hold:
      "bg-[rgb(var(--color-warning-light))] text-[rgb(var(--color-warning))]",
    completed:
      "bg-[rgb(var(--color-info-light))] text-[rgb(var(--color-info))]",
    archived:
      "bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-tertiary))]",
    cancelled:
      "bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-tertiary))]",
  };

  const statusLabels: Record<string, string> = {
    planning: "Planning",
    active: "Active",
    on_hold: "On Hold",
    completed: "Completed",
    archived: "Archived",
    cancelled: "Cancelled",
  };

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="block card hover:shadow-lg hover:border-[rgb(var(--color-accent))] transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg group-hover:text-[rgb(var(--color-accent))] transition-colors truncate">
              {project.name}
            </h3>
            <HealthIndicator health={project.health} size="md" />
          </div>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] line-clamp-2">
            {project.description}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
          }}
          className="p-2 hover:bg-[rgb(var(--color-surface-hover))] rounded-lg transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
        </button>
      </div>

      {/* Status & Tags */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status] ?? statusColors.planning}`}
        >
          {statusLabels[project.status] ?? project.status}
        </span>
        {project.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 rounded-full text-xs bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]"
          >
            {tag}
          </span>
        ))}
        {project.tags.length > 2 && (
          <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
            +{project.tags.length - 2} more
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[rgb(var(--color-text-secondary))]">
            Progress
          </span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <div className="h-2 bg-[rgb(var(--color-border))] rounded-full overflow-hidden">
          <div
            className="h-full bg-[rgb(var(--color-accent))] transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {project.endDate && (
            <div className="flex items-center gap-1.5 text-[rgb(var(--color-text-tertiary))]">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(project.endDate)}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[rgb(var(--color-text-tertiary))]">
            <span className="font-medium text-[rgb(var(--color-text-primary))]">
              {project.completedTaskCount}
            </span>
            <span>/</span>
            <span>{project.taskCount}</span>
            <span>tasks</span>
          </div>
        </div>

        {members.length > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-[rgb(var(--color-text-tertiary))] mr-1" />
            <div className="flex -space-x-2">
              {members.map((member, index) => (
                <div
                  key={member.userId}
                  style={{ zIndex: members.length - index }}
                >
                  <Avatar name={member.name} avatar={member.avatar} size="sm" />
                </div>
              ))}
            </div>
            {project.members.length > 4 && (
              <span className="text-xs text-[rgb(var(--color-text-tertiary))] ml-1">
                +{project.members.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
