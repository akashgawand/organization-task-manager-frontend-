"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Shield, Crown, Users, Code, UserCheck } from "lucide-react";
import { UserRole } from "@/types";

const ROLE_OPTIONS: { value: UserRole; label: string; icon: React.ElementType; color: string }[] = [
    { value: "super_admin", label: "Super Admin", icon: Crown, color: "text-red-500 bg-red-500/10 border-red-500/20" },
    { value: "admin", label: "Admin", icon: Shield, color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
    { value: "team_lead", label: "Team Lead", icon: Users, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { value: "senior_developer", label: "Senior Developer", icon: Code, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
    { value: "employee", label: "Employee", icon: UserCheck, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
];

interface RoleSelectProps {
    value: UserRole;
    onChange: (role: UserRole) => void;
}

export default function RoleSelect({ value, onChange }: RoleSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen]);

    const selected = ROLE_OPTIONS.find((r) => r.value === value) || ROLE_OPTIONS[4];
    const SelectedIcon = selected.icon;

    return (
        <div className="relative" ref={ref}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-[rgb(var(--color-background))] border rounded-xl text-sm transition-all duration-200 cursor-pointer ${isOpen
                        ? "border-[rgb(var(--color-accent))] ring-2 ring-[rgb(var(--color-accent))]/30"
                        : "border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-border-hover))]"
                    }`}
            >
                <div className="flex items-center gap-2.5">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-lg border ${selected.color}`}>
                        <SelectedIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[rgb(var(--color-text-primary))] font-medium">{selected.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[rgb(var(--color-text-tertiary))] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 right-0 bottom-13 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl shadow-xl shadow-black/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {ROLE_OPTIONS.map((role) => {
                        const Icon = role.icon;
                        const isSelected = value === role.value;
                        return (
                            <button
                                key={role.value}
                                type="button"
                                onClick={() => {
                                    onChange(role.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 cursor-pointer ${isSelected
                                        ? "bg-[rgb(var(--color-accent-light))]"
                                        : "hover:bg-[rgb(var(--color-surface-hover))]"
                                    }`}
                            >
                                <span className={`flex items-center justify-center w-7 h-7 rounded-lg border ${role.color}`}>
                                    <Icon className="w-4 h-4" />
                                </span>
                                <span className={`text-sm font-medium flex-1 ${isSelected ? "text-[rgb(var(--color-accent))]" : "text-[rgb(var(--color-text-primary))]"}`}>
                                    {role.label}
                                </span>
                                {isSelected && (
                                    <Check className="w-4 h-4 text-[rgb(var(--color-accent))]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
