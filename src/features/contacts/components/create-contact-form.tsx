import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type CreateContactFormValues,
  type CreateContactInput,
  createContactSchema,
  useCreateContact,
} from "@/features/contacts/api/contacts-api";
import { getErrorMessage } from "@/lib/api";

export function CreateContactForm() {
  const createContact = useCreateContact();
  const form = useForm<CreateContactFormValues, unknown, CreateContactInput>({
    resolver: zodResolver(createContactSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    createContact.mutate(values, {
      onSuccess: (contact) => {
        toast.success(`${contact.name} added`);
        form.reset();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    }),
  );

  return (
    <form noValidate onSubmit={onSubmit}>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="contact-name">Name</FieldLabel>
          <Input id="contact-name" aria-invalid={!!errors.name} {...form.register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="contact-email">Email</FieldLabel>
          <Input
            id="contact-email"
            type="email"
            aria-invalid={!!errors.email}
            {...form.register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="contact-phone">Phone (optional)</FieldLabel>
          <Input id="contact-phone" type="tel" {...form.register("phone")} />
        </Field>
        <Button type="submit" disabled={createContact.isPending}>
          {createContact.isPending ? "Adding…" : "Add contact"}
        </Button>
      </FieldGroup>
    </form>
  );
}
