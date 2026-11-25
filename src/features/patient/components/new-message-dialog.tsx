import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  FormDialog,
  FormDialogBody,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/dashboard/form-dialog";
import { RequiredMark } from "@/components/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appointmentsQuery } from "@/features/patient/api/queries";
import {
  messagePersonnelQuery,
  personnelTypes,
  useStartChat,
} from "@/features/patient/api/pending-messages";
import { NewMessageTypeChips } from "@/features/patient/components/new-message-type-chips";
import { personnelFor } from "@/features/patient/lib/messages";
import { facilitiesOf } from "@/features/patient/lib/records";
import { useVisits } from "@/features/patient/lib/use-visits";
import { getErrorMessage } from "@/lib/api";

const newMessageSchema = z.object({
  facility: z.string({ error: "Choose a facility" }).min(1, "Choose a facility"),
  type: z.enum(personnelTypes),
  personnelId: z.string({ error: "Choose who to chat with" }).min(1, "Choose who to chat with"),
});
type NewMessageValues = z.input<typeof newMessageSchema>;

const blank: NewMessageValues = { facility: "", type: "doctor", personnelId: "" };

/**
 * "New message": pick a facility, the kind of personnel and the person, then Start Chat opens
 * the chat (`onStarted` with its id). TODO(api): who can be messaged comes from
 * `pending-messages.ts`.
 */
export function NewMessageDialog({
  open,
  onOpenChange,
  onStarted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStarted: (chatId: string) => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      {/* Remounts on each open, so it starts fresh. */}
      {open && (
        <NewMessageForm
          onStarted={(id) => {
            onOpenChange(false);
            onStarted(id);
          }}
        />
      )}
    </FormDialog>
  );
}

function NewMessageForm({ onStarted }: { onStarted: (chatId: string) => void }) {
  const { data: visits = [] } = useVisits();
  const { data: appointments = [] } = useQuery(appointmentsQuery());
  const { data: personnel = [] } = useQuery(messagePersonnelQuery());
  const start = useStartChat();
  const form = useForm<NewMessageValues>({
    resolver: zodResolver(newMessageSchema),
    defaultValues: blank,
  });
  const [facility, type] = useWatch({ control: form.control, name: ["facility", "type"] });
  const facilities = [
    ...new Set([...facilitiesOf(visits, appointments), ...personnel.map((p) => p.facility)]),
  ];
  const people = personnelFor(personnel, facility || null, type);

  const submit = form.handleSubmit(({ personnelId }) =>
    start.mutate(personnelId, {
      onSuccess: (chat) => onStarted(chat.id),
      onError: (error) => toast.error(getErrorMessage(error)),
    }),
  );

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-col">
      <FormDialogHeader title="New message" description="Who would you like to message?" />
      <FormDialogBody>
        <Controller
          name="facility"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="newMessageFacility" className="gap-1">
                What facility? <RequiredMark />
              </FieldLabel>
              <Select
                name={field.name}
                items={Object.fromEntries(facilities.map((name) => [name, name]))}
                value={field.value || null}
                onValueChange={(value) => {
                  field.onChange(value ?? "");
                  form.setValue("personnelId", "");
                }}
                required
              >
                <SelectTrigger
                  id="newMessageFacility"
                  aria-invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                  className="w-full bg-card"
                >
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <FieldSet>
              <FieldLegend variant="label" className="flex gap-1">
                Medical personnel type <RequiredMark />
              </FieldLegend>
              <NewMessageTypeChips
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  form.setValue("personnelId", "");
                }}
              />
            </FieldSet>
          )}
        />

        <Controller
          name="personnelId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="newMessagePerson" className="gap-1">
                Who do you want to chat with? <RequiredMark />
              </FieldLabel>
              <Select
                name={field.name}
                items={Object.fromEntries(people.map((person) => [person.id, person.name]))}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                required
              >
                <SelectTrigger
                  id="newMessagePerson"
                  aria-invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                  className="w-full bg-card"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {facility && people.length === 0 && (
                <p className="type-caption text-fg-caption">No one to message here yet.</p>
              )}
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FormDialogBody>
      <FormDialogFooter onBack={() => form.reset(blank)} backLabel="Reset">
        <Button
          type="submit"
          className="h-11 px-5 type-body-sm-medium"
          disabled={start.isPending}
          aria-busy={start.isPending}
        >
          Start Chat
        </Button>
      </FormDialogFooter>
    </form>
  );
}
