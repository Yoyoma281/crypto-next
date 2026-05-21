"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Loader2,
  UserMinus,
  Search,
  X,
  UserPlus,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

// ─── Types ──────────────────────────────────────────────────────────────────

interface FriendUser {
  _id: string;
  username: string;
  avatar: string | null;
  online: boolean;
  level: number;
  xp: number;
}

interface IncomingRequest {
  _id: string;
  sender: {
    username: string;
    avatar: string | null;
    level: number;
  };
  createdAt: string;
}

interface SentRequest {
  _id: string;
  receiver: {
    username: string;
    avatar: string | null;
    level: number;
  };
  createdAt: string;
}

type Tab = "friends" | "requests" | "sent";

interface SearchUser {
  _id: string;
  username: string;
  avatar: string | null;
  level: number;
  xp: number;
  online: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getAvatarSrc(avatar: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("/uploads/")) return `${BASE_URL}${avatar}`;
  return avatar;
}

function getInitialsColor(username: string): string {
  const colors = ["#4edea3", "#8ccdff", "#f5c842", "#ffb3ad", "#a78bfa"];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({
  username,
  avatar,
  size = 44,
  online,
}: {
  username: string;
  avatar: string | null;
  size?: number;
  online?: boolean;
}) {
  const src = getAvatarSrc(avatar);
  const color = getInitialsColor(username);
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={username}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #2e3447",
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: `${color}22`,
            border: `2px solid ${color}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.3,
            fontWeight: 900,
            color,
          }}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: online ? "#4edea3" : "#3a3f55",
            border: "2px solid #191f31",
          }}
        />
      )}
    </div>
  );
}

function LevelChip({ level }: { level: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 7px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: 900,
        background: "rgba(78,222,163,0.15)",
        border: "1px solid rgba(78,222,163,0.3)",
        color: "#4edea3",
        letterSpacing: "0.04em",
      }}
    >
      Lv.{level}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        gap: "12px",
        color: "#909097",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "rgba(78,222,163,0.06)",
          border: "1px solid rgba(78,222,163,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "4px",
        }}
      >
        <Icon size={22} style={{ color: "#4edea3", opacity: 0.7 }} />
      </div>
      <div style={{ fontSize: "15px", fontWeight: 700, color: "#dce1fb" }}>
        {title}
      </div>
      <div style={{ fontSize: "12px", maxWidth: "260px" }}>{subtitle}</div>
    </div>
  );
}

// ─── Action button ─────────────────────────────────────────────────────────

function ActionBtn({
  onClick,
  loading,
  variant,
  children,
}: {
  onClick: () => void;
  loading: boolean;
  variant: "danger" | "primary" | "ghost";
  children: React.ReactNode;
}) {
  const styles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    border:
      variant === "primary"
        ? "1px solid #4edea3"
        : variant === "danger"
        ? "1px solid rgba(255,179,173,0.4)"
        : "1px solid #2e3447",
    borderRadius: "6px",
    padding: "5px 12px",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: loading ? "default" : "pointer",
    opacity: loading ? 0.6 : 1,
    transition: "all 0.15s ease",
    color:
      variant === "primary"
        ? "#4edea3"
        : variant === "danger"
        ? "#ffb3ad"
        : "#909097",
    background:
      variant === "primary"
        ? "rgba(78,222,163,0.08)"
        : variant === "danger"
        ? "rgba(255,179,173,0.06)"
        : "transparent",
  };

  return (
    <button onClick={onClick} disabled={loading} style={styles}>
      {loading && (
        <Loader2
          size={11}
          style={{ animation: "spin 1s linear infinite" }}
        />
      )}
      {children}
    </button>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function FriendsClient() {
  const [activeTab, setActiveTab] = useState<Tab>("friends");

  // ── Search ──
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [sent, setSent] = useState<SentRequest[]>([]);

  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingSent, setLoadingSent] = useState(true);

  const [mutatingId, setMutatingId] = useState<string | null>(null);

  // ── Fetchers ──

  const fetchFriends = useCallback(() => {
    setLoadingFriends(true);
    fetch(`${BASE_URL}/friends`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setFriends(data.friends ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingFriends(false));
  }, []);

  const fetchRequests = useCallback(() => {
    setLoadingRequests(true);
    fetch(`${BASE_URL}/friends/requests`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setRequests(data.requests ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
  }, []);

  const fetchSent = useCallback(() => {
    setLoadingSent(true);
    fetch(`${BASE_URL}/friends/sent`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setSent(data.sent ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingSent(false));
  }, []);

  useEffect(() => {
    fetchFriends();
    fetchRequests();
    fetchSent();
  }, [fetchFriends, fetchRequests, fetchSent]);

  // ── Mutations ──

  async function acceptRequest(requestId: string) {
    setMutatingId(requestId);
    try {
      const res = await fetch(
        `${BASE_URL}/friends/accept/${encodeURIComponent(requestId)}`,
        { method: "POST", credentials: "include" }
      );
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
        fetchFriends();
      }
    } catch {
      // silently ignore
    } finally {
      setMutatingId(null);
    }
  }

  async function declineRequest(requestId: string) {
    setMutatingId(requestId);
    try {
      const res = await fetch(
        `${BASE_URL}/friends/decline/${encodeURIComponent(requestId)}`,
        { method: "POST", credentials: "include" }
      );
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch {
      // silently ignore
    } finally {
      setMutatingId(null);
    }
  }

  async function cancelSent(requestId: string) {
    setMutatingId(requestId);
    try {
      const res = await fetch(
        `${BASE_URL}/friends/cancel/${encodeURIComponent(requestId)}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        setSent((prev) => prev.filter((r) => r._id !== requestId));
      }
    } catch {
      // silently ignore
    } finally {
      setMutatingId(null);
    }
  }

  async function removeFriend(username: string) {
    setMutatingId(username);
    try {
      const res = await fetch(
        `${BASE_URL}/friends/${encodeURIComponent(username)}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        setFriends((prev) => prev.filter((f) => f.username !== username));
      }
    } catch {
      // silently ignore
    } finally {
      setMutatingId(null);
    }
  }

  // ── Search ──

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/users/search?q=${encodeURIComponent(value.trim())}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.users ?? []);
        }
      } catch {
        // ignore
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }

  async function sendRequest(username: string) {
    setMutatingId(username);
    try {
      const res = await fetch(
        `${BASE_URL}/friends/request/${encodeURIComponent(username)}`,
        { method: "POST", credentials: "include" }
      );
      if (res.ok) {
        setSentTo((prev) => new Set(prev).add(username));
        fetchSent();
      }
    } catch {
      // ignore
    } finally {
      setMutatingId(null);
    }
  }

  // ── Tab counts ──

  const pendingCount = requests.length;

  // ── Render ──

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "friends", label: "Friends", count: friends.length },
    { key: "requests", label: "Requests", count: pendingCount || undefined },
    { key: "sent", label: "Sent", count: sent.length || undefined },
  ];

  return (
    <div style={{ color: "#dce1fb", maxWidth: "760px", margin: "0 auto" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "rgba(78,222,163,0.12)",
            border: "1px solid rgba(78,222,163,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Users size={20} style={{ color: "#4edea3" }} />
        </div>
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#dce1fb",
              margin: 0,
              letterSpacing: "0.01em",
            }}
          >
            Friends
          </h1>
          <p
            style={{
              fontSize: "12px",
              color: "#909097",
              margin: 0,
              marginTop: "2px",
            }}
          >
            Connect with other traders and track their progress
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search
          size={15}
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#909097",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search traders by username…"
          style={{
            width: "100%",
            background: "#191f31",
            border: "1px solid #2e3447",
            borderRadius: "10px",
            padding: "10px 40px",
            fontSize: "13px",
            color: "#dce1fb",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#4edea366")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#2e3447")}
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(""); setSearchResults([]); }}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#909097",
              padding: "2px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        )}

        {/* Search results dropdown */}
        {searchQuery.trim().length >= 2 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "#191f31",
              border: "1px solid #2e3447",
              borderRadius: "10px",
              zIndex: 50,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            {searchLoading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#909097", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                Searching…
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#909097", fontSize: "12px" }}>
                No users found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              searchResults.map((user, i) => {
                const isFriend = friends.some((f) => f._id === user._id);
                const alreadySent = sentTo.has(user.username) || sent.some((s) => s.receiver.username === user.username);
                const isMutating = mutatingId === user.username;
                return (
                  <div
                    key={user._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 16px",
                      gap: "12px",
                      borderBottom: i < searchResults.length - 1 ? "1px solid #2e3447" : "none",
                    }}
                  >
                    <Avatar username={user.username} avatar={user.avatar} size={38} online={user.online} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
                        <Link
                          href={`/u/${encodeURIComponent(user.username)}`}
                          style={{ fontSize: "13px", fontWeight: 800, color: "#dce1fb", textDecoration: "none" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#4edea3")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#dce1fb")}
                        >
                          {user.username}
                        </Link>
                        <LevelChip level={user.level} />
                      </div>
                      <div style={{ fontSize: "11px", color: "#909097", fontFamily: "monospace" }}>
                        {(user.xp ?? 0).toLocaleString()} XP
                      </div>
                    </div>
                    {isFriend ? (
                      <span style={{ fontSize: "11px", color: "#4edea3", fontWeight: 700 }}>Friends</span>
                    ) : alreadySent ? (
                      <span style={{ fontSize: "11px", color: "#909097", fontWeight: 600 }}>Request sent</span>
                    ) : (
                      <ActionBtn onClick={() => sendRequest(user.username)} loading={isMutating} variant="primary">
                        {!isMutating && <UserPlus size={11} />}
                        Add
                      </ActionBtn>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "2px",
          borderBottom: "1px solid #2e3447",
          marginBottom: "20px",
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: active ? 800 : 600,
                color: active ? "#4edea3" : "#909097",
                background: "transparent",
                border: "none",
                borderBottom: active ? "2px solid #4edea3" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
                marginBottom: "-1px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "18px",
                    height: "18px",
                    borderRadius: "9px",
                    padding: "0 5px",
                    fontSize: "10px",
                    fontWeight: 900,
                    background:
                      tab.key === "requests"
                        ? "#4edea3"
                        : "rgba(78,222,163,0.2)",
                    color:
                      tab.key === "requests" ? "#0f1420" : "#4edea3",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}

      {/* ── Friends tab ── */}
      {activeTab === "friends" && (
        <div>
          {loadingFriends ? (
            <FriendsSkeleton />
          ) : friends.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No friends yet"
              subtitle="Search for traders on the leaderboard or user profiles and send them a friend request."
            />
          ) : (
            <div
              style={{
                background: "#191f31",
                border: "1px solid #2e3447",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              {friends.map((friend, i) => {
                const isLast = i === friends.length - 1;
                const removing = mutatingId === friend.username;
                return (
                  <div
                    key={friend._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "14px 18px",
                      gap: "14px",
                      borderBottom: isLast ? "none" : "1px solid #2e3447",
                      transition: "background 0.1s",
                    }}
                  >
                    <Avatar
                      username={friend.username}
                      avatar={friend.avatar}
                      size={44}
                      online={friend.online}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Link
                          href={`/u/${encodeURIComponent(friend.username)}`}
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: "#dce1fb",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#4edea3")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#dce1fb")
                          }
                        >
                          {friend.username}
                        </Link>
                        <LevelChip level={friend.level} />
                        <span
                          style={{
                            fontSize: "10px",
                            color: friend.online ? "#4edea3" : "#909097",
                            fontWeight: 600,
                          }}
                        >
                          {friend.online ? "Online" : "Offline"}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#909097",
                          fontFamily: "monospace",
                        }}
                      >
                        {friend.xp.toLocaleString()} XP
                      </div>
                    </div>
                    <ActionBtn
                      onClick={() => removeFriend(friend.username)}
                      loading={removing}
                      variant="danger"
                    >
                      {!removing && <UserMinus size={11} />}
                      Remove
                    </ActionBtn>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Requests tab ── */}
      {activeTab === "requests" && (
        <div>
          {loadingRequests ? (
            <FriendsSkeleton />
          ) : requests.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No pending requests"
              subtitle="When someone sends you a friend request, it will appear here."
            />
          ) : (
            <div
              style={{
                background: "#191f31",
                border: "1px solid #2e3447",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              {requests.map((req, i) => {
                const isLast = i === requests.length - 1;
                const isMutating = mutatingId === req._id;
                return (
                  <div
                    key={req._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "14px 18px",
                      gap: "14px",
                      borderBottom: isLast ? "none" : "1px solid #2e3447",
                    }}
                  >
                    <Avatar
                      username={req.sender.username}
                      avatar={req.sender.avatar}
                      size={44}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Link
                          href={`/u/${encodeURIComponent(req.sender.username)}`}
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: "#dce1fb",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#4edea3")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#dce1fb")
                          }
                        >
                          {req.sender.username}
                        </Link>
                        <LevelChip level={req.sender.level} />
                      </div>
                      <div style={{ fontSize: "11px", color: "#909097" }}>
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexShrink: 0,
                        flexWrap: "wrap",
                      }}
                    >
                      <ActionBtn
                        onClick={() => acceptRequest(req._id)}
                        loading={isMutating}
                        variant="primary"
                      >
                        {!isMutating && <UserCheck size={11} />}
                        Accept
                      </ActionBtn>
                      <ActionBtn
                        onClick={() => declineRequest(req._id)}
                        loading={isMutating}
                        variant="danger"
                      >
                        {!isMutating && <UserX size={11} />}
                        Decline
                      </ActionBtn>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Sent tab ── */}
      {activeTab === "sent" && (
        <div>
          {loadingSent ? (
            <FriendsSkeleton />
          ) : sent.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No sent requests"
              subtitle="Requests you send to other traders will appear here while they are pending."
            />
          ) : (
            <div
              style={{
                background: "#191f31",
                border: "1px solid #2e3447",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              {sent.map((req, i) => {
                const isLast = i === sent.length - 1;
                const isMutating = mutatingId === req._id;
                return (
                  <div
                    key={req._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "14px 18px",
                      gap: "14px",
                      borderBottom: isLast ? "none" : "1px solid #2e3447",
                    }}
                  >
                    <Avatar
                      username={req.receiver.username}
                      avatar={req.receiver.avatar}
                      size={44}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Link
                          href={`/u/${encodeURIComponent(req.receiver.username)}`}
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: "#dce1fb",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#4edea3")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#dce1fb")
                          }
                        >
                          {req.receiver.username}
                        </Link>
                        <LevelChip level={req.receiver.level} />
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#909097",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Clock size={10} />
                        Pending &middot;{" "}
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <ActionBtn
                      onClick={() => cancelSent(req._id)}
                      loading={isMutating}
                      variant="ghost"
                    >
                      {!isMutating && <UserX size={11} />}
                      Cancel
                    </ActionBtn>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Loading skeleton ───────────────────────────────────────────────────────

function FriendsSkeleton() {
  return (
    <div
      style={{
        background: "#191f31",
        border: "1px solid #2e3447",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 18px",
            gap: "14px",
            borderBottom: i < 3 ? "1px solid #2e3447" : "none",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#2e3447",
              flexShrink: 0,
              opacity: 0.5,
            }}
          />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                height: "13px",
                width: "120px",
                background: "#2e3447",
                borderRadius: "4px",
                opacity: 0.5,
              }}
            />
            <div
              style={{
                height: "10px",
                width: "70px",
                background: "#2e3447",
                borderRadius: "4px",
                opacity: 0.3,
              }}
            />
          </div>
          <div
            style={{
              height: "28px",
              width: "72px",
              background: "#2e3447",
              borderRadius: "6px",
              opacity: 0.4,
            }}
          />
        </div>
      ))}
    </div>
  );
}
