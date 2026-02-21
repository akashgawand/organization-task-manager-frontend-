"use client";

import { getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Avatar({
  name,
  avatar,
  size = "md",
  className = "",
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClasses[size]} flex-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium ${className}`}
      title={name}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
