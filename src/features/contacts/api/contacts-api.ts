import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/api";

const contactSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
  createdAt: z.iso.datetime(),
});
export type Contact = z.infer<typeof contactSchema>;

export const createContactSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters"),
  email: z.email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .transform((v) => v || null),
});
export type CreateContactFormValues = z.input<typeof createContactSchema>;
export type CreateContactInput = z.output<typeof createContactSchema>;

// One key factory per feature keeps invalidation predictable.
const contactKeys = {
  all: ["contacts"] as const,
  list: (search: string) => [...contactKeys.all, "list", { search }] as const,
};

export function contactsQueryOptions(search = "") {
  return queryOptions({
    queryKey: contactKeys.list(search),
    queryFn: () =>
      request(z.object({ items: z.array(contactSchema) }), {
        url: "/contacts",
        params: search ? { search } : undefined,
      }).then((r) => r.items),
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContactInput) =>
      request(contactSchema, {
        method: "POST",
        url: "/contacts",
        data: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
}
