import { getPriorityLabel, getStatusLabel } from "@/lib/utils";

interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "default";
  className?: string;
}

export default function Badge({
  label,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variantClasses = {
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    info: "badge-info",
    default:
      "bg-[rgb(var(--color-surface-hover))] text-[rgb(var(--color-text-secondary))]",
  };

  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {label}
    </span>
  );
}

// Priority Badge
export function PriorityBadge({ priority }: { priority: string }) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    critical: "danger",
    high: "warning",
    medium: "info",
    low: "default",
  };

  return (
    <Badge
      label={getPriorityLabel(priority)}
      variant={variantMap[priority] || "default"}
    />
  );
}

// Status Badge
export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    todo: "default",
    in_progress: "info",
    review: "warning",
    done: "success",
    blocked: "danger",
  };

  return (
    <Badge
      label={getStatusLabel(status)}
      variant={variantMap[status] || "default"}
    />
  );
}
