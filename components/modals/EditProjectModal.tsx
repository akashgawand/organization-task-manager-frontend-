"use client";

import { useState } from "react";
import { X, Plus, Trash2, Calendar, GripVertical } from "lucide-react";
import {
  Project,
  ProjectPhase,
  TaskPriority,
  ProjectStatus,
  Team,
} from "@/types";
// import { mockTeams, mockUsers } from "@/lib/mockData"; // Removing mockTeams
import { teamService } from "@/app/services/teamServices";
import Avatar from "@/components/shared/Avatar";
import { useEffect } from "react";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: any) => void;
  initialProject?: any;
}

export default function EditProjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialProject,
}: EditProjectModalProps) {
  console.log("EditProjectModal render. isOpen:", isOpen);
  const [step, setStep] = useState<"details" | "phases">("details");
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchTeams = async () => {
        try {
          const data = await teamService.getTeams();
          // Check if data is paginated or array
          if (Array.isArray(data)) {
            setTeams(data as Team[]);
          } else if (data.data && Array.isArray(data.data)) {
            setTeams(data.data as Team[]);
          }
        } catch (error) {
          console.error("Failed to fetch teams", error);
        }
      };
      fetchTeams();
    }
  }, [isOpen]);

  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    description: "",
    status: "planning" as ProjectStatus,
    priority: "medium" as TaskPriority,
    tags: [],
    phases: [],
  });

  useEffect(() => {
    if (initialProject) {
      setFormData({
        name: initialProject.name || "",
        description: initialProject.description || "",
        status: (initialProject.status as ProjectStatus) || "planning",
        priority: (initialProject.priority as TaskPriority) || "medium",
        tags: initialProject.tags || [],
        phases: initialProject.phases || [],
        startDate: initialProject.startDate,
        endDate: initialProject.endDate,
        teamId: initialProject.teamId || "",
      } as any);
    }
  }, [initialProject]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build backend-compatible payload
    const payload: Record<string, any> = {
      name: formData.name,
      description: formData.description || "",
      ...(formData.priority && { priority: formData.priority.toUpperCase() }),
      ...(formData.status && { status: formData.status.toUpperCase() }),
      ...((formData as any).teamId && { team_id: (formData as any).teamId }),
      ...(formData.startDate && {
        start_date: new Date(formData.startDate).toISOString(),
      }),
      ...(formData.endDate && {
        end_date: new Date(formData.endDate).toISOString(),
      }),
    };

    // Include custom phases if the user defined any
    if (formData.phases && formData.phases.length > 0) {
      payload.phases = formData.phases.map((p, idx) => ({
        name: p.name || `Phase ${idx + 1}`,
        description: p.description || "",
        status: p.status || "planning",
        display_order: idx + 1,
        ...(p.startDate && {
          start_date: new Date(p.startDate).toISOString(),
        }),
        ...(p.endDate && { end_date: new Date(p.endDate).toISOString() }),
      }));
    }

    onSubmit(payload);
    onClose();
  };

  const handlePhaseChange = (
    index: number,
    field: keyof ProjectPhase,
    value: any,
  ) => {
    const newPhases = [...(formData.phases || [])];
    newPhases[index] = { ...newPhases[index], [field]: value };
    setFormData({ ...formData, phases: newPhases });
  };

  const addPhase = () => {
    const newPhase: ProjectPhase = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      startDate: new Date(),
      endDate: new Date(),
      status: "planning",
    };
    setFormData({
      ...formData,
      phases: [...(formData.phases || []), newPhase],
    });
  };

  const removePhase = (index: number) => {
    const newPhases = [...(formData.phases || [])];
    newPhases.splice(index, 1);
    setFormData({ ...formData, phases: newPhases });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[rgb(var(--color-surface))] rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--color-border))]">
          <h2 className="text-xl font-semibold">Edit Project</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === "details" ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] focus:border-[rgb(var(--color-accent))]"
                  placeholder="e.g. Website Redesign"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] focus:border-[rgb(var(--color-accent))] min-h-[100px]"
                  placeholder="Describe the project goals and scope..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Team</label>
                  <select
                    className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] focus:border-[rgb(var(--color-accent))]"
                    onChange={(e) =>
                      setFormData({ ...formData, teamId: e.target.value })
                    }
                  >
                    <option value="">Select Team</option>
                    {teams.map((team, index) => (
                      <option key={team.id ?? index} value={team.id ?? ""}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] focus:border-[rgb(var(--color-accent))]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] focus:border-[rgb(var(--color-accent))]"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startDate: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Target End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] focus:border-[rgb(var(--color-accent))]"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endDate: new Date(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Project Phases</h3>
                  <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                    Define the key stages of your project timeline
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPhase}
                  className="btn btn-secondary text-sm py-1.5"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Phase
                </button>
              </div>

              <div className="space-y-4">
                {formData.phases?.map((phase, index) => (
                  <div
                    key={phase.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-[rgb(var(--color-surface-hover))] border border-[rgb(var(--color-border))]"
                  >
                    <GripVertical className="w-5 h-5 text-[rgb(var(--color-text-tertiary))] mt-2 cursor-move" />
                    <div className="flex-1 space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-[rgb(var(--color-text-tertiary))] mb-1 block">
                            Phase Name
                          </label>
                          <input
                            type="text"
                            value={phase.name}
                            onChange={(e) =>
                              handlePhaseChange(index, "name", e.target.value)
                            }
                            className="w-full px-3 py-1.5 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-sm"
                            placeholder="Phase Name"
                          />
                        </div>
                        <div className="w-32">
                          <label className="text-xs font-medium text-[rgb(var(--color-text-tertiary))] mb-1 block">
                            Status
                          </label>
                          <select
                            value={phase.status}
                            onChange={(e) =>
                              handlePhaseChange(index, "status", e.target.value)
                            }
                            className="w-full px-3 py-1.5 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-sm"
                          >
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-[rgb(var(--color-text-tertiary))] mb-1 block">
                            Start Date
                          </label>
                          <input
                            type="date"
                            onChange={(e) =>
                              handlePhaseChange(
                                index,
                                "startDate",
                                new Date(e.target.value),
                              )
                            }
                            className="w-full px-3 py-1.5 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-[rgb(var(--color-text-tertiary))] mb-1 block">
                            End Date
                          </label>
                          <input
                            type="date"
                            onChange={(e) =>
                              handlePhaseChange(
                                index,
                                "endDate",
                                new Date(e.target.value),
                              )
                            }
                            className="w-full px-3 py-1.5 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removePhase(index)}
                      className="p-2 hover:text-red-500 transition-colors mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[rgb(var(--color-border))] flex justify-between bg-[rgb(var(--color-surface))]">
          {step === "phases" ? (
            <button
              type="button"
              onClick={() => setStep("details")}
              className="btn btn-ghost"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            {step === "details" ? (
              <button
                type="button"
                onClick={() => setStep("phases")}
                className="btn btn-primary"
              >
                Next: Phases
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
