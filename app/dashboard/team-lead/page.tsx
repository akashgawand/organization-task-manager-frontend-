"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KanbanBoard from "@/components/views/KanbanBoard";
import { useAuth } from "@/features/permissions";
import { Task, TaskStatus, Project, User } from "@/types";
import { GridIcon, ListIcon, PlusIcon, TeamIcon } from "@/components/icons";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import { TaskIcon, CheckIcon, ProjectIcon } from "@/components/icons";
import Avatar from "@/components/shared/Avatar";
import { projectService } from "@/app/services/projectServices";
import { taskService } from "@/app/services/taskServices";
import { userService } from "@/app/services/userServices";

export default function TeamLeadDashboard() {
  const { user } = useAuth();
  // New State variables
  const [teamProjects, setTeamProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(
    undefined,
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Fetch Effect
  useEffect(() => {
    async function fetchData() {
      try {
        if (!user || user.id === "guest") return;

        const projectsResponse = await projectService.getProjects();
        const projectsData = Array.isArray(projectsResponse)
          ? projectsResponse
          : (projectsResponse as any)?.projects || [];
        setTeamProjects(projectsData);

        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0].id);
        }

        const usersResponse = await userService.getUsers();
        setUsers(usersResponse.data || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Task Fetch Effect
  useEffect(() => {
    async function fetchTasks() {
      if (teamProjects.length === 0 && !selectedProject) return;
      try {
        let tasksResp: any;
        if (selectedProject) {
          tasksResp = await taskService.getTasks({
            project_id: selectedProject,
          });
        } else {
          tasksResp = await taskService.getTasks();
        }
        setProjectTasks(tasksResp.data || tasksResp.tasks || []);
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      }
    }
    fetchTasks();
  }, [selectedProject, teamProjects.length]);

  // Calculate metrics
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = projectTasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const reviewTasks = projectTasks.filter((t) => t.status === "review").length;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    console.log("Open task:", task);
  };

  const handleAddTask = (status: TaskStatus) => {
    console.log("Add task with status:", status);
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Lead Dashboard</h1>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Manage team tasks and track project progress
            </p>
          </div>
          <button className="btn btn-primary">
            <PlusIcon />
            Create Task
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Total Tasks"
            value={totalTasks}
            icon={<TaskIcon />}
            trend={{ value: 12, isPositive: true }}
          />
          <AnalyticsCard
            title="In Progress"
            value={inProgressTasks}
            icon={<GridIcon />}
            color="rgb(var(--color-info))"
          />
          <AnalyticsCard
            title="In Review"
            value={reviewTasks}
            icon={<ListIcon />}
            color="rgb(var(--color-warning))"
          />
          <AnalyticsCard
            title="Completed"
            value={completedTasks}
            icon={<CheckIcon />}
            color="rgb(var(--color-success))"
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Team Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="font-semibold mb-4">Projects</h3>
              <div className="space-y-3">
                {isLoading ? (
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    Loading projects...
                  </p>
                ) : teamProjects.length === 0 ? (
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                    No active projects.
                  </p>
                ) : (
                  teamProjects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-smooth ${
                        selectedProject === project.id
                          ? "border-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent-light))]"
                          : "border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-text-tertiary))]"
                      }`}
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{project.name}</h4>
                        <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                          {project.progress || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-[rgb(var(--color-border))] rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-[rgb(var(--color-accent))] transition-all"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))] line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Team Workload</h3>
            <div className="space-y-4">
              {(() => {
                // Derive workload from tasks
                const userTasksCount = projectTasks.reduce(
                  (acc, t) => {
                    if (
                      t.status !== "done" &&
                      t.assigneeIds &&
                      t.assigneeIds.length > 0
                    ) {
                      t.assigneeIds.forEach((userId) => {
                        acc[userId] = (acc[userId] || 0) + 1;
                      });
                    }
                    return acc;
                  },
                  {} as Record<string, number>,
                );

                const memberWorkload = Object.entries(userTasksCount)
                  .map(([userId, activeTasks]) => ({ userId, activeTasks }))
                  .sort((a, b) => b.activeTasks - a.activeTasks)
                  .slice(0, 5); // top 5 busy

                if (memberWorkload.length === 0) {
                  return (
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                      No active tasks assigned.
                    </p>
                  );
                }

                return memberWorkload.map((member) => {
                  const u = users.find((u) => u.id === member.userId);
                  return (
                    <div key={member.userId}>
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar
                          name={u?.name || "Unknown"}
                          avatar={u?.avatar}
                          size="sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {u?.name || "Unknown Member"}
                          </p>
                          <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                            {member.activeTasks} active
                          </p>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[rgb(var(--color-border))] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[rgb(var(--color-info))]"
                          style={{
                            width: `${Math.min((member.activeTasks / 5) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Tasks Board */}
        <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {selectedProject
                ? teamProjects.find((p) => p.id === selectedProject)?.name
                : "All Tasks"}
            </h3>
            <button
              onClick={() => setSelectedProject(undefined)}
              className="btn btn-secondary btn-sm"
            >
              View All Tasks
            </button>
          </div>

          <KanbanBoard
            tasks={projectTasks}
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
