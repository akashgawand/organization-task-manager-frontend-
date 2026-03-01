"use client";

import { useAuth } from "@/features/permissions";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // If auth is still loading, wait before judging
    if (isLoading) return;

    if (!user) {
      // User is not logged in, boot them to login
      router.replace("/login");
      return;
    }

    if (user.id === "guest") {
      // Allow guests to see things if "guest" is somehow in the allowed array
      // But typically this means they're playing around with the UI without login
      // Let's assume we allow them if we deliberately permit it, but usually we don't.
      if (!allowedRoles.includes("guest" as any)) {
        router.replace("/login");
        return;
      }
    }

    // Convert role formats if needed (e.g., "TEAM_LEAD" vs "team_lead")
    const userRole = user.role.toLowerCase() as UserRole;

    // Strict check: Is the user's role explicitly in the allowed array?
    if (allowedRoles.includes(userRole)) {
      setIsAuthorized(true);
    } else {
      // Unauthorized. Boot them to their proper dashboard.
      let redirectPath = "/dashboard";
      switch (userRole) {
        case "super_admin":
          redirectPath = "/dashboard/super-admin";
          break;
        case "admin":
          redirectPath = "/dashboard/admin";
          break;
        case "team_lead":
          redirectPath = "/dashboard/team-lead";
          break;
        case "senior_developer":
          redirectPath = "/dashboard/senior-developer";
          break;
        case "employee":
          redirectPath = "/dashboard/employee";
          break;
        default:
          redirectPath = "/login";
      }

      // To avoid infinite loops where the redirect path itself is restricted
      // we just send them to their home if they are poking where they shouldn't.
      if (pathname !== redirectPath) {
        router.replace(redirectPath);
      } else {
        // Fallback safety
        router.replace("/login");
      }
    }
  }, [user, isLoading, allowedRoles, router, pathname]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))]">
        <Loader2 className="w-10 h-10 animate-spin text-[rgb(var(--color-primary))]" />
      </div>
    );
  }

  return <>{children}</>;
}
