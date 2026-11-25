import { useCallback, useEffect, useState } from "react";
import { isThrottled, retryAfterSeconds } from "@/lib/api";

/**
 * The API makes each new code wait longer (60, 120, 240, then 300 seconds) and answers a resend
 * that comes too soon with a 429 and `Retry-After`. The browser only sees that header once the
 * API exposes it (CORS), so a refusal without it still waits the shortest step.
 */
const SHORTEST_WAIT = 60;

/**
 * The wait before a code can be sent again. Call `started()` after a code is sent, and
 * `refused(error)` when sending fails: a 429 starts the wait the API asked for and returns true
 * (nothing else to show); any other error returns false.
 */
export function useResendCooldown() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // Stable, so a screen can start the wait from an effect.
  const started = useCallback(() => setSecondsLeft(SHORTEST_WAIT), []);
  const refused = useCallback((error: unknown) => {
    if (!isThrottled(error)) return false;
    setSecondsLeft(retryAfterSeconds(error) ?? SHORTEST_WAIT);
    return true;
  }, []);

  return { secondsLeft, started, refused };
}

/** "Resend code in 1:05", for the button while it waits. */
export function formatWait(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
