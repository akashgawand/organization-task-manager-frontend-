"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KanbanBoard from "@/components/views/KanbanBoard";
import { useAuth } from "@/features/permissions";
import { Task, TaskStatus, Project } from "@/types";
import { GridIcon, ListIcon, PlusIcon } from "@/components/icons";
import AnalyticsCard from "@/components/analytics/AnalyticsCard";
import { TaskIcon, CheckIcon } from "@/components/icons";
import Avatar from "@/components/shared/Avatar";
import { dashboardService } from "@/app/services/dashboardServices";
import { projectService } from "@/app/services/projectServices";
import { taskService } from "@/app/services/taskServices";

export default function SeniorDeveloperDashboard() {
  const { user } = useAuth();
  const [teamProjects, setTeamProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(
    undefined,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [productivity, setProductivity] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch projects
        const projectsData = await projectService.getProjects();
        // Assuming API returns array directly or inside data
        const projects = Array.isArray(projectsData)
          ? projectsData
          : (projectsData as any).projects || [];
        setTeamProjects(projects);
        if (projects.length > 0) setSelectedProject(projects[0].id);

        // Fetch productivity stats
        const stats = await dashboardService.getEmployeeProductivity(
          user.id !== "guest" ? user.id : undefined,
        );
        setProductivity(stats);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    }
    if (user && user.id !== "guest") fetchData();
  }, [user]);

  useEffect(() => {
    async function fetchTasks() {
      if (!selectedProject) return;
      try {
        const tasksResp = await taskService.getTasks({
          project_id: selectedProject,
        });
        setProjectTasks(tasksResp.data || tasksResp.tasks || []);
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      }
    }
    fetchTasks();
  }, [selectedProject]);

  // Use real stats or fallback to calculated from tasks for immediate feedback if stats api fails
  const totalTasks =
    productivity?.tasksCompleted +
      productivity?.tasksInProgress +
      productivity?.tasksOverdue || projectTasks.length;
  const completedTasks =
    productivity?.tasksCompleted ||
    projectTasks.filter((t) => t.status === "done").length;
  const inProgressTasks =
    productivity?.tasksInProgress ||
    projectTasks.filter((t) => t.status === "in_progress").length;
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
            <h1 className="text-3xl font-bold mb-2">
              Senior Developer Dashboard
            </h1>
            <p className="text-[rgb(var(--color-text-secondary))]">
              Manage technical tasks and team projects
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
          />
        </div>

        {/* Team Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="font-semibold mb-4">Active Projects</h3>
              <div className="space-y-3">
                {teamProjects.map((project) => (
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
                ))}
              </div>
            </div>
          </div>

          {/* Team Status - Placeholder until Team Analytics API is ready */}
          {/* 
          <div className="card">
            <h3 className="font-semibold mb-4">Team Status</h3>
            <div className="space-y-4">
              {mockTeamAnalytics.memberWorkload.map((member) => { 
                ... 
              })}
            </div>
          </div> 
          */}
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
