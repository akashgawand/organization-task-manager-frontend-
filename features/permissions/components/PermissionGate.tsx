"use client";

import { ReactNode } from "react";
import { Permission } from "../types";
import { usePermission } from "../hooks/usePermission";

interface PermissionGateProps {
  children: ReactNode;
  requires: keyof Permission;
  fallback?: ReactNode;
}

/**
 * Conditionally render children based on user permissions
 *
 * @example
 * <PermissionGate requires="canViewAnalytics">
 *   <AnalyticsDashboard />
 * </PermissionGate>
 */
export default function PermissionGate({
  children,
  requires,
  fallback = null,
}: PermissionGateProps) {
  const hasPermission = usePermission(requires);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
