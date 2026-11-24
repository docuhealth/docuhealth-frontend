import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DraftNotice } from "@/components/draft-notice";
import { useFormDraft } from "@/hooks/use-form-draft";
import { clearAllDrafts, draftKey, DRAFT_MAX_AGE_MS, readDraft } from "@/lib/form-drafts";

type Values = { name: string; nin: string };

/** A tiny form: `name` may be kept, `nin` must never be. */
function DraftForm({ onSent }: { onSent?: () => void }) {
  const form = useForm<Values>({ defaultValues: { name: "", nin: "" } });
  const draft = useFormDraft(form, { form: "test:patient", fields: ["name"] });
  return (
    <form
      onSubmit={form.handleSubmit(() => {
        draft.clear();
        onSent?.();
      })}
    >
      <DraftNotice restored={draft.restored} onDiscard={draft.discard} />
      <label>
        Name
        <input {...form.register("name")} />
      </label>
      <label>
        NIN
        <input {...form.register("nin")} />
      </label>
      <button type="submit">Send</button>
    </form>
  );
}

const key = draftKey("signed-out", "test:patient");

/** Typing is saved half a second after it stops. */
async function typeAndWait(label: string, text: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(label), text);
  await act(() => new Promise((resolve) => setTimeout(resolve, 600)));
}

afterEach(() => vi.useRealTimers());

describe("useFormDraft", () => {
  it("keeps only the listed fields, and puts them back after a refresh", async () => {
    const first = render(<DraftForm />);
    await typeAndWait("Name", "Ada Obi");
    await typeAndWait("NIN", "12345678901");
    expect(readDraft("local", key)).toEqual({ name: "Ada Obi" });

    first.unmount();
    render(<DraftForm />);
    expect(await screen.findByText("We restored what you’d typed before.")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Ada Obi");
    expect(screen.getByLabelText("NIN")).toHaveValue("");
  });

  it("forgets the draft once the form is sent, or when it's discarded", async () => {
    const user = userEvent.setup();
    const first = render(<DraftForm />);
    await typeAndWait("Name", "Ada Obi");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(readDraft("local", key)).toBeNull();
    first.unmount();

    const second = render(<DraftForm />);
    expect(screen.queryByText("We restored what you’d typed before.")).not.toBeInTheDocument();
    await typeAndWait("Name", "Bola");
    second.unmount();

    render(<DraftForm />);
    await user.click(await screen.findByRole("button", { name: "Discard" }));
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(readDraft("local", key)).toBeNull();
  });

  it("drops drafts older than a day, and every draft on log out", async () => {
    const first = render(<DraftForm />);
    await typeAndWait("Name", "Ada Obi");
    first.unmount();
    expect(readDraft("local", key, Date.now() + DRAFT_MAX_AGE_MS + 1)).toBeNull();

    render(<DraftForm />);
    await typeAndWait("Name", "Ada Obi");
    clearAllDrafts();
    expect(readDraft("local", key)).toBeNull();
  });
});
