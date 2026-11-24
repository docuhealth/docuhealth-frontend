import { useEffect, useRef, useState } from "react";
import type { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";
import { type DraftStorage, draftKey, readDraft, removeDraft, writeDraft } from "@/lib/form-drafts";
import { useAuthStore } from "@/stores/auth-store";

const SAVE_DELAY_MS = 500;

const isBlank = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === "" ||
  value === false ||
  (Array.isArray(value) && value.length === 0);

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/**
 * Keeps what's been typed into `form` in the browser, and offers it back after a refresh, a
 * closed tab or an expired session. Only `fields` are kept: list the safe ones, never passwords,
 * NINs, codes or payment details. `form` names the draft; add the record (e.g. the visit's id)
 * when the same form opens for different records. Drafts are the signed-in user's own.
 *
 * Call `clear()` once the form is sent. `restored` is true when saved input was put back;
 * `discard()` drops it and resets those fields (show both with `DraftNotice`).
 */
export function useFormDraft<TValues extends FieldValues, TContext, TOutput>(
  formApi: UseFormReturn<TValues, TContext, TOutput>,
  {
    form,
    fields,
    storage = "local",
    enabled = true,
  }: {
    form: string;
    fields: readonly Path<TValues>[];
    storage?: DraftStorage;
    enabled?: boolean;
  },
) {
  const owner = useAuthStore((state) => state.session?.user.id ?? "signed-out");
  const key = draftKey(owner, form);
  const [restored, setRestored] = useState(false);
  const fieldsRef = useRef(fields);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Saving starts only after the stored draft has been put back, so it isn't overwritten.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const saved = readDraft(storage, key);
    const entries = Object.entries(saved ?? {}).filter(
      ([name, value]) => fieldsRef.current.includes(name as Path<TValues>) && !isBlank(value),
    );
    for (const [name, value] of entries) {
      formApi.setValue(name as Path<TValues>, value as PathValue<TValues, Path<TValues>>, {
        shouldDirty: true,
      });
    }
    setRestored(entries.length > 0);
    setReady(true);
  }, [enabled, formApi, key, storage]);

  useEffect(() => {
    if (!enabled || !ready) return;
    const subscription = formApi.watch((values) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const defaults = (formApi.formState.defaultValues ?? {}) as Record<string, unknown>;
        const current = values as Record<string, unknown>;
        const picked = Object.fromEntries(fieldsRef.current.map((name) => [name, current[name]]));
        // Nothing typed beyond how the form started (blank, or pre-filled): nothing to keep.
        const untouched = fieldsRef.current.every(
          (name) => isBlank(current[name]) || same(current[name], defaults[name]),
        );
        if (untouched) removeDraft(storage, key);
        else writeDraft(storage, key, picked);
      }, SAVE_DELAY_MS);
    });
    return () => {
      clearTimeout(timer.current);
      subscription.unsubscribe();
    };
  }, [enabled, ready, formApi, key, storage]);

  function forget() {
    clearTimeout(timer.current);
    removeDraft(storage, key);
    setRestored(false);
  }

  return {
    restored,
    /** The form was sent: forget the draft. */
    clear: forget,
    /** Throw the restored input away and put those fields back as they started. */
    discard: () => {
      for (const name of fieldsRef.current) formApi.resetField(name);
      forget();
    },
  };
}
