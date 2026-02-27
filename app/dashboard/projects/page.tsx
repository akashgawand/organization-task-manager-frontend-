"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth, PermissionGate } from "@/features/permissions";
import ProjectCard from "@/features/projects/components/ProjectCard";
import { projectService } from "@/app/services/projectServices";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Star,
  Archive,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import type { ExtendedProject } from "@/features/projects/types";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import EditProjectModal from "@/components/modals/EditProjectModal";

type ProjectFilter = "all" | "active" | "archived" | "my-projects" | "starred";
type SortOption = "recent" | "deadline" | "priority" | "name";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ExtendedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ExtendedProject | null>(
    null,
  );

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (projectData: any) => {
    try {
      await projectService.createProject(projectData);
      setIsCreateModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  const handleUpdateProject = async (projectId: string, projectData: any) => {
    try {
      await projectService.updateProject(projectId, projectData);
      setIsEditModalOpen(false);
      setProjectToEdit(null);
      fetchProjects();
    } catch (error) {
      console.error("Failed to update project:", error);
      alert("Failed to update project. Please try again.");
    }
  };

  const handleDeleteProject = async (project: ExtendedProject) => {
    if (
      window.confirm(
        `Are you sure you want to delete project "${project.name}"?`,
      )
    ) {
      try {
        await projectService.deleteProject(project.id);
        fetchProjects();
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert("Failed to delete project. Please try again.");
      }
    }
  };

  const handleEditProject = (project: ExtendedProject) => {
    setProjectToEdit(project);
    setIsEditModalOpen(true);
  };

  const handleManageProject = (project: ExtendedProject) => {
    // Navigation to settings tab or manage page
    window.location.href = `/dashboard/projects/${project.id}?tab=settings`;
  };

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    switch (filter) {
      case "active":
        filtered = filtered.filter(
          (p) => p.status === "active" || p.status === "planning",
        );
        break;
      case "archived":
        filtered = filtered.filter(
          (p) => p.status === "archived" || p.status === "cancelled",
        );
        break;
      case "my-projects":
        filtered = filtered.filter((p) =>
          p.members.some((m) => m.userId === String(user?.id)),
        );
        break;
      case "starred":
        filtered = filtered.filter((p) => p.isStarred);
        break;
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "deadline":
          if (!a.endDate) return 1;
          if (!b.endDate) return -1;
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case "priority": {
          const healthOrder: Record<string, number> = {
            red: 0,
            yellow: 1,
            green: 2,
          };
          return (healthOrder[a.health] ?? 2) - (healthOrder[b.health] ?? 2);
        }
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchQuery, filter, sortBy, user]);

  const activeProjects = filteredProjects.filter(
    (p) => p.status === "active" || p.status === "planning",
  );
  const completedProjects = filteredProjects.filter(
    (p) => p.status === "completed",
  );
  const archivedProjects = filteredProjects.filter(
    (p) => p.status === "archived" || p.status === "cancelled",
  );
  const starredProjects = filteredProjects.filter((p) => p.isStarred);

  const filters: {
    id: ProjectFilter;
    label: string;
    icon?: React.ReactNode;
  }[] = [
      {
        id: "all",
        label: "All Projects",
        icon: <FolderOpen className="w-4 h-4" />,
      },
      { id: "active", label: "Active" },
      { id: "my-projects", label: "My Projects" },
      { id: "starred", label: "Starred", icon: <Star className="w-4 h-4" /> },
      {
        id: "archived",
        label: "Archived",
        icon: <Archive className="w-4 h-4" />,
      },
    ];

  const sortOptions: { id: SortOption; label: string }[] = [
    { id: "recent", label: "Recently Updated" },
    { id: "deadline", label: "Deadline" },
    { id: "priority", label: "Priority" },
    { id: "name", label: "Name" },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Title & Info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-accent))]/10 flex items-center justify-center shrink-0">
                <FolderOpen className="w-6 h-6 text-[rgb(var(--color-accent))]" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                    Projects
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] border border-[rgb(var(--color-accent))]/20">
                    {isLoading ? "..." : `${filteredProjects.length} Total`}
                  </span>
                </div>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            {/* Right: Quick Stats + Actions */}
            <div className="flex items-center gap-4 md:gap-6 flex-wrap">
              {/* Quick Stats */}
              <div className="flex items-center gap-4 md:gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-success))]" />
                  <div className="text-sm">
                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">{activeProjects.length}</span>
                    <span className="text-[rgb(var(--color-text-tertiary))] ml-1">Active</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-[rgb(var(--color-border))]" />
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-info))]" />
                  <div className="text-sm">
                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">{completedProjects.length}</span>
                    <span className="text-[rgb(var(--color-text-tertiary))] ml-1">Done</span>
                  </div>
                </div>
                <div className="w-px h-6 bg-[rgb(var(--color-border))]" />
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-warning))]" />
                  <div className="text-sm">
                    <span className="font-semibold text-[rgb(var(--color-text-primary))]">{starredProjects.length}</span>
                    <span className="text-[rgb(var(--color-text-tertiary))] ml-1">Starred</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-[rgb(var(--color-border))] hidden md:block" />

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* <button
                  onClick={fetchProjects}
                  className="p-2 hover:bg-[rgb(var(--color-surface-hover))] rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button> */}
                <PermissionGate requires="canCreateProject">
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="w-5 h-5" />
                    New Project
                  </button>
                </PermissionGate>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-accent))] focus:border-[rgb(var(--color-accent))] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`btn btn-sm ${filter === f.id ? "btn-primary" : "btn-secondary"}`}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] hover:border-[rgb(var(--color-accent))] transition-colors text-sm"
          >
            {sortOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="card animate-pulse h-52 bg-[rgb(var(--color-surface-hover))]"
              />
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            {/* Starred */}
            {filter === "all" && starredProjects.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-[rgb(var(--color-warning))]" />
                  <h2 className="text-xl font-semibold">Starred Projects</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {starredProjects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                      onManage={handleManageProject}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Active */}
            {(filter === "all" || filter === "active") &&
              activeProjects.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    {filter === "all" ? "Active Projects" : "Projects"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeProjects.map((p) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                        onManage={handleManageProject}
                      />
                    ))}
                  </div>
                </div>
              )}

            {/* Completed */}
            {filter === "all" && completedProjects.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Completed Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedProjects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                      onManage={handleManageProject}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Archived */}
            {(filter === "all" || filter === "archived") &&
              archivedProjects.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Archived / Cancelled
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedProjects.map((p) => (
                      <ProjectCard key={p.id} project={p} />
                    ))}
                  </div>
                </div>
              )}

            {/* My Projects / Starred specific */}
            {(filter === "my-projects" || filter === "starred") &&
              filteredProjects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              )}

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-16">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--color-text-tertiary))] opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  No projects found
                </h3>
                <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first project"}
                </p>
                <PermissionGate requires="canCreateProject">
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="w-5 h-5" />
                    Create Project
                  </button>
                </PermissionGate>
              </div>
            )}
          </>
        )}
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProjectToEdit(null);
        }}
        onSubmit={async (projectData) => {
          if (projectToEdit) {
            await handleUpdateProject(projectToEdit.id, projectData);
          }
        }}
        initialProject={projectToEdit}
      />
    </DashboardLayout>
  );
}
