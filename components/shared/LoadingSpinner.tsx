"use client";

import Image from "next/image";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[75vh]">
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Outer Orbit */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[rgb(var(--color-border))] opacity-50 animate-[spin_4s_linear_infinite]"></div>

        {/* Inner Fast Orbit */}
        <div className="absolute inset-2 rounded-full border-2 border-t-[rgb(var(--color-accent))] border-r-[rgb(var(--color-accent-hover))] border-b-transparent border-l-transparent opacity-80 animate-[spin_1.5s_cubic-bezier(0.5,0,0.5,1)_infinite]"></div>

        {/* Glowing Core Background */}
        <div className="absolute inset-4 bg-[rgb(var(--color-accent))]/10 rounded-full blur-xl animate-pulse"></div>

        {/* Center Bouncing Logo */}
        <div className="relative z-10 w-3/5 h-3/5 animate-[pulse_2s_ease-in-out_infinite] drop-shadow-md">
          <Image
            src="/logo.png"
            alt="Loading..."
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card animate-fade-in">
      <div className="skeleton h-5 w-3/4 mb-3" />
      <div className="skeleton h-4 w-full mb-2" />
      <div className="skeleton h-4 w-5/6 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between items-center">
        <div className="skeleton h-8 w-8 rounded-full" />
        <div className="skeleton h-4 w-20" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-[rgb(var(--color-surface))]"
        >
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="flex-1">
            <div className="skeleton h-4 w-1/3 mb-2" />
            <div className="skeleton h-3 w-1/2" />
          </div>
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
