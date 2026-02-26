"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { User, Project, Team, Task } from "@/types";
import { userService } from "@/app/services/userServices";
import { projectService } from "@/app/services/projectServices";
import { teamService } from "@/app/services/teamServices";
import { taskService } from "@/app/services/taskServices";
import { useAuth } from "@/features/permissions";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import {
  ProjectIcon,
  TeamIcon,
  TaskIcon,
  CheckIcon,
  ClockIcon,
  PlusIcon,
} from "@/components/icons";
import Avatar from "@/components/shared/Avatar";
import { PriorityBadge, StatusBadge } from "@/components/shared/Badge";
import { formatDate } from "@/lib/utils";

import CreateProjectModal from "@/components/modals/CreateProjectModal";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "projects" | "teams"
  >("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!user || user.id === "guest") return;

        const [usersRes, projectsRes, teamsRes, tasksRes] = await Promise.all([
          userService.getUsers(),
          projectService.getProjects(),
          teamService.getTeams(),
          taskService.getTasks(),
        ]);

        setUsers(usersRes.data || []);

        const projData = Array.isArray(projectsRes)
          ? projectsRes
          : (projectsRes as any)?.projects || [];
        setProjects(projData);

        setTeams((teamsRes.data as unknown as Team[]) || []);
        setTasks(tasksRes.data || (tasksRes as any).tasks || []);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleCreateProject = (projectData: Partial<Project>) => {
    console.log("Creating project:", projectData);
    setIsCreateModalOpen(false);
  };

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalTeams = teams.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "projects", label: "Projects" },
    { id: "teams", label: "Teams" },
  ] as const;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Manage projects, teams, and organizational oversight
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary">
              <TeamIcon />
              Create Team
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <PlusIcon />
              New Project
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <AnalyticsCard
            title="Active Projects"
            value={activeProjects}
            icon={<ProjectIcon />}
            color="rgb(var(--color-accent))"
          />
          <AnalyticsCard
            title="Teams"
            value={totalTeams}
            icon={<TeamIcon />}
            color="rgb(var(--color-info))"
          />
          <AnalyticsCard
            title="Total Tasks"
            value={totalTasks}
            icon={<TaskIcon />}
          />
          <AnalyticsCard
            title="Completed"
            value={completedTasks}
            icon={<CheckIcon />}
            color="rgb(var(--color-success))"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-[rgb(var(--color-border))]">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? "border-[rgb(var(--color-accent))] text-[rgb(var(--color-accent))]"
                    : "border-transparent text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {selectedTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Projects */}
            <div className="card">
              <h3 className="font-semibold mb-4">Recent Projects</h3>
              <div className="space-y-3">
                {isLoading ? (
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Loading projects...
                  </p>
                ) : projects.length === 0 ? (
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    No projects available.
                  </p>
                ) : (
                  projects.slice(0, 4).map((project) => (
                    <div
                      key={project.id}
                      className="p-3 rounded-lg bg-[rgb(var(--color-surface-hover))]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{project.name}</h4>
                        <PriorityBadge priority={project.priority} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[rgb(var(--color-text-secondary))]">
                          Progress: {project.progress || 0}%
                        </span>
                        <span className="text-[rgb(var(--color-text-tertiary))]">
                          {project.startDate
                            ? formatDate(project.startDate)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Team Overview */}
            <div className="card">
              <h3 className="font-semibold mb-4">Teams</h3>
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Loading teams...
                  </p>
                ) : teams.length === 0 ? (
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    No teams available.
                  </p>
                ) : (
                  teams.map((team) => {
                    const lead = users.find((u) => u.id === team.leadId) ||
                      (team as any).lead || { name: "Unassigned" };
                    const members = (team as any).members || [];

                    return (
                      <div
                        key={team.id}
                        className="p-3 rounded-lg bg-[rgb(var(--color-surface-hover))]"
                      >
                        <h4 className="font-medium mb-2">{team.name}</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                              Lead:
                            </span>
                            <Avatar name={lead.name} size="sm" />
                            <span className="text-sm">{lead.name}</span>
                          </div>
                          <div className="flex -space-x-2">
                            {members.slice(0, 4).map((member: any) => (
                              <Avatar
                                key={
                                  member.id || member.userId || Math.random()
                                }
                                name={
                                  member.name ||
                                  users.find((u) => u.id === member.userId)
                                    ?.name ||
                                  "User"
                                }
                                size="sm"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {selectedTab === "projects" && (
          <div className="card">
            <h3 className="font-semibold mb-4">All Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <p className="text-sm text-[rgb(var(--color-text-secondary))] col-span-full">
                  Loading projects...
                </p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-[rgb(var(--color-text-secondary))] col-span-full">
                  No projects found.
                </p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-accent))] transition-smooth cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold">{project.name}</h4>
                      <PriorityBadge priority={project.priority} />
                    </div>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] line-clamp-2 mb-3">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-[rgb(var(--color-text-tertiary))]">
                        Progress
                      </span>
                      <span className="font-medium">
                        {project.progress || 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-[rgb(var(--color-border))] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[rgb(var(--color-accent))]"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {selectedTab === "teams" && (
          <div className="card">
            <h3 className="font-semibold mb-4">Team Management</h3>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  Loading teams...
                </p>
              ) : teams.length === 0 ? (
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  No teams found.
                </p>
              ) : (
                teams.map((team) => {
                  const lead = users.find((u) => u.id === team.leadId) ||
                    (team as any).lead || { name: "Unassigned" };
                  const members = (team as any).members || [];

                  return (
                    <div
                      key={team.id}
                      className="p-4 rounded-lg border border-[rgb(var(--color-border))]"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold mb-1">{team.name}</h4>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                            {team.description}
                          </p>
                        </div>
                        <button className="btn btn-secondary btn-sm">
                          Manage
                        </button>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-[rgb(var(--color-text-tertiary))]">
                            Lead:
                          </span>
                          <Avatar name={lead.name} size="sm" />
                          <span>{lead.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[rgb(var(--color-text-tertiary))]">
                            Members:
                          </span>
                          <div className="flex -space-x-2">
                            {members.slice(0, 4).map((member: any) => (
                              <Avatar
                                key={
                                  member.id || member.userId || Math.random()
                                }
                                name={
                                  member.name ||
                                  users.find((u) => u.id === member.userId)
                                    ?.name ||
                                  "User"
                                }
                                size="sm"
                              />
                            ))}
                          </div>
                          <span>{members.length}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </DashboardLayout>
  );
}
