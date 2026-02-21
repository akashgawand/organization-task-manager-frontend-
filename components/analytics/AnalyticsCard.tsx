"use client";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function AnalyticsCard({
  title,
  value,
  icon,
  trend,
  color,
}: AnalyticsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-12 h-12 flex-center rounded-lg"
          style={{
            backgroundColor: color
              ? `${color}15`
              : "rgb(var(--color-accent-light))",
            color: color || "rgb(var(--color-accent))",
          }}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={`text-sm font-medium ${trend.isPositive ? "text-[rgb(var(--color-success))]" : "text-[rgb(var(--color-danger))]"}`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-[rgb(var(--color-text-secondary))]">{title}</p>
    </div>
  );
}
