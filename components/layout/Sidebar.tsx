"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types";
import {
  FolderKanban,
  CheckSquare,
  Users,
  Calendar,
  BarChart3,
  Settings,
  ChevronRight,
  LayoutDashboard,
  ClipboardCheck,
} from "lucide-react";

interface SidebarProps {
  userRole: UserRole;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      "super_admin",
      "admin",
      "team_lead",
      "senior_developer",
      "employee",
    ],
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
    roles: ["super_admin", "admin", "team_lead", "senior_developer"],
  },
  {
    label: "My Tasks",
    href: "/dashboard/my-tasks",
    icon: CheckSquare,
    roles: [
      "super_admin",
      "admin",
      "team_lead",
      "senior_developer",
      "employee",
    ],
  },
  {
    label: "Teams",
    href: "/dashboard/teams",
    icon: Users,
    roles: ["super_admin", "admin", "team_lead", "senior_developer"],
  },
  {
    label: "Reviews",
    href: "/dashboard/reviews",
    icon: ClipboardCheck,
    roles: ["super_admin", "admin", "team_lead", "senior_developer"],
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
    roles: [
      "super_admin",
      "admin",
      "team_lead",
      "senior_developer",
      "employee",
    ],
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["super_admin", "admin"],
  },
];

export default function Sidebar({ userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <aside
      className="fixed left-0 top-0 h-screen bg-[rgb(var(--color-surface))] border-r border-[rgb(var(--color-border))] transition-all duration-300 z-40"
      style={{
        width: isCollapsed
          ? "var(--sidebar-collapsed-width)"
          : "var(--sidebar-width)",
      }}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between h-[var(--header-height)] px-6 border-b border-[rgb(var(--color-border))]">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="ApexPlanner" width={32} height={32} className="w-8 h-8" />
            <span className="font-semibold text-lg text-[rgb(var(--color-text-primary))]">ApexPlanner</span>
          </div>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center w-full">
            <Image src="/logo.png" alt="ApexPlanner" width={32} height={32} className="w-8 h-8" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="btn btn-ghost p-2 -mr-2"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight
            className="w-5 h-5"
            style={{
              transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.2s",
            }}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col p-4 gap-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth
                ${isActive
                  ? "bg-[rgb(var(--color-accent-light))] text-[rgb(var(--color-accent))]"
                  : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text-primary))]"
                }
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Role Badge */}
      {/* Role Switcher */}
      {/* {!isCollapsed && (
        <div className="mt-auto pb-4">
          <RoleSwitcher />
        </div>
      )} */}
    </aside>
  );
}
