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
    <div className="card group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] cursor-default">
      {/* Subtle background glow effect on hover */}
      <div
        className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl pointer-events-none"
        style={{ backgroundColor: color || "rgb(var(--color-accent))" }}
      />

      <div className="flex items-start justify-between mb-6 relative z-10">
        {/* Icon Container */}
        <div
          className="w-12 h-12 flex-center rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-sm border border-[rgb(var(--color-border-light))]"
          style={{
            backgroundColor: color
              ? `${color}15`
              : "rgb(var(--color-accent-light))",
            color: color || "rgb(var(--color-accent))",
          }}
        >
          {icon}
        </div>

        {/* Trend Pill Badge */}
        {trend && (
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors
              ${
                trend.isPositive
                  ? "bg-[rgb(var(--color-success-light))] text-[rgb(var(--color-success))]"
                  : "bg-[rgb(var(--color-danger-light))] text-[rgb(var(--color-danger))]"
              }`}
          >
            <span className="text-[10px]">{trend.isPositive ? "↗" : "↘"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Typography */}
      <div className="relative z-10">
        <h3 className="text-3xl font-extrabold tracking-tight mb-1 text-[rgb(var(--color-text-primary))] transition-colors duration-300">
          {value}
        </h3>
        <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
          {title}
        </p>
      </div>
    </div>
  );
}