"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Bell, TrendingUp, Info, X } from "lucide-react";

interface Notification {
  _id: string;
  type: "ORDER_FILLED" | "ALERT_TRIGGERED" | "SYSTEM";
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function typeIcon(type: Notification["type"]) {
  if (type === "ORDER_FILLED")
    return <TrendingUp className="h-4 w-4 shrink-0" style={{ color: "#4edea3" }} />;
  if (type === "ALERT_TRIGGERED")
    return <Bell className="h-4 w-4 shrink-0" style={{ color: "#8ccdff" }} />;
  return <Info className="h-4 w-4 shrink-0" style={{ color: "#909097" }} />;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data: NotificationsResponse = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // silently fail — bell is non-critical chrome
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll every 30 s — only update badge when dropdown is closed
  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      if (open) return;
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data: NotificationsResponse = await res.json();
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      } catch {
        // ignore
      }
    }, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    const willOpen = !open;
    setOpen(willOpen);

    if (willOpen && unreadCount > 0) {
      // Optimistically clear badge
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      try {
        await fetch("/api/notifications/read", { method: "POST", body: JSON.stringify({}) });
      } catch {
        // ignore — badge will refresh on next poll
      }
    }
  };

  const handleMarkAllRead = async () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications/read", { method: "POST", body: JSON.stringify({}) });
    } catch {
      // ignore
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    setUnreadCount((prev) =>
      Math.max(0, prev - (notifications.find((n) => n._id === id && !n.read) ? 1 : 0))
    );
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    } catch {
      // ignore
    }
  };

  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 flex items-center justify-center rounded-full bg-red-500 text-white leading-none font-bold"
            style={{
              fontSize: "9px",
              minWidth: unreadCount > 9 ? "16px" : "14px",
              height: unreadCount > 9 ? "16px" : "14px",
              padding: "0 2px",
            }}
          >
            {badgeLabel}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-80 max-h-96 overflow-y-auto rounded-lg shadow-xl z-50 flex flex-col"
          style={{
            background: "#0b1222",
            border: "1px solid #2e3447",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b shrink-0"
            style={{ borderColor: "#2e3447" }}
          >
            <span className="text-xs font-semibold" style={{ color: "#dce1fb" }}>
              Notifications
            </span>
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] font-medium transition-colors"
              style={{ color: "#909097" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#dce1fb")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#909097")}
            >
              Mark all read
            </button>
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <span className="text-xs" style={{ color: "#909097" }}>
                No notifications
              </span>
            </div>
          ) : (
            <ul>
              {notifications.map((n) => {
                const rowContent = (
                  <div
                    className="flex items-start gap-3 px-4 py-3 group relative transition-colors"
                    style={{
                      background: n.read ? "transparent" : "#1a2235",
                      borderBottom: "1px solid #2e3447",
                    }}
                    onMouseEnter={() => setHoveredId(n._id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <span className="mt-0.5">{typeIcon(n.type)}</span>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: "#dce1fb" }}
                      >
                        {n.title}
                      </p>
                      <p
                        className="text-[11px] mt-0.5 leading-relaxed"
                        style={{ color: "#909097" }}
                      >
                        {n.body}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: "#5a6380" }}>
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>

                    {/* Delete button — visible on hover */}
                    {hoveredId === n._id && (
                      <button
                        onClick={(e) => handleDelete(e, n._id)}
                        aria-label="Delete notification"
                        className="absolute top-2 right-2 flex items-center justify-center h-5 w-5 rounded transition-colors"
                        style={{ color: "#909097" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#dce1fb")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#909097")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );

                return (
                  <li key={n._id}>
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => setOpen(false)}
                        className="block hover:opacity-80 transition-opacity"
                      >
                        {rowContent}
                      </Link>
                    ) : (
                      rowContent
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
