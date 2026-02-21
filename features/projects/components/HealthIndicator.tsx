import { ProjectHealth } from "../types";

interface HealthIndicatorProps {
  health: ProjectHealth;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function HealthIndicator({
  health,
  size = "md",
  showLabel = false,
}: HealthIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const colorClasses = {
    green: "bg-[rgb(var(--color-success))]",
    yellow: "bg-[rgb(var(--color-warning))]",
    red: "bg-[rgb(var(--color-danger))]",
  };

  const labels = {
    green: "On Track",
    yellow: "At Risk",
    red: "Critical",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} ${colorClasses[health]} rounded-full`}
        title={labels[health]}
      />
      {showLabel && (
        <span className="text-sm text-[rgb(var(--color-text-secondary))]">
          {labels[health]}
        </span>
      )}
    </div>
  );
}
