import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { MessagesPage } from "@/features/patient/components/messages-page";

export const Route = createFileRoute("/patient/messages")({
  // The open chat's id.
  validateSearch: z.object({ chat: z.string().optional().catch(undefined) }),
  component: Page,
});

function Page() {
  const { chat } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <MessagesPage
      chatId={chat ?? null}
      onChat={(next) => void navigate({ search: next ? { chat: next } : {} })}
    />
  );
}
