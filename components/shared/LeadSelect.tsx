"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
    super_admin: "bg-red-500/10 text-red-500",
    admin: "bg-violet-500/10 text-violet-500",
    team_lead: "bg-amber-500/10 text-amber-500",
    senior_developer: "bg-cyan-500/10 text-cyan-500",
    employee: "bg-emerald-500/10 text-emerald-500",
};

interface LeadSelectProps {
    value: string;
    onChange: (id: string) => void;
    users: any[];
}

export default function LeadSelect({ value, onChange, users }: LeadSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    const selected = users.find((u) => String(u.id) === String(value));
    const filtered = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => { setIsOpen(!isOpen); setSearch(""); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-[rgb(var(--color-background))] border rounded-xl text-sm transition-all duration-200 cursor-pointer ${isOpen
                    ? "border-[rgb(var(--color-accent))] ring-2 ring-[rgb(var(--color-accent))]/30"
                    : "border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-border-hover))]"
                    }`}
            >
                {selected ? (
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] flex items-center justify-center text-xs font-bold">
                            {selected.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[rgb(var(--color-text-primary))] font-medium">{selected.name}</span>
                    </div>
                ) : (
                    <span className="text-[rgb(var(--color-text-tertiary))]">Select a team lead</span>
                )}
                <ChevronDown className={`w-4 h-4 text-[rgb(var(--color-text-tertiary))] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 right-0 bottom-13 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-xl shadow-xl shadow-black/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Search */}
                    <div className="p-2 border-b border-[rgb(var(--color-border))]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgb(var(--color-text-tertiary))]" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-lg text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-accent))]/30"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="max-h-48 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <p className="text-xs text-center text-[rgb(var(--color-text-tertiary))] py-4">No users found</p>
                        ) : (
                            filtered.map((u: any) => {
                                const isSelected = String(u.id) === String(value);
                                const rc = ROLE_COLORS[u.role] || ROLE_COLORS.employee;
                                return (
                                    <button
                                        key={u.id}
                                        type="button"
                                        onClick={() => { onChange(String(u.id)); setIsOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 cursor-pointer ${isSelected ? "bg-[rgba(var(--color-accent),0.08)]" : "hover:bg-[rgb(var(--color-surface-hover))]"
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] flex items-center justify-center text-xs font-bold shrink-0">
                                            {u.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isSelected ? "text-[rgb(var(--color-accent))]" : "text-[rgb(var(--color-text-primary))]"}`}>
                                                {u.name}
                                            </p>
                                            <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] truncate">{u.email}</p>
                                        </div>
                                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded capitalize ${rc}`}>
                                            {(u.role || "").replace(/_/g, " ")}
                                        </span>
                                        {isSelected && <Check className="w-4 h-4 text-[rgb(var(--color-accent))] shrink-0" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
