"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/permissions";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only process redirect if we have definitively loaded the user state
    if (user !== undefined) {
      if (!user || user.id === "guest") {
        router.push("/login");
        return;
      }

      // Redirect logic based on role
      switch (user.role) {
        case "super_admin":
          router.push("/dashboard/super-admin");
          break;
        case "admin":
          router.push("/dashboard/admin");
          break;
        case "team_lead":
          router.push("/dashboard/team-lead");
          break;
        case "senior_developer":
          router.push("/dashboard/senior-developer");
          break;
        case "employee":
        default:
          // Employees or any generic fallback goes here
          router.push("/dashboard/employee");
          break;
      }
    }
  }, [user, router]);

  // Render a minimal loader while redirection happens
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--color-accent))]"></div>
      <p className="ml-3 text-[rgb(var(--color-text-secondary))]">
        Loading your dashboard...
      </p>
    </div>
  );
}
