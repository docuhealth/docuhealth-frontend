import { useMutation, useQueryClient } from "@tanstack/react-query";
import { labKeys, labProfileQuery } from "@/features/lab-scientist/api/queries";
import { anyResponseSchema, type TestOrder } from "@/features/lab-scientist/api/schemas";
import type {
  BookTestValues,
  RejectOrderValues,
  SampleCollectionValues,
  UploadResultValues,
} from "@/features/lab-scientist/lib/schemas";
import { request } from "@/lib/api";

// The API acts on each test of an order (its items), so every order-level action here sends one
// request per test it applies to. TODO(api): order-level actions would save the round trips.

const itemUrl = (order: TestOrder, itemId: string) =>
  `/api/lab/test-orders/${encodeURIComponent(order.id)}/items/${encodeURIComponent(itemId)}`;

/** The order's tests that are at `status` (all of them when it's left out), rejected ones aside. */
const itemsAt = (order: TestOrder, status?: string) =>
  order.items.filter((item) => (status ? item.status === status : item.status !== "rejected"));

/** Refetch the order and the lists and counts it may have moved between. */
function useOrderChanged(orderId: string) {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: labKeys.testOrder(orderId) });
    return queryClient.invalidateQueries({ queryKey: labKeys.all });
  };
}

/** Accept a pending order: each of its pending tests moves on, its sample still to be logged. */
export function useAcceptTestOrder(order: TestOrder) {
  return useMutation({
    mutationFn: () =>
      Promise.all(
        itemsAt(order, "pending").map((item) =>
          request(anyResponseSchema, { method: "PATCH", url: `${itemUrl(order, item.id)}/accept` }),
        ),
      ),
    onSuccess: useOrderChanged(order.id),
  });
}

/** Turn a pending order down, telling the requesting doctor why. */
export function useRejectTestOrder(order: TestOrder) {
  return useMutation({
    mutationFn: ({ reason }: RejectOrderValues) =>
      Promise.all(
        itemsAt(order, "pending").map((item) =>
          request(anyResponseSchema, {
            method: "PATCH",
            url: `${itemUrl(order, item.id)}/reject`,
            data: { rejection_reason: reason },
          }),
        ),
      ),
    onSuccess: useOrderChanged(order.id),
  });
}

function logCollection(order: TestOrder, collectedAt: string) {
  return Promise.all(
    itemsAt(order).map((item) =>
      request(anyResponseSchema, {
        method: "PATCH",
        url: `${itemUrl(order, item.id)}/specimen-collection-time`,
        data: { specimen_collected_at: collectedAt },
      }),
    ),
  );
}

/** Log (or correct) when the order's sample was taken, for each of its tests. */
export function useLogSampleCollection(order: TestOrder) {
  return useMutation({
    mutationFn: ({ date, time }: SampleCollectionValues) =>
      logCollection(order, new Date(`${date}T${time}`).toISOString()),
    onSuccess: useOrderChanged(order.id),
  });
}

/**
 * Upload the order's results: the collection time, then each test's values (sent against its
 * parameters, as text) with the interpretation and clinical correlation. Each result then waits
 * for the lab admin's approval before the doctor sees it.
 */
export function useUploadTestResult(order: TestOrder) {
  return useMutation({
    mutationFn: async ({
      values,
      interpretation,
      clinicalCorrelation,
      date,
      time,
    }: UploadResultValues) => {
      await logCollection(order, new Date(`${date}T${time}`).toISOString());
      const byItem = new Map<string, { parameter: string; value: string }[]>();
      order.tests.forEach((test, index) => {
        const entries = byItem.get(test.itemId) ?? [];
        entries.push({ parameter: test.id, value: String(values[index] ?? "").trim() });
        byItem.set(test.itemId, entries);
      });
      return Promise.all(
        [...byItem].map(([itemId, parameters]) =>
          request(anyResponseSchema, {
            method: "POST",
            url: `${itemUrl(order, itemId)}/result/submit`,
            data: {
              item: itemId,
              parameters,
              interpretation,
              clinical_correlation: clinicalCorrelation,
            },
          }),
        ),
      );
    },
    onSuccess: useOrderChanged(order.id),
  });
}

/**
 * Book a patient in for a test with the signed-in lab scientist. Refreshes every lab query,
 * since it adds to the upcoming appointments.
 */
export function useBookTestAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      patientId,
      values: { date, time, note },
    }: {
      /** The patient's HIN. */
      patientId: string;
      values: BookTestValues;
    }) => {
      const profile = await queryClient.ensureQueryData(labProfileQuery());
      return request(anyResponseSchema, {
        method: "POST",
        url: "/api/hospital-ops/appointments/book",
        data: {
          patient: patientId,
          staff: profile.user.id,
          type: "lab_test",
          note: note || null,
          scheduled_time: new Date(`${date}T${time}`).toISOString(),
        },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: labKeys.all }),
  });
}
