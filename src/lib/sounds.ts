/**
 * sounds.ts — Web Audio API tone generator for CrySer
 *
 * All sounds are opt-in. Preference is stored in localStorage under
 * `crySer_sounds`. Call playSound() anywhere; it silently no-ops when
 * the user has disabled sounds or the Audio API is unavailable.
 */

const STORAGE_KEY = "crySer_sounds";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // ignore storage errors
  }
}

/** Lazily created AudioContext shared across all calls. */
let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx) {
      _ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
    return _ctx;
  } catch {
    return null;
  }
}

/**
 * Play a short synthetic tone.
 *
 * @param startHz  Starting frequency in Hz
 * @param endHz    Ending frequency in Hz (ramp)
 * @param duration Duration in seconds
 * @param gain     Peak volume 0–1
 * @param startAt  AudioContext time offset for sequencing
 */
function tone(
  ctx: AudioContext,
  startHz: number,
  endHz: number,
  duration: number,
  gain = 0.18,
  startAt = 0,
): void {
  const t0 = ctx.currentTime + startAt;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.type = "sine";
  osc.frequency.setValueAtTime(startHz, t0);
  osc.frequency.linearRampToValueAtTime(endHz, t0 + duration);

  // Soft attack + decay envelope — prevents clicking
  gainNode.gain.setValueAtTime(0, t0);
  gainNode.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  gainNode.gain.setValueAtTime(gain, t0 + duration - 0.02);
  gainNode.gain.linearRampToValueAtTime(0, t0 + duration);

  osc.start(t0);
  osc.stop(t0 + duration);
}

export type SoundType = "fill" | "alert";

/**
 * Play a sound effect if the user has enabled sounds.
 *
 * fill  — short ascending beep (220 → 440 Hz, 80 ms): order executed
 * alert — two quick high beeps: price alert triggered
 */
export function playSound(type: SoundType): void {
  if (!isSoundEnabled()) return;

  const ctx = getCtx();
  if (!ctx) return;

  // Resume context in case it was suspended by the browser autoplay policy
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  if (type === "fill") {
    // Single ascending chirp — feels like a confirmation ping
    tone(ctx, 220, 440, 0.08, 0.2);
  } else if (type === "alert") {
    // Two short beeps at 880 Hz — distinct from the fill sound
    tone(ctx, 880, 880, 0.06, 0.18, 0);
    tone(ctx, 880, 880, 0.06, 0.18, 0.1);
  }
}
