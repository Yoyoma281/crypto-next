"use client";

import { useEffect, useState } from "react";
import { UserPlus, UserCheck, UserX, Clock, Loader2 } from "lucide-react";

type FriendStatus = "friends" | "request_sent" | "request_received" | "none";

interface StatusResponse {
  status: FriendStatus;
  requestId?: string;
}

interface Props {
  username: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";

export default function FriendButton({ username }: Props) {
  const [status, setStatus] = useState<FriendStatus | null>(null);
  const [requestId, setRequestId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [hoverRemove, setHoverRemove] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`${BASE_URL}/friends/status/${encodeURIComponent(username)}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data: StatusResponse = await res.json();
        setStatus(data.status);
        setRequestId(data.requestId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  async function sendRequest() {
    setMutating(true);
    try {
      const res = await fetch(
        `${BASE_URL}/friends/request/${encodeURIComponent(username)}`,
        { method: "POST", credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setRequestId(data.requestId ?? data._id);
        setStatus("request_sent");
      }
    } catch {
      // silently ignore
    } finally {
      setMutating(false);
    }
  }

  async function cancelRequest() {
    if (!requestId) return;
    setMutating(true);
    try {
      const res = await fetch(
        `${BASE_URL}/friends/cancel/${encodeURIComponent(requestId)}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        setStatus("none");
        setRequestId(undefined);
      }
    } catch {
      // silently ignore
    } finally {
      setMutating(false);
    }
  }

  async function acceptRequest() {
    if (!requestId) return;
    setMutating(true);
    try {
      const res = await fetch(
        `${BASE_URL}/friends/accept/${encodeURIComponent(requestId)}`,
        { method: "POST", credentials: "include" }
      );
      if (res.ok) {
        setStatus("friends");
        setRequestId(undefined);
      }
    } catch {
      // silently ignore
    } finally {
      setMutating(false);
    }
  }

  async function declineRequest() {
    if (!requestId) return;
    setMutating(true);
    try {
      const res = await fetch(
        `${BASE_URL}/friends/decline/${encodeURIComponent(requestId)}`,
        { method: "POST", credentials: "include" }
      );
      if (res.ok) {
        setStatus("none");
        setRequestId(undefined);
      }
    } catch {
      // silently ignore
    } finally {
      setMutating(false);
    }
  }

  async function removeFriend() {
    setMutating(true);
    try {
      const res = await fetch(
        `${BASE_URL}/friends/${encodeURIComponent(username)}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        setStatus("none");
        setRequestId(undefined);
      }
    } catch {
      // silently ignore
    } finally {
      setMutating(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          border: "1px solid #2e3447",
          borderRadius: "6px",
          padding: "6px 14px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#909097",
          opacity: 0.6,
        }}
      >
        <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === null) return null;

  if (status === "none") {
    return (
      <button
        onClick={sendRequest}
        disabled={mutating}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          border: "1px solid #4edea3",
          borderRadius: "6px",
          padding: "6px 14px",
          fontSize: "11px",
          fontWeight: 900,
          color: "#4edea3",
          background: "rgba(78,222,163,0.08)",
          cursor: mutating ? "default" : "pointer",
          opacity: mutating ? 0.6 : 1,
          transition: "all 0.15s ease",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {mutating ? (
          <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <UserPlus size={12} />
        )}
        Add Friend
      </button>
    );
  }

  if (status === "request_sent") {
    return (
      <button
        onClick={cancelRequest}
        disabled={mutating}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          border: "1px solid #2e3447",
          borderRadius: "6px",
          padding: "6px 14px",
          fontSize: "11px",
          fontWeight: 900,
          color: "#909097",
          background: "transparent",
          cursor: mutating ? "default" : "pointer",
          opacity: mutating ? 0.6 : 1,
          transition: "all 0.15s ease",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {mutating ? (
          <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <Clock size={12} />
        )}
        Cancel Request
      </button>
    );
  }

  if (status === "request_received") {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={acceptRequest}
          disabled={mutating}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            border: "1px solid #4edea3",
            borderRadius: "6px",
            padding: "6px 14px",
            fontSize: "11px",
            fontWeight: 900,
            color: "#4edea3",
            background: "rgba(78,222,163,0.08)",
            cursor: mutating ? "default" : "pointer",
            opacity: mutating ? 0.6 : 1,
            transition: "all 0.15s ease",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {mutating ? (
            <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <UserCheck size={12} />
          )}
          Accept
        </button>
        <button
          onClick={declineRequest}
          disabled={mutating}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            border: "1px solid rgba(255,179,173,0.4)",
            borderRadius: "6px",
            padding: "6px 14px",
            fontSize: "11px",
            fontWeight: 900,
            color: "#ffb3ad",
            background: "rgba(255,179,173,0.06)",
            cursor: mutating ? "default" : "pointer",
            opacity: mutating ? 0.6 : 1,
            transition: "all 0.15s ease",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {mutating ? (
            <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <UserX size={12} />
          )}
          Decline
        </button>
      </div>
    );
  }

  // status === "friends"
  return (
    <button
      onClick={removeFriend}
      disabled={mutating}
      onMouseEnter={() => setHoverRemove(true)}
      onMouseLeave={() => setHoverRemove(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        border: hoverRemove ? "1px solid rgba(255,179,173,0.5)" : "1px solid #2e3447",
        borderRadius: "6px",
        padding: "6px 14px",
        fontSize: "11px",
        fontWeight: 900,
        color: hoverRemove ? "#ffb3ad" : "#909097",
        background: hoverRemove ? "rgba(255,179,173,0.06)" : "transparent",
        cursor: mutating ? "default" : "pointer",
        opacity: mutating ? 0.6 : 1,
        transition: "all 0.15s ease",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      {mutating ? (
        <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
      ) : hoverRemove ? (
        <UserX size={12} />
      ) : (
        <UserCheck size={12} />
      )}
      {hoverRemove ? "Remove" : "Friends"}
    </button>
  );
}
