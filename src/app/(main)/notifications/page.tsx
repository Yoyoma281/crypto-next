"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, TrendingUp, Info, X, CheckCheck } from "lucide-react";

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

type FilterTab = "all" | "unread" | "orders" | "alerts" | "system";

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
  if (type === "ORDER_FILLED") {
    return (
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "rgba(78,222,163,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <TrendingUp size={16} style={{ color: "#4edea3" }} />
      </div>
    );
  }
  if (type === "ALERT_TRIGGERED") {
    return (
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "rgba(140,205,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Bell size={16} style={{ color: "#8ccdff" }} />
      </div>
    );
  }
  return (
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: "rgba(144,144,151,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Info size={16} style={{ color: "#909097" }} />
    </div>
  );
}

function matchesFilter(n: Notification, filter: FilterTab): boolean {
  if (filter === "all") return true;
  if (filter === "unread") return !n.read;
  if (filter === "orders") return n.type === "ORDER_FILLED";
  if (filter === "alerts") return n.type === "ALERT_TRIGGERED";
  if (filter === "system") return n.type === "SYSTEM";
  return true;
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "orders", label: "Order Fills" },
  { key: "alerts", label: "Alerts" },
  { key: "system", label: "System" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return;
      const data: NotificationsResponse = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark all as read after 2 seconds
  useEffect(() => {
    const timer = setTimeout(async () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      try {
        await fetch("/api/notifications/read", {
          method: "POST",
          body: JSON.stringify({}),
          credentials: "include",
        });
      } catch {
        // ignore
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        body: JSON.stringify({}),
        credentials: "include",
      });
    } catch {
      // ignore
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // ignore
    }
  };

  const filtered = notifications.filter((n) => matchesFilter(n, filter));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ color: "#dce1fb", minHeight: "100vh" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "rgba(140,205,255,0.12)",
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={22} style={{ color: "#8ccdff" }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#dce1fb",
                margin: 0,
                letterSpacing: "0.02em",
              }}
            >
              Notifications
            </h1>
            <p
              style={{
                fontSize: "12px",
                color: "#909097",
                margin: 0,
                marginTop: "2px",
              }}
            >
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up"}
            </p>
          </div>
        </div>

        {/* Mark all read button */}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #2e3447",
              background: "transparent",
              color: "#909097",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#dce1fb";
              e.currentTarget.style.borderColor = "#4edea3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#909097";
              e.currentTarget.style.borderColor = "#2e3447";
            }}
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((tabItem) => {
          const isActive = filter === tabItem.key;
          const tabUnread =
            tabItem.key === "unread"
              ? unreadCount
              : tabItem.key === "all"
              ? unreadCount
              : 0;
          return (
            <button
              key={tabItem.key}
              onClick={() => setFilter(tabItem.key)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: isActive ? "1px solid #4edea3" : "1px solid #2e3447",
                background: isActive ? "rgba(78,222,163,0.10)" : "transparent",
                color: isActive ? "#4edea3" : "#909097",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.15s",
              }}
            >
              {tabItem.label}
              {tabItem.key === "unread" && tabUnread > 0 && (
                <span
                  style={{
                    background: "#4edea3",
                    color: "#0b1222",
                    borderRadius: "10px",
                    padding: "1px 5px",
                    fontSize: "9px",
                    fontWeight: 900,
                    lineHeight: "14px",
                  }}
                >
                  {tabUnread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "#191f31",
                border: "1px solid #2e3447",
                borderRadius: "10px",
                height: "80px",
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px",
            gap: "12px",
            color: "#909097",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(78,222,163,0.08)",
              border: "1px solid rgba(78,222,163,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCheck size={24} style={{ color: "#4edea3" }} />
          </div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#dce1fb" }}>
            You&apos;re all caught up
          </div>
          <div style={{ fontSize: "13px" }}>No notifications to show</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {filtered.map((n, i) => {
            const isFirst = i === 0;
            const isLast = i === filtered.length - 1;

            const rowContent = (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "16px 20px",
                  background: n.read ? "transparent" : "#1a2235",
                  borderLeft: n.read ? "3px solid transparent" : "3px solid #4edea3",
                  position: "relative",
                  transition: "background 0.15s",
                  borderRadius: isFirst && isLast
                    ? "10px"
                    : isFirst
                    ? "10px 10px 0 0"
                    : isLast
                    ? "0 0 10px 10px"
                    : "0",
                  cursor: n.link ? "pointer" : "default",
                }}
                onMouseEnter={() => setHoveredId(n._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {typeIcon(n.type)}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#dce1fb",
                      margin: "0 0 3px",
                    }}
                  >
                    {n.title}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#909097",
                      margin: "0 0 6px",
                      lineHeight: 1.5,
                    }}
                  >
                    {n.body}
                  </p>
                  <p style={{ fontSize: "11px", color: "#5a6380", margin: 0 }}>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#4edea3",
                      flexShrink: 0,
                      marginTop: "4px",
                    }}
                  />
                )}

                {/* Delete button — visible on hover */}
                {hoveredId === n._id && (
                  <button
                    onClick={(e) => handleDelete(e, n._id)}
                    aria-label="Delete notification"
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "14px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      border: "1px solid #2e3447",
                      background: "#191f31",
                      color: "#909097",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ffb3ad";
                      e.currentTarget.style.borderColor = "#ffb3ad";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#909097";
                      e.currentTarget.style.borderColor = "#2e3447";
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );

            return (
              <div
                key={n._id}
                style={{
                  border: "1px solid #2e3447",
                  borderTop: i === 0 ? "1px solid #2e3447" : "none",
                  borderRadius: isFirst && isLast
                    ? "10px"
                    : isFirst
                    ? "10px 10px 0 0"
                    : isLast
                    ? "0 0 10px 10px"
                    : "0",
                  overflow: "hidden",
                }}
              >
                {n.link ? (
                  <Link
                    href={n.link}
                    style={{ display: "block", textDecoration: "none" }}
                  >
                    {rowContent}
                  </Link>
                ) : (
                  rowContent
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
