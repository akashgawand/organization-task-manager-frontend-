"use client";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;

  color?: string;
}

export default function AnalyticsCard({
  title,
  value,
  icon,
  color,
}: AnalyticsCardProps) {
  return (
    <div
      className="relative overflow-hidden bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:border-[rgb(var(--color-border-hover))] hover:-translate-y-1 group"
     
    >
      <div
        className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 scale-150 transform translate-x-4 -translate-y-4 pointer-events-none"
        style={{ color: color || "currentColor" }}
      >
        {icon}
      </div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
            {title}
          </p>
          <div className="text-3xl font-bold text-[rgb(var(--color-text-primary))] tracking-tight">
            {value}
          </div>
        </div>
        <div
          className="p-3 rounded-xl bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] shadow-sm group-hover:scale-110 transition-transform duration-300"
          style={{ color: color || "rgb(var(--color-text-primary))" }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
