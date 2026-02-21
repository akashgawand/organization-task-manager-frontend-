"use client";

import { useMemo } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Event,
  SlotInfo,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Task } from "@/types";

// ── Localizer ────────────────────────────────────────────────────────────────
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// ── Priority colours (match existing design tokens as fallbacks) ─────────────
const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#22c55e",
};

const STATUS_OPACITY: Record<string, string> = {
  done: "80", // 50% opacity hex suffix
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface TaskEvent extends Event {
  taskId: string;
  priority: string;
  status: string;
  task: Task;
}

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDateClick?: (date: Date, tasks: Task[]) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function CalendarView({
  tasks,
  onTaskClick,
  onDateClick,
}: CalendarViewProps) {
  // Map tasks → react-big-calendar events
  const events: TaskEvent[] = useMemo(
    () =>
      tasks
        .filter((t) => !!t.dueDate)
        .map((t) => {
          const due = new Date(t.dueDate!);
          return {
            taskId: t.id,
            title: t.title,
            // Show task as a single-day event on its due date
            start: due,
            end: due,
            allDay: true,
            priority: t.priority,
            status: t.status,
            task: t,
          };
        }),
    [tasks],
  );

  // Custom event renderer — coloured pill with truncated title
  const EventComponent = ({ event }: { event: object }) => {
    const e = event as TaskEvent;
    const bg = PRIORITY_COLORS[e.priority] ?? "#6366f1";
    const opacity = STATUS_OPACITY[e.status] ?? "cc";
    return (
      <div
        className="truncate text-xs font-medium px-1.5 py-0.5 rounded"
        style={{
          backgroundColor: `${bg}${opacity}`,
          color: e.status === "done" ? "#6b7280" : "#fff",
          textDecoration: e.status === "done" ? "line-through" : "none",
        }}
        title={e.title as string}
      >
        {e.title as string}
      </div>
    );
  };

  return (
    <div
      className="rbc-wrapper"
      style={{
        // Give the calendar enough height so months look good
        minHeight: 600,
      }}
    >
      <style>{`
  /* ─── Modernized react-big-calendar styles ─── */
  
  .rbc-wrapper .rbc-calendar { 
    font-family: inherit; 
    min-height: 600px; 
  }

  /* Toolbar: Nicer spacing, modern buttons with shadows and hover lifts */
  .rbc-wrapper .rbc-toolbar { 
    gap: 12px; 
    flex-wrap: wrap; 
    margin-bottom: 20px; 
  }
  .rbc-wrapper .rbc-toolbar button {
    border: 1px solid rgb(var(--color-border));
    background: rgb(var(--color-surface));
    color: rgb(var(--color-text-primary));
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .rbc-wrapper .rbc-toolbar button:hover {
    background: rgb(var(--color-surface-hover));
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
  }
  .rbc-wrapper .rbc-toolbar button:active {
    transform: translateY(0);
  }
  .rbc-wrapper .rbc-toolbar button.rbc-active {
    background: rgb(var(--color-accent));
    border-color: rgb(var(--color-accent));
    color: #fff;
    box-shadow: 0 2px 4px rgba(var(--color-accent), 0.3);
  }

  /* Calendar Container: Added a subtle shadow and larger border-radius */
  .rbc-wrapper .rbc-month-view,
  .rbc-wrapper .rbc-time-view,
  .rbc-wrapper .rbc-agenda-view {
    border: 1px solid rgb(var(--color-border));
    border-radius: 12px;
    overflow: hidden;
    background: rgb(var(--color-surface));
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  }

  /* Headers (Mon, Tue, Wed...): Uppercase and spaced out for a clean look */
  .rbc-wrapper .rbc-header {
    border-bottom: 1px solid rgb(var(--color-border));
    padding: 12px 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgb(var(--color-text-secondary));
    background: rgb(var(--color-surface-hover));
  }

  /* Grid Cells & Backgrounds */
  .rbc-wrapper .rbc-day-bg { 
    background: rgb(var(--color-surface)); 
  }
  .rbc-wrapper .rbc-off-range-bg { 
    background: rgba(var(--color-text-secondary), 0.04); 
  }
  .rbc-wrapper .rbc-today { 
    background: rgba(var(--color-accent), 0.05); 
  }

  /* Date Numbers */
  .rbc-wrapper .rbc-date-cell { 
    padding: 8px; 
    font-size: 14px; 
    font-weight: 500;
  }
  
  /* Current Date Highlight: Larger hit area and a soft glow */
  .rbc-wrapper .rbc-date-cell.rbc-now > a {
    display: inline-flex; 
    align-items: center; 
    justify-content: center;
    width: 28px; 
    height: 28px; 
    border-radius: 50%;
    background: rgb(var(--color-accent));
    color: #fff; 
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(var(--color-accent), 0.4);
  }

  /* Events: Given a default aesthetic in case you aren't completely replacing them */
  .rbc-wrapper .rbc-event { 
    background: rgb(var(--color-accent)); 
    border: none; 
    border-radius: 4px;
    padding: 2px 6px; 
    font-size: 12px;
    font-weight: 500;
    color: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    transition: opacity 0.2s;
  }
  .rbc-wrapper .rbc-event:hover {
    opacity: 0.85;
  }
  .rbc-wrapper .rbc-event:focus { 
    outline: 2px solid rgb(var(--color-accent));
    outline-offset: 2px;
  }

  /* Show More link (+X more) */
  .rbc-wrapper .rbc-show-more {
    color: rgb(var(--color-accent)); 
    font-size: 12px; 
    font-weight: 600;
    padding: 4px 6px;
    margin-top: 2px;
    display: inline-block;
    transition: opacity 0.2s;
  }
  .rbc-wrapper .rbc-show-more:hover {
    opacity: 0.8;
    text-decoration: underline;
  }

  /* Internal Grid Borders: Made slightly softer so they don't visually clutter */
  .rbc-wrapper .rbc-month-row { border-top: 1px solid rgb(var(--color-border)); }
  .rbc-wrapper .rbc-day-slot .rbc-time-slot { border-top: 1px solid rgba(var(--color-border), 0.5); }
  .rbc-wrapper .rbc-timeslot-group { border-bottom: 1px solid rgb(var(--color-border)); }
  .rbc-wrapper .rbc-time-header-content { border-left: 1px solid rgb(var(--color-border)); }
  .rbc-wrapper .rbc-time-content { border-top: 1px solid rgb(var(--color-border)); }

  /* Time Gutter (Times on the left of Week/Day view) */
  .rbc-wrapper .rbc-time-gutter .rbc-timeslot-group {
    color: rgb(var(--color-text-secondary));
    font-size: 12px;
    font-weight: 500;
  }

  /* Agenda View styling */
  .rbc-wrapper .rbc-agenda-table { 
    border-collapse: collapse; 
  }
  .rbc-wrapper .rbc-agenda-table thead { 
    background: rgb(var(--color-surface-hover)); 
  }
  .rbc-wrapper .rbc-agenda-table th {
    padding: 12px;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.05em;
    color: rgb(var(--color-text-secondary));
    border-bottom: 1px solid rgb(var(--color-border));
  }
  .rbc-wrapper .rbc-agenda-table td {
    padding: 12px;
    font-size: 14px;
    border-color: rgb(var(--color-border));
    color: rgb(var(--color-text-primary));
  }
`}</style>

      <Calendar<TaskEvent>
        localizer={localizer}
        events={events}
        defaultView="month"
        views={["month", "week", "agenda"]}
        style={{ height: 600 }}
        // Fire onTaskClick when an event is clicked
        onSelectEvent={(event) => onTaskClick(event.task)}
        // Fire onDateClick when an empty date cell is clicked
        onSelectSlot={(slot: SlotInfo) => {
          if (onDateClick) {
            const clicked = slot.start as Date;
            const dayTasks = tasks.filter((t) => {
              if (!t.dueDate) return false;
              const d = new Date(t.dueDate);
              return (
                d.getFullYear() === clicked.getFullYear() &&
                d.getMonth() === clicked.getMonth() &&
                d.getDate() === clicked.getDate()
              );
            });
            onDateClick(clicked, dayTasks);
          }
        }}
        selectable
        popup
        components={{ event: EventComponent as any }}
      />
    </div>
  );
}
