/**
 * Unsent form input kept in the browser, so a refresh, a closed tab or an expired session doesn't
 * lose it. Only what a form lists as safe is ever stored (never passwords, NINs, codes or payment
 * details); see `useFormDraft`. Drafts belong to one user and one form (and record), expire, and
 * are all cleared when someone logs out.
 */

const PREFIX = "docuhealth:draft:v1:";

/** How long a draft is offered back. */
export const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Where a draft lives: `local` survives closing the browser (registration and admin forms);
 * `session` only lasts while the tab is open (clinical notes: health information on a computer
 * that may be shared).
 */
export type DraftStorage = "local" | "session";

type StoredDraft = { savedAt: number; values: Record<string, unknown> };

function store(kind: DraftStorage): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    // Storage can be blocked (private mode, site settings); drafts are only a convenience.
    return null;
  }
}

export function draftKey(owner: string, form: string) {
  return `${PREFIX}${owner}:${form}`;
}

export function readDraft(kind: DraftStorage, key: string, now = Date.now()) {
  const storage = store(kind);
  try {
    const raw = storage?.getItem(key);
    if (!raw) return null;
    const draft = JSON.parse(raw) as StoredDraft;
    if (typeof draft?.savedAt !== "number" || now - draft.savedAt > DRAFT_MAX_AGE_MS) {
      storage?.removeItem(key);
      return null;
    }
    return draft.values;
  } catch {
    return null;
  }
}

export function writeDraft(kind: DraftStorage, key: string, values: Record<string, unknown>) {
  try {
    store(kind)?.setItem(
      key,
      JSON.stringify({ savedAt: Date.now(), values } satisfies StoredDraft),
    );
  } catch {
    // Full or blocked storage: the form still works, it just won't be restored.
  }
}

export function removeDraft(kind: DraftStorage, key: string) {
  try {
    store(kind)?.removeItem(key);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}

/** Forget every draft in this browser, e.g. on log out, so the next person never sees them. */
export function clearAllDrafts() {
  for (const kind of ["local", "session"] as const) {
    const storage = store(kind);
    if (!storage) continue;
    try {
      const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(
        (key): key is string => !!key?.startsWith(PREFIX),
      );
      for (const key of keys) storage.removeItem(key);
    } catch {
      // Ignore: nothing was stored.
    }
  }
}
