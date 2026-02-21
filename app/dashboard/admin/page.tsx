"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  mockUsers,
  mockProjects,
  mockTeams,
  mockTasks,
  mockApprovalRequests,
} from "@/lib/mockData";
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
import { Project } from "@/types";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "projects" | "teams" | "approvals"
  >("overview");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock function to handle project creation
  const handleCreateProject = (projectData: Partial<Project>) => {
    console.log("Creating project:", projectData);
    // In a real app, this would call an API
    setIsCreateModalOpen(false);
  };

  const activeProjects = mockProjects.filter(
    (p) => p.status === "active",
  ).length;
  const totalTeams = mockTeams.length;
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter((t) => t.status === "done").length;
  const pendingApprovals = mockApprovalRequests.filter(
    (a) => a.status === "pending",
  ).length;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "projects", label: "Projects" },
    { id: "teams", label: "Teams" },
    { id: "approvals", label: `Approvals (${pendingApprovals})` },
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
            trend={{ value: 15, isPositive: true }}
          />
          <AnalyticsCard
            title="Pending Approvals"
            value={pendingApprovals}
            icon={<ClockIcon />}
            color="rgb(var(--color-warning))"
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
                {mockProjects.slice(0, 4).map((project) => (
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
                        Progress: {project.progress}%
                      </span>
                      <span className="text-[rgb(var(--color-text-tertiary))]">
                        {formatDate(project.startDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Overview */}
            <div className="card">
              <h3 className="font-semibold mb-4">Teams</h3>
              <div className="space-y-4">
                {mockTeams.map((team) => {
                  const lead = mockUsers.find((u) => u.id === team.leadId)!;
                  const members = team.memberIds
                    .map((id) => mockUsers.find((u) => u.id === id))
                    .filter(Boolean);

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
                          {members.slice(0, 4).map((member) => (
                            <Avatar
                              key={member!.id}
                              name={member!.name}
                              size="sm"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedTab === "projects" && (
          <div className="card">
            <h3 className="font-semibold mb-4">All Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockProjects.map((project) => (
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
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-[rgb(var(--color-border))] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[rgb(var(--color-accent))]"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === "teams" && (
          <div className="card">
            <h3 className="font-semibold mb-4">Team Management</h3>
            <div className="space-y-4">
              {mockTeams.map((team) => {
                const lead = mockUsers.find((u) => u.id === team.leadId)!;
                const members = team.memberIds
                  .map((id) => mockUsers.find((u) => u.id === id))
                  .filter(Boolean);

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
                          {members.map((member) => (
                            <Avatar
                              key={member!.id}
                              name={member!.name}
                              size="sm"
                            />
                          ))}
                        </div>
                        <span>{members.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTab === "approvals" && (
          <div className="card">
            <h3 className="font-semibold mb-4">Approval Requests</h3>
            <div className="space-y-3">
              {mockApprovalRequests.map((approval) => {
                const requester = mockUsers.find(
                  (u) => u.id === approval.requesterId,
                )!;
                const task = approval.taskId
                  ? mockTasks.find((t) => t.id === approval.taskId)
                  : null;

                return (
                  <div
                    key={approval.id}
                    className="p-4 rounded-lg border border-[rgb(var(--color-border))]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar name={requester.name} size="sm" />
                        <div>
                          <p className="font-medium">{requester.name}</p>
                          <p className="text-sm text-[rgb(var(--color-text-secondary))] capitalize">
                            {approval.type.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      {approval.status === "pending" ? (
                        <div className="flex gap-2">
                          <button className="btn btn-sm bg-[rgb(var(--color-success-light))] text-[rgb(var(--color-success))] hover:bg-[rgb(var(--color-success))] hover:text-white">
                            Approve
                          </button>
                          <button className="btn btn-sm bg-[rgb(var(--color-danger-light))] text-[rgb(var(--color-danger))] hover:bg-[rgb(var(--color-danger))] hover:text-white">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`badge ${approval.status === "approved" ? "badge-success" : "badge-danger"}`}
                        >
                          {approval.status}
                        </span>
                      )}
                    </div>
                    {task && (
                      <p className="text-sm font-medium mb-1">
                        Task: {task.title}
                      </p>
                    )}
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                      {approval.reason}
                    </p>
                    <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-2">
                      {formatDate(approval.createdAt)}
                    </p>
                  </div>
                );
              })}
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
