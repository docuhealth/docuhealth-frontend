import { PaperclipIcon, PaperPlaneRightIcon, SmileyIcon } from "@phosphor-icons/react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useSendMessage } from "@/features/patient/api/pending-messages";
import { notYet } from "@/features/patient/lib/not-yet";
import { getErrorMessage } from "@/lib/api";

/** "Write a message…" with attach and emoji buttons and a send button. */
export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [text, setText] = useState("");
  const send = useSendMessage(conversationId);

  function submit(event: FormEvent) {
    event.preventDefault();
    const message = text.trim();
    if (!message || send.isPending) return;
    send.mutate(message, {
      onSuccess: () => setText(""),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 border-t bg-card px-3 py-3 sm:px-4">
      {/* TODO(api): no attachments in chats yet. */}
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="text-fg-caption"
        onClick={notYet("Attachments")}
      >
        <PaperclipIcon className="size-5" />
        <span className="sr-only">Attach a file</span>
      </Button>
      <InputGroup className="h-11 flex-1 rounded-md bg-background">
        <InputGroupInput
          aria-label="Message"
          placeholder="Write a message…"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="type-body-sm-regular"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-sm" onClick={notYet("Emoji")}>
            <SmileyIcon className="size-5" />
            <span className="sr-only">Add an emoji</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <Button type="submit" size="icon-lg" className="size-11" aria-busy={send.isPending}>
        <PaperPlaneRightIcon weight="fill" className="size-5" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
