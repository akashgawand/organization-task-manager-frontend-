import Link from "next/link";
import { Logo } from "@/components/icons";

export default function Home() {
  const roles = [
    {
      id: "super_admin",
      title: "Super Admin / CEO",
      description: "Global oversight, analytics, and governance",
      href: "/login",
      color: "from-purple-500 to-indigo-600",
    },
    {
      id: "admin",
      title: "Admin / Manager",
      description: "Project and team orchestration",
      href: "/login",
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: "team_lead",
      title: "Team Lead",
      description: "Execution bridge between manager and employees",
      href: "/login",
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "senior_developer",
      title: "Senior Developer",
      description: "Technical leadership and code quality",
      href: "/login",
      color: "from-teal-500 to-cyan-600",
    },

    {
      id: "employee",
      title: "Employee",
      description: "Personal productivity and task management",
      href: "/login",
      color: "from-orange-500 to-amber-600",
    },
  ];

  return (
    <div className="min-h-screen flex-center flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="text-center mb-12 animate-fade-in">
        <div className="flex-center mb-6">
          <Logo size={64} />
        </div>
        <h1 className="text-4xl font-bold mb-3">Team Task Management</h1>
        <p className="text-lg text-[rgb(var(--color-text-secondary))] max-w-2xl">
          A modern, minimal, highly-functional task management platform for
          enterprise teams
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="btn btn-primary px-8 py-3 text-lg rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            Log In to Workspace
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {roles.map((role, index) => (
          <Link
            key={role.id}
            href={role.href}
            className="card hover:shadow-xl transition-all group animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.color} mb-4 flex-center text-white`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-[rgb(var(--color-accent))] transition-colors">
              {role.title}
            </h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {role.description}
            </p>
            <div className="mt-4 flex items-center text-sm text-[rgb(var(--color-accent))] font-medium">
              Sign In →
            </div>
          </Link>
        ))}
      </div>

      <div
        className="mt-12 text-center text-sm text-[rgb(var(--color-text-tertiary))] animate-fade-in"
        style={{ animationDelay: "400ms" }}
      >
        <p>Select a role to explore the dashboard</p>
        <p className="mt-2">Built with Next.js, TypeScript, and Tailwind CSS</p>
      </div>
    </div>
  );
}
