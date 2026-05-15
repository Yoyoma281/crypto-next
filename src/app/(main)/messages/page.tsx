"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Send, Search, X, Plus, ChevronLeft } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Participant {
  _id: string;
  username: string;
  avatar: string | null;
  level?: number;
}

interface LastMessage {
  text: string;
  sender: string | null;
  updatedAt: string;
}

interface Conversation {
  _id: string;
  isGroup: boolean;
  groupName: string | null;
  lastMessage: LastMessage;
  participants: Participant[];
  otherParticipants: Participant[];
  updatedAt: string;
}

interface Message {
  _id: string;
  conversationId: string;
  sender: Participant;
  text: string;
  readBy: string[];
  createdAt: string;
}

interface CurrentUser {
  _id: string;
  username: string;
  avatar: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function colorForName(name: string): string {
  const palette = ["#4edea3", "#8ccdff", "#f5c842", "#ffb3ad", "#a78bfa", "#fb923c"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

function resolveAvatar(avatar: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("/uploads/")) return `${BASE_URL}${avatar}`;
  return avatar;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  user,
  size = 38,
}: {
  user: { username: string; avatar: string | null };
  size?: number;
}) {
  const src = resolveAvatar(user.avatar);
  const color = colorForName(user.username);
  const initials = user.username.slice(0, 2).toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={user.username}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1px solid #2e3447",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${color}22`,
        border: `1px solid ${color}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.35),
        fontWeight: 900,
        color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function ConversationItem({
  conv,
  isActive,
  currentUserId,
  onClick,
}: {
  conv: Conversation;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}) {
  const other = conv.otherParticipants[0] ?? conv.participants[0];
  const displayName = conv.isGroup
    ? (conv.groupName ?? "Group")
    : other?.username ?? "Unknown";

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 14px",
        background: isActive ? "rgba(78,222,163,0.08)" : "transparent",
        border: "none",
        borderLeft: isActive ? "3px solid #4edea3" : "3px solid transparent",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      {other ? <Avatar user={other} size={38} /> : (
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#2e3447", flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px" }}>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: isActive ? "#4edea3" : "#dce1fb",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </span>
          {conv.lastMessage?.updatedAt && (
            <span style={{ fontSize: "11px", color: "#5a6380", flexShrink: 0 }}>
              {timeAgo(conv.lastMessage.updatedAt)}
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: "12px",
            color: "#909097",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginTop: "2px",
          }}
        >
          {conv.lastMessage?.text
            ? (String(conv.lastMessage.sender) === currentUserId ? "You: " : "") + conv.lastMessage.text
            : "No messages yet"}
        </p>
      </div>
    </button>
  );
}

function MessageBubble({
  msg,
  isOwn,
}: {
  msg: Message;
  isOwn: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: "8px",
        marginBottom: "6px",
      }}
    >
      {!isOwn && <Avatar user={msg.sender} size={28} />}
      <div
        style={{
          maxWidth: "68%",
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
          gap: "2px",
        }}
      >
        {!isOwn && (
          <span style={{ fontSize: "11px", color: "#909097", marginLeft: "4px" }}>
            {msg.sender.username}
          </span>
        )}
        <div
          style={{
            background: isOwn ? "#4edea3" : "rgba(255,255,255,0.06)",
            color: isOwn ? "#0a0f1e" : "#dce1fb",
            padding: "8px 12px",
            borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            fontSize: "13px",
            lineHeight: 1.5,
            wordBreak: "break-word",
          }}
        >
          {msg.text}
        </div>
        <span style={{ fontSize: "10px", color: "#5a6380", marginLeft: "4px", marginRight: "4px" }}>
          {formatTimestamp(msg.createdAt)}
        </span>
      </div>
    </div>
  );
}

// ─── New Message Modal ────────────────────────────────────────────────────────

function NewMessageModal({
  onClose,
  onStart,
}: {
  onClose: () => void;
  onStart: (userId: string, username: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Participant[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(q.trim())}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        // /api/users/:username returns a single profile object
        if (data?.username) {
          setResults([{ _id: data._id ?? "", username: data.username, avatar: data.avatar ?? null }]);
        } else {
          setResults([]);
        }
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 350);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#12121a",
          border: "1px solid #2e3447",
          borderRadius: "14px",
          padding: "24px",
          width: "100%",
          maxWidth: "400px",
          margin: "0 16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <span style={{ fontSize: "15px", fontWeight: 800, color: "#dce1fb" }}>New Message</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#909097", padding: "4px" }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#0a0a0f",
            border: "1px solid #2e3447",
            borderRadius: "8px",
            padding: "0 12px",
            marginBottom: "12px",
          }}
        >
          <Search size={14} style={{ color: "#909097", flexShrink: 0 }} />
          <input
            autoFocus
            type="text"
            placeholder="Search by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#dce1fb",
              fontSize: "13px",
              padding: "10px 0",
            }}
          />
        </div>

        {searching && (
          <p style={{ fontSize: "12px", color: "#909097", textAlign: "center", padding: "12px 0" }}>
            Searching...
          </p>
        )}

        {!searching && results.length === 0 && query.trim() && (
          <p style={{ fontSize: "12px", color: "#909097", textAlign: "center", padding: "12px 0" }}>
            No user found
          </p>
        )}

        {results.map((user) => (
          <button
            key={user._id || user.username}
            onClick={() => {
              if (user._id) onStart(user._id, user.username);
              else onClose();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              background: "transparent",
              border: "1px solid #2e3447",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#dce1fb",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(78,222,163,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <Avatar user={user} size={34} />
            <span style={{ fontSize: "13px", fontWeight: 700 }}>{user.username}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const socketRef = useSocket();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c._id === activeConvId) ?? null;

  // ── Fetch current user ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?._id) setCurrentUser({ _id: data._id, username: data.username, avatar: data.avatar ?? null });
      })
      .catch(() => {});
  }, []);

  // ── Fetch conversations ─────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/conversations", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      // silently fail
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Fetch messages when active conversation changes ─────────────────────────
  const fetchMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    setMessages([]);
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages?page=1&limit=50`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      // API returns newest-first; reverse for display
      setMessages([...(data.messages ?? [])].reverse());
    } catch {
      // silently fail
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    if (!activeConvId) return;
    fetchMessages(activeConvId);
    // Mark as read
    fetch(`/api/chat/conversations/${activeConvId}/read`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, [activeConvId, fetchMessages]);

  // ── Socket.IO ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Join all known conversation rooms
    conversations.forEach((c) => {
      socket.emit("join_conversation", c._id);
    });

    const handleNewMessage = (msg: Message) => {
      // Append to thread if it's the open conversation
      if (msg.conversationId === activeConvId) {
        setMessages((prev) => {
          const already = prev.some((m) => m._id === msg._id);
          return already ? prev : [...prev, msg];
        });
        // Mark read immediately since the window is open
        fetch(`/api/chat/conversations/${msg.conversationId}/read`, {
          method: "POST",
          credentials: "include",
        }).catch(() => {});
      }

      // Update conversation list preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? {
                ...c,
                lastMessage: {
                  text: msg.text,
                  sender: msg.sender._id,
                  updatedAt: msg.createdAt,
                },
              }
            : c
        )
      );
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socketRef, conversations, activeConvId]);

  // Join newly-opened conversation room
  useEffect(() => {
    if (!activeConvId) return;
    const socket = socketRef.current;
    if (socket) socket.emit("join_conversation", activeConvId);
  }, [activeConvId, socketRef]);

  // ── Scroll to bottom on new messages ───────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text || !activeConvId || sending) return;

    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("send_message", { conversationId: activeConvId, text });
      setInputText("");
      inputRef.current?.focus();
    } else {
      // Fallback: send via HTTP (not implemented in this version, socket required)
      setInputText("");
    }
  }, [inputText, activeConvId, sending, socketRef]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Open conversation ───────────────────────────────────────────────────────
  const openConversation = (convId: string) => {
    setActiveConvId(convId);
    setMobileShowThread(true);
  };

  // ── Start new DM from modal ─────────────────────────────────────────────────
  const startConversation = useCallback(async (userId: string) => {
    setShowNewMsg(false);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const conv: Conversation = data.conversation;
      if (!conv) return;

      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conv._id);
        if (exists) return prev;
        return [conv, ...prev];
      });
      openConversation(conv._id);
    } catch {
      // silently fail
    }
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  const otherPerson = activeConv?.otherParticipants[0] ?? activeConv?.participants[0];
  const threadTitle = activeConv?.isGroup
    ? (activeConv.groupName ?? "Group")
    : otherPerson?.username ?? "Chat";

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 120px)",
        background: "#0a0a0f",
        borderRadius: "14px",
        border: "1px solid #2e3447",
        overflow: "hidden",
        color: "#dce1fb",
      }}
    >
      {/* ── Left sidebar: conversation list ──────────────────────────────── */}
      <div
        style={{
          width: "280px",
          minWidth: "280px",
          background: "#12121a",
          borderRight: "1px solid #2e3447",
          display: "flex",
          flexDirection: "column",
          // On mobile, hide sidebar when thread is open
          ...(mobileShowThread ? { display: "none" as const } : {}),
        }}
        className="messages-sidebar"
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 14px 12px",
            borderBottom: "1px solid #2e3447",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={18} style={{ color: "#4edea3" }} />
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#dce1fb" }}>Messages</span>
          </div>
          <button
            onClick={() => setShowNewMsg(true)}
            title="New message"
            style={{
              background: "rgba(78,222,163,0.1)",
              border: "1px solid rgba(78,222,163,0.3)",
              borderRadius: "8px",
              padding: "5px 8px",
              cursor: "pointer",
              color: "#4edea3",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              fontWeight: 700,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(78,222,163,0.18)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(78,222,163,0.1)"; }}
          >
            <Plus size={13} />
            New
          </button>
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingConvs ? (
            <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "58px",
                    background: "#191f31",
                    borderRadius: "8px",
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "#909097",
                fontSize: "13px",
              }}
            >
              <MessageSquare size={36} style={{ color: "#2e3447", margin: "0 auto 12px" }} />
              <div style={{ fontWeight: 700, color: "#dce1fb", marginBottom: "4px" }}>No conversations yet</div>
              <div>Start a new message to chat with other traders.</div>
              <button
                onClick={() => setShowNewMsg(true)}
                style={{
                  marginTop: "16px",
                  padding: "8px 18px",
                  background: "rgba(78,222,163,0.1)",
                  border: "1px solid rgba(78,222,163,0.3)",
                  borderRadius: "8px",
                  color: "#4edea3",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Start a conversation
              </button>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv._id}
                conv={conv}
                isActive={conv._id === activeConvId}
                currentUserId={currentUser?._id ?? ""}
                onClick={() => openConversation(conv._id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: message thread ───────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {!activeConvId ? (
          /* Empty state */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              color: "#909097",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(78,222,163,0.08)",
                border: "1px solid rgba(78,222,163,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare size={28} style={{ color: "#4edea3" }} />
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#dce1fb" }}>
              Your Messages
            </div>
            <div style={{ fontSize: "13px" }}>Select a conversation or start a new one</div>
            <button
              onClick={() => setShowNewMsg(true)}
              style={{
                marginTop: "4px",
                padding: "9px 22px",
                background: "rgba(78,222,163,0.1)",
                border: "1px solid rgba(78,222,163,0.35)",
                borderRadius: "8px",
                color: "#4edea3",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                letterSpacing: "0.03em",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(78,222,163,0.18)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(78,222,163,0.1)"; }}
            >
              New Message
            </button>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid #2e3447",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "#12121a",
              }}
            >
              {/* Mobile back button */}
              <button
                onClick={() => setMobileShowThread(false)}
                className="messages-back-btn"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#909097",
                  padding: "2px",
                  display: "none",
                }}
              >
                <ChevronLeft size={20} />
              </button>
              {otherPerson && <Avatar user={otherPerson} size={36} />}
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#dce1fb" }}>
                  {threadTitle}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {loadingMsgs ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#909097",
                    fontSize: "13px",
                  }}
                >
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    color: "#909097",
                    fontSize: "13px",
                  }}
                >
                  <MessageSquare size={32} style={{ color: "#2e3447" }} />
                  <span>No messages yet. Say hello!</span>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg._id}
                      msg={msg}
                      isOwn={String(msg.sender._id) === String(currentUser?._id)}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input bar */}
            <div
              style={{
                borderTop: "1px solid #2e3447",
                padding: "12px 16px",
                display: "flex",
                alignItems: "flex-end",
                gap: "10px",
                background: "#12121a",
              }}
            >
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Enter to send)"
                rows={1}
                style={{
                  flex: 1,
                  background: "#0a0a0f",
                  border: "1px solid #2e3447",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "#dce1fb",
                  fontSize: "13px",
                  outline: "none",
                  resize: "none",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                  maxHeight: "120px",
                  overflowY: "auto",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#4edea3"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#2e3447"; }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || sending}
                style={{
                  background: inputText.trim() ? "#4edea3" : "#2e3447",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  cursor: inputText.trim() ? "pointer" : "default",
                  color: inputText.trim() ? "#0a0f1e" : "#909097",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                  flexShrink: 0,
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* New message modal */}
      {showNewMsg && (
        <NewMessageModal
          onClose={() => setShowNewMsg(false)}
          onStart={(userId) => startConversation(userId)}
        />
      )}
    </div>
  );
}
