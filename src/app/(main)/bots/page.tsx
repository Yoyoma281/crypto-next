"use client";

import { useEffect, useState } from "react";
import { Bot, RefreshCw, Pause, Play, Trash2, Plus, X } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface DcaBot {
  _id: string;
  symbol: string;
  amountUsdt: string;
  frequency: string;
  nextRun?: string;
  totalInvested: string;
  executionCount: number;
  isActive: boolean;
}

interface GridBot {
  _id: string;
  symbol: string;
  lowerPrice: string;
  upperPrice: string;
  gridCount: number;
  amountPerGrid: string;
  isActive: boolean;
  filledGrids: number;
}

type Tab = "dca" | "grid";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function freqLabel(f: string) {
  const map: Record<string, string> = {
    "1h": "Every 1 hour",
    "6h": "Every 6 hours",
    "24h": "Every 24 hours",
    "72h": "Every 3 days",
    "168h": "Every week",
  };
  return map[f] ?? f;
}

// ── Status dot ───────────────────────────────────────────────────────────────

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: active ? "#4edea3" : "#f5c842",
        boxShadow: active ? "0 0 6px #4edea3" : "0 0 6px #f5c842",
        flexShrink: 0,
      }}
    />
  );
}

// ── Action button ─────────────────────────────────────────────────────────────

function ActionBtn({
  onClick,
  disabled,
  color,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: "transparent",
        border: `1px solid ${color}44`,
        borderRadius: 6,
        color,
        padding: "4px 8px",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontSize: 12,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = `${color}18`;
          e.currentTarget.style.borderColor = `${color}88`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = `${color}44`;
      }}
    >
      {children}
    </button>
  );
}

// ── Create DCA Bot Modal ──────────────────────────────────────────────────────

interface CreateDcaBotModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateDcaBotModal({ onClose, onCreated }: CreateDcaBotModalProps) {
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("24h");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!symbol.trim() || !amount) {
      setError("Symbol and amount are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bots/dca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          symbol: symbol.toUpperCase().trim(),
          amountUsdt: amount,
          frequency,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Failed to create bot.");
        return;
      }
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <ModalHeader title="Create DCA Bot" onClose={onClose} />

        <FieldGroup label="Symbol (e.g. BTCUSDT)">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="BTCUSDT"
            style={inputStyle}
          />
        </FieldGroup>

        <FieldGroup label="Amount USDT per purchase">
          <input
            type="number"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50"
            style={inputStyle}
          />
        </FieldGroup>

        <FieldGroup label="Frequency">
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="1h">Every 1 hour</option>
            <option value="6h">Every 6 hours</option>
            <option value="24h">Every 24 hours</option>
            <option value="72h">Every 3 days</option>
            <option value="168h">Every week</option>
          </select>
        </FieldGroup>

        {error && (
          <p style={{ fontSize: 12, color: "#ffb3ad", margin: 0 }}>{error}</p>
        )}

        <SubmitBtn loading={loading} label="Create DCA Bot" />
      </form>
    </ModalOverlay>
  );
}

// ── Create Grid Bot Modal ─────────────────────────────────────────────────────

interface CreateGridBotModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateGridBotModal({ onClose, onCreated }: CreateGridBotModalProps) {
  const [symbol, setSymbol] = useState("");
  const [lowerPrice, setLowerPrice] = useState("");
  const [upperPrice, setUpperPrice] = useState("");
  const [gridCount, setGridCount] = useState(10);
  const [amountPerGrid, setAmountPerGrid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!symbol.trim() || !lowerPrice || !upperPrice || !amountPerGrid) {
      setError("All fields are required.");
      return;
    }
    if (Number(lowerPrice) >= Number(upperPrice)) {
      setError("Lower price must be less than upper price.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bots/grid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          symbol: symbol.toUpperCase().trim(),
          lowerPrice,
          upperPrice,
          gridCount,
          amountPerGrid,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Failed to create bot.");
        return;
      }
      onCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <ModalHeader title="Create Grid Bot" onClose={onClose} />

        <FieldGroup label="Symbol (e.g. ETHUSDT)">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="ETHUSDT"
            style={inputStyle}
          />
        </FieldGroup>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FieldGroup label="Lower Price (USDT)">
            <input
              type="number"
              min="0"
              step="any"
              value={lowerPrice}
              onChange={(e) => setLowerPrice(e.target.value)}
              placeholder="1800"
              style={inputStyle}
            />
          </FieldGroup>
          <FieldGroup label="Upper Price (USDT)">
            <input
              type="number"
              min="0"
              step="any"
              value={upperPrice}
              onChange={(e) => setUpperPrice(e.target.value)}
              placeholder="2200"
              style={inputStyle}
            />
          </FieldGroup>
        </div>

        <FieldGroup label={`Grid Count: ${gridCount}`}>
          <input
            type="range"
            min={2}
            max={50}
            value={gridCount}
            onChange={(e) => setGridCount(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#4edea3", cursor: "pointer" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "#45464d",
              marginTop: 2,
            }}
          >
            <span>2</span>
            <span>50</span>
          </div>
        </FieldGroup>

        <FieldGroup label="Amount per Grid (USDT)">
          <input
            type="number"
            min="1"
            step="any"
            value={amountPerGrid}
            onChange={(e) => setAmountPerGrid(e.target.value)}
            placeholder="20"
            style={inputStyle}
          />
        </FieldGroup>

        {error && (
          <p style={{ fontSize: 12, color: "#ffb3ad", margin: 0 }}>{error}</p>
        )}

        <SubmitBtn loading={loading} label="Create Grid Bot" />
      </form>
    </ModalOverlay>
  );
}

// ── Modal primitives ──────────────────────────────────────────────────────────

function ModalOverlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#12121a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#dce1fb" }}>
        {title}
      </h2>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#45464d",
          padding: 4,
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#dce1fb")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#45464d")}
      >
        <X size={18} />
      </button>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#909097" }}>{label}</label>
      {children}
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        background: "#4edea3",
        color: "#0a0a0f",
        border: "none",
        borderRadius: 8,
        padding: "10px 0",
        fontWeight: 800,
        fontSize: 14,
        cursor: loading ? "default" : "pointer",
        opacity: loading ? 0.7 : 1,
        transition: "opacity 0.15s",
      }}
    >
      {loading ? "Creating..." : label}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#0a0a0f",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "#dce1fb",
  fontSize: 13,
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        padding: "40px 24px",
        textAlign: "center",
        color: "#45464d",
        fontSize: 13,
        background: "#12121a",
      }}
    >
      {message}
    </div>
  );
}

// ── DCA Bot card ──────────────────────────────────────────────────────────────

function DcaBotCard({
  bot,
  onAction,
}: {
  bot: DcaBot;
  onAction: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const endpoint = bot.isActive
      ? `/api/bots/dca/${bot._id}/pause`
      : `/api/bots/dca/${bot._id}/resume`;
    await fetch(endpoint, { method: "PUT", credentials: "include" }).catch(() => {});
    setBusy(false);
    onAction();
  }

  async function del() {
    if (!confirm("Delete this DCA bot?")) return;
    setBusy(true);
    await fetch(`/api/bots/dca/${bot._id}`, {
      method: "DELETE",
      credentials: "include",
    }).catch(() => {});
    setBusy(false);
    onAction();
  }

  return (
    <div
      style={{
        background: "#12121a",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <StatusDot active={bot.isActive} />
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#dce1fb",
              fontFamily: "monospace",
            }}
          >
            {bot.symbol}
          </div>
          <div style={{ fontSize: 11, color: "#45464d", marginTop: 2 }}>
            {freqLabel(bot.frequency)} · ${bot.amountUsdt} / buy
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          fontSize: 12,
          color: "#909097",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ color: "#45464d", fontSize: 10, marginBottom: 2 }}>INVESTED</div>
          <div style={{ color: "#dce1fb", fontFamily: "monospace" }}>
            ${bot.totalInvested}
          </div>
        </div>
        <div>
          <div style={{ color: "#45464d", fontSize: 10, marginBottom: 2 }}>EXECUTIONS</div>
          <div style={{ color: "#dce1fb", fontFamily: "monospace" }}>
            {bot.executionCount}
          </div>
        </div>
        <div>
          <div style={{ color: "#45464d", fontSize: 10, marginBottom: 2 }}>NEXT RUN</div>
          <div style={{ color: "#dce1fb", fontFamily: "monospace", fontSize: 11 }}>
            {fmtDate(bot.nextRun)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <ActionBtn
          onClick={toggle}
          disabled={busy}
          color={bot.isActive ? "#f5c842" : "#4edea3"}
          title={bot.isActive ? "Pause" : "Resume"}
        >
          {bot.isActive ? <Pause size={12} /> : <Play size={12} />}
          {bot.isActive ? "Pause" : "Resume"}
        </ActionBtn>
        <ActionBtn onClick={del} disabled={busy} color="#ffb3ad" title="Delete">
          <Trash2 size={12} />
          Delete
        </ActionBtn>
      </div>
    </div>
  );
}

// ── Grid Bot card ─────────────────────────────────────────────────────────────

function GridBotCard({
  bot,
  onAction,
}: {
  bot: GridBot;
  onAction: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const endpoint = bot.isActive
      ? `/api/bots/grid/${bot._id}/pause`
      : `/api/bots/grid/${bot._id}/resume`;
    await fetch(endpoint, { method: "PUT", credentials: "include" }).catch(() => {});
    setBusy(false);
    onAction();
  }

  async function del() {
    if (!confirm("Delete this grid bot?")) return;
    setBusy(true);
    await fetch(`/api/bots/grid/${bot._id}`, {
      method: "DELETE",
      credentials: "include",
    }).catch(() => {});
    setBusy(false);
    onAction();
  }

  return (
    <div
      style={{
        background: "#12121a",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <StatusDot active={bot.isActive} />
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#dce1fb",
              fontFamily: "monospace",
            }}
          >
            {bot.symbol}
          </div>
          <div style={{ fontSize: 11, color: "#45464d", marginTop: 2 }}>
            {bot.gridCount} grids · ${bot.amountPerGrid} / grid
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          fontSize: 12,
          color: "#909097",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ color: "#45464d", fontSize: 10, marginBottom: 2 }}>RANGE</div>
          <div style={{ color: "#dce1fb", fontFamily: "monospace", fontSize: 11 }}>
            ${bot.lowerPrice} – ${bot.upperPrice}
          </div>
        </div>
        <div>
          <div style={{ color: "#45464d", fontSize: 10, marginBottom: 2 }}>FILLED</div>
          <div style={{ color: "#dce1fb", fontFamily: "monospace" }}>
            {bot.filledGrids} / {bot.gridCount}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <ActionBtn
          onClick={toggle}
          disabled={busy}
          color={bot.isActive ? "#f5c842" : "#4edea3"}
          title={bot.isActive ? "Pause" : "Resume"}
        >
          {bot.isActive ? <Pause size={12} /> : <Play size={12} />}
          {bot.isActive ? "Pause" : "Resume"}
        </ActionBtn>
        <ActionBtn onClick={del} disabled={busy} color="#ffb3ad" title="Delete">
          <Trash2 size={12} />
          Delete
        </ActionBtn>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BotsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dca");
  const [dcaBots, setDcaBots] = useState<DcaBot[]>([]);
  const [gridBots, setGridBots] = useState<GridBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDcaModal, setShowDcaModal] = useState(false);
  const [showGridModal, setShowGridModal] = useState(false);

  async function loadBots() {
    setLoading(true);
    try {
      const [dcaRes, gridRes] = await Promise.all([
        fetch("/api/bots/dca", { credentials: "include" }),
        fetch("/api/bots/grid", { credentials: "include" }),
      ]);
      const dcaData = dcaRes.ok ? await dcaRes.json() : { bots: [] };
      const gridData = gridRes.ok ? await gridRes.json() : { bots: [] };
      setDcaBots(dcaData.bots ?? []);
      setGridBots(gridData.bots ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBots();
  }, []);

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "0 auto",
        color: "#dce1fb",
        paddingBottom: 32,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Bot size={24} style={{ color: "#4edea3" }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Trading Bots</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#45464d" }}>
              Automate your crypto trades with DCA and Grid strategies
            </p>
          </div>
        </div>
        <button
          onClick={loadBots}
          disabled={loading}
          title="Refresh"
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "6px 8px",
            cursor: loading ? "default" : "pointer",
            color: "#909097",
            display: "flex",
            alignItems: "center",
          }}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          background: "#12121a",
          borderRadius: 10,
          padding: 4,
          border: "1px solid rgba(255,255,255,0.07)",
          width: "fit-content",
        }}
      >
        {(["dca", "grid"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? "#1e2235" : "transparent",
              border: activeTab === tab ? "1px solid rgba(78,222,163,0.2)" : "1px solid transparent",
              borderRadius: 7,
              padding: "7px 20px",
              cursor: "pointer",
              color: activeTab === tab ? "#4edea3" : "#45464d",
              fontWeight: 700,
              fontSize: 13,
              transition: "all 0.15s",
            }}
          >
            {tab === "dca" ? "DCA Bots" : "Grid Bots"}
          </button>
        ))}
      </div>

      {/* DCA Tab */}
      {activeTab === "dca" && (
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#45464d",
              }}
            >
              DCA Bots ({dcaBots.length})
            </span>
            <button
              onClick={() => setShowDcaModal(true)}
              style={{
                background: "#4edea3",
                color: "#0a0a0f",
                border: "none",
                borderRadius: 8,
                padding: "7px 14px",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus size={14} />
              Create DCA Bot
            </button>
          </div>

          {loading ? (
            <LoadingSkeleton rows={3} />
          ) : dcaBots.length === 0 ? (
            <EmptyState message="No DCA bots yet. Create one to start dollar-cost averaging automatically." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dcaBots.map((bot) => (
                <DcaBotCard key={bot._id} bot={bot} onAction={loadBots} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Grid Tab */}
      {activeTab === "grid" && (
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#45464d",
              }}
            >
              Grid Bots ({gridBots.length})
            </span>
            <button
              onClick={() => setShowGridModal(true)}
              style={{
                background: "#4edea3",
                color: "#0a0a0f",
                border: "none",
                borderRadius: 8,
                padding: "7px 14px",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus size={14} />
              Create Grid Bot
            </button>
          </div>

          {loading ? (
            <LoadingSkeleton rows={3} />
          ) : gridBots.length === 0 ? (
            <EmptyState message="No grid bots yet. Create one to profit from sideways market movement." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {gridBots.map((bot) => (
                <GridBotCard key={bot._id} bot={bot} onAction={loadBots} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modals */}
      {showDcaModal && (
        <CreateDcaBotModal
          onClose={() => setShowDcaModal(false)}
          onCreated={loadBots}
        />
      )}
      {showGridModal && (
        <CreateGridBotModal
          onClose={() => setShowGridModal(false)}
          onCreated={loadBots}
        />
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton({ rows }: { rows: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "#12121a",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 12,
            height: 72,
            opacity: 0.5,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}
