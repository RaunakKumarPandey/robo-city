import { Round2Settings } from "@/types/database";

export const DEFAULT_ROUND2_SKIP_PENALTY_COST = 50; // 50 seconds per skip
export const DEFAULT_ROUND2_TOUCH_PENALTY_COST = 10; // 10 seconds per touch
export const DEFAULT_ROUND2_MAX_VIVA = 60; // Max viva marks: 60

const ROUND2_SETTINGS_STORAGE_KEY = "robocity_round2_penalty_settings_v2";
const BROADCAST_CHANNEL_NAME = "robocity_scores_realtime_channel";

// In-memory cache for synchronous fallback
let memorySettingsCache: Round2Settings | null = null;
let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!broadcastChannel && typeof window.BroadcastChannel !== "undefined") {
    try {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch {}
  }
  return broadcastChannel;
}

/**
 * Get current Round 2 Arena penalty cost settings.
 * Returns { skip_penalty_cost, touch_penalty_cost }
 */
export function getRound2Settings(): Round2Settings {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(ROUND2_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed &&
          typeof parsed.skip_penalty_cost === "number" &&
          !isNaN(parsed.skip_penalty_cost) &&
          typeof parsed.touch_penalty_cost === "number" &&
          !isNaN(parsed.touch_penalty_cost)
        ) {
          memorySettingsCache = {
            skip_penalty_cost: Math.max(0, parsed.skip_penalty_cost),
            touch_penalty_cost: Math.max(0, parsed.touch_penalty_cost),
          };
          return memorySettingsCache;
        }
      }
    } catch {}
  }

  if (memorySettingsCache) {
    return memorySettingsCache;
  }

  const defaults: Round2Settings = {
    skip_penalty_cost: DEFAULT_ROUND2_SKIP_PENALTY_COST,
    touch_penalty_cost: DEFAULT_ROUND2_TOUCH_PENALTY_COST,
  };

  memorySettingsCache = defaults;
  return defaults;
}

/**
 * Persist updated Round 2 Arena penalty costs.
 * Validates non-negative numbers, saves to localStorage & memory,
 * broadcasts across all tabs, and synchronizes to server API.
 */
export async function saveRound2Settings(
  settings: Partial<Round2Settings>
): Promise<{ success: boolean; settings: Round2Settings; error?: string }> {
  const current = getRound2Settings();

  const skipCost =
    settings.skip_penalty_cost !== undefined
      ? Math.max(0, Number(settings.skip_penalty_cost) || 0)
      : current.skip_penalty_cost;

  const touchCost =
    settings.touch_penalty_cost !== undefined
      ? Math.max(0, Number(settings.touch_penalty_cost) || 0)
      : current.touch_penalty_cost;

  const validSettings: Round2Settings = {
    skip_penalty_cost: skipCost,
    touch_penalty_cost: touchCost,
  };

  memorySettingsCache = validSettings;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        ROUND2_SETTINGS_STORAGE_KEY,
        JSON.stringify(validSettings)
      );
    } catch {}

    // Dispatch custom DOM event for current tab
    try {
      window.dispatchEvent(
        new CustomEvent("round2_settings_updated", {
          detail: validSettings,
        })
      );
    } catch {}

    // Broadcast across all open browser tabs
    const bc = getBroadcastChannel();
    if (bc) {
      try {
        bc.postMessage({
          type: "ROUND2_SETTINGS_UPDATED",
          settings: validSettings,
          timestamp: Date.now(),
        });
      } catch {}
    }

    // Persist to server API
    try {
      const res = await fetch("/api/admin/settings/round2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validSettings),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.settings) {
          return { success: true, settings: json.settings };
        }
      }
    } catch (err) {
      console.warn("Server settings sync warning:", err);
    }
  }

  return { success: true, settings: validSettings };
}

/**
 * Fetch server-persisted settings if available.
 */
export async function fetchRound2Settings(): Promise<Round2Settings> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/admin/settings/round2?_t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.settings) {
          const validated: Round2Settings = {
            skip_penalty_cost: Math.max(0, Number(json.settings.skip_penalty_cost) || DEFAULT_ROUND2_SKIP_PENALTY_COST),
            touch_penalty_cost: Math.max(0, Number(json.settings.touch_penalty_cost) || DEFAULT_ROUND2_TOUCH_PENALTY_COST),
          };
          memorySettingsCache = validated;
          try {
            localStorage.setItem(ROUND2_SETTINGS_STORAGE_KEY, JSON.stringify(validated));
          } catch {}
          return validated;
        }
      }
    } catch {}
  }
  return getRound2Settings();
}
