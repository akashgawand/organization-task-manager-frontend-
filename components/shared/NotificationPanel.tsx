"use client";

import { useState, useRef, useEffect } from "react";
import { Notification } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { BellIcon, CloseIcon } from "@/components/icons";

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

export default function NotificationPanel({
  notifications,
  onMarkAsRead,
}: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost p-2 relative"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-[rgb(var(--color-danger))] rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 max-h-[32rem] bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg shadow-xl overflow-hidden animate-slide-down z-50">
          <div className="flex-between p-4 border-b border-[rgb(var(--color-border))]">
            <h3 className="font-semibold">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost p-1"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[28rem]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[rgb(var(--color-text-tertiary))]">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`
                    p-4 border-b border-[rgb(var(--color-border-light))] cursor-pointer transition-smooth
                    ${!notif.isRead ? "bg-[rgb(var(--color-accent-light))]" : "hover:bg-[rgb(var(--color-surface-hover))]"}
                  `}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    if (notif.actionUrl) {
                      // Navigate to action URL
                      setIsOpen(false);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">{notif.title}</p>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                        {notif.message}
                      </p>
                      <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-2">
                        {formatRelativeTime(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-[rgb(var(--color-accent))] rounded-full mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
