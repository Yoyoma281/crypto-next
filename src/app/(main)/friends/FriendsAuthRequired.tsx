import Link from "next/link";
import { Users } from "lucide-react";

export default function FriendsAuthRequired() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "16px",
        color: "#909097",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(78,222,163,0.1)",
          border: "1px solid rgba(78,222,163,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Users size={28} style={{ color: "#4edea3" }} />
      </div>
      <div
        style={{
          fontSize: "20px",
          fontWeight: 800,
          color: "#dce1fb",
          letterSpacing: "0.01em",
        }}
      >
        Sign in to see your friends
      </div>
      <div style={{ fontSize: "13px", textAlign: "center", maxWidth: "320px" }}>
        Connect with other traders, track their progress, and compete on the
        leaderboard together.
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Link
          href="/login"
          style={{
            padding: "9px 24px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 700,
            color: "#0f1420",
            background: "#4edea3",
            textDecoration: "none",
          }}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          style={{
            padding: "9px 24px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 700,
            color: "#dce1fb",
            border: "1px solid #2e3447",
            textDecoration: "none",
          }}
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
