import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { contactsQueryOptions } from "@/features/contacts/api/contacts-api";
import { ContactsTable } from "@/features/contacts/components/contacts-table";
import { CreateContactForm } from "@/features/contacts/components/create-contact-form";

export const Route = createFileRoute("/_app/contacts")({
  // Typed, validated URL state: /contacts?search=grace
  validateSearch: z.object({ search: z.string().optional().catch(undefined) }),
  loaderDeps: ({ search }) => ({ search: search.search ?? "" }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(contactsQueryOptions(deps.search)),
  component: ContactsPage,
});

function ContactsPage() {
  const search = Route.useSearch({ select: (s) => s.search ?? "" });
  const navigate = Route.useNavigate();
  const { data: contacts } = useSuspenseQuery(contactsQueryOptions(search));

  return (
    <section className="space-y-6">
      <title>Contacts</title>
      <h1 className="text-h1">Contacts</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search contacts"
                placeholder="Search by name"
                className="pl-8"
                defaultValue={search}
                onChange={(e) =>
                  void navigate({ search: { search: e.target.value || undefined }, replace: true })
                }
              />
            </div>
          </CardHeader>
          <CardContent>
            <ContactsTable contacts={contacts} />
          </CardContent>
        </Card>
        <Card className="self-start">
          <CardHeader>
            <CardTitle>New contact</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateContactForm />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
