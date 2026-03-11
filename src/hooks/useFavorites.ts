import { useState, useEffect, useRef, useCallback } from "react";

const FAV_API = "/api/favorites";
const STORAGE_KEY = "cryser_favorites";

function readLocal(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function writeLocal(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

function syncToServer(set: Set<string>) {
  const body = JSON.stringify({ favorites: [...set] });
  // keepalive:true lets the request survive a page close
  fetch(FAV_API, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function useFavorites() {
  // Read localStorage synchronously — no flash on first render.
  const [favorites, setFavorites] = useState<Set<string>>(() =>
    typeof window === "undefined" ? new Set() : readLocal()
  );

  // Track whether anything changed since the last DB sync.
  const dirtyRef = useRef(false);
  // Always-current ref used inside event listeners (avoids stale closures).
  const favRef = useRef(favorites);
  favRef.current = favorites;

  const [synced, setSynced] = useState(false);

  // On mount: pull from DB and overwrite local state.
  useEffect(() => {
    fetch(FAV_API, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("unauthenticated");
        return r.json();
      })
      .then((data: { favorites: string[] }) => {
        const set = new Set<string>(data.favorites);
        setFavorites(set);
        writeLocal(set);
        setSynced(true);
      })
      .catch(() => setSynced(false));
  }, []);

  // Save to DB when the browser tab is closed / refreshed.
  useEffect(() => {
    const flush = () => {
      if (dirtyRef.current && synced) syncToServer(favRef.current);
    };
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [synced]);

  // Save to DB on component unmount (Next.js client-side navigation).
  useEffect(() => {
    return () => {
      if (dirtyRef.current && synced) {
        syncToServer(favRef.current);
        dirtyRef.current = false;
      }
    };
  }, [synced]);

  const toggle = useCallback((symbol: string) => {
    const upper = symbol.toUpperCase();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(upper)) next.delete(upper); else next.add(upper);
      writeLocal(next);
      dirtyRef.current = true; // will be flushed on unmount / tab close
      return next;
    });
  }, []);

  return { favorites, toggle, synced };
}
