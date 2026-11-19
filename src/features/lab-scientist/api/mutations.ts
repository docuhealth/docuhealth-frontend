import { useMutation, useQueryClient } from "@tanstack/react-query";
import { labKeys } from "@/features/lab-scientist/api/queries";
import {
  type TestOrder,
  testAppointmentSchema,
  testOrderSchema,
} from "@/features/lab-scientist/api/schemas";
import type {
  BookTestValues,
  RejectOrderValues,
  SampleCollectionValues,
  UploadResultValues,
} from "@/features/lab-scientist/lib/schemas";
import { request } from "@/lib/api";

const orderUrl = (id: string) => `/hospital/lab/test-orders/${encodeURIComponent(id)}`;

/** Show the order as it now stands, and refresh the lists and counts it moved between. */
function useOrderUpdated(orderId: string) {
  const queryClient = useQueryClient();
  return (order: TestOrder) => {
    queryClient.setQueryData(labKeys.testOrder(orderId), order);
    return queryClient.invalidateQueries({ queryKey: labKeys.all });
  };
}

/** Accept a pending order: it moves to in progress, its sample still to be logged. */
export function useAcceptTestOrder(orderId: string) {
  return useMutation({
    mutationFn: () =>
      request(testOrderSchema, { method: "POST", url: `${orderUrl(orderId)}/accept` }),
    onSuccess: useOrderUpdated(orderId),
  });
}

/** Turn a pending order down, telling the requesting doctor why. */
export function useRejectTestOrder(orderId: string) {
  return useMutation({
    mutationFn: (values: RejectOrderValues) =>
      request(testOrderSchema, {
        method: "POST",
        url: `${orderUrl(orderId)}/reject`,
        data: values,
      }),
    onSuccess: useOrderUpdated(orderId),
  });
}

/** Log (or correct) when an accepted order's sample was taken. */
export function useLogSampleCollection(orderId: string) {
  return useMutation({
    mutationFn: ({ date, time }: SampleCollectionValues) =>
      request(testOrderSchema, {
        method: "PUT",
        url: `${orderUrl(orderId)}/sample-collection`,
        data: { collectedAt: new Date(`${date}T${time}`).toISOString() },
      }),
    onSuccess: useOrderUpdated(orderId),
  });
}

/** Upload the order's results, completing it; the doctor and patient can then see them. */
export function useUploadTestResult(order: TestOrder) {
  return useMutation({
    mutationFn: ({ values, interpretation, clinicalCorrelation, date, time }: UploadResultValues) =>
      request(testOrderSchema, {
        method: "POST",
        url: `${orderUrl(order.id)}/result`,
        data: {
          values: order.tests.map((test, index) => ({
            loinc: test.loinc,
            value: Number(values[index]),
          })),
          interpretation,
          clinicalCorrelation,
          collectedAt: new Date(`${date}T${time}`).toISOString(),
        },
      }),
    onSuccess: useOrderUpdated(order.id),
  });
}

/**
 * Book a patient in for a test. Refreshes every lab query, since it adds to the upcoming
 * appointments and the overview's numbers.
 */
export function useBookTestAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      values: { date, time, note },
    }: {
      patientId: string;
      values: BookTestValues;
    }) =>
      request(testAppointmentSchema, {
        method: "POST",
        url: "/hospital/lab/appointments",
        data: { patientId, at: new Date(`${date}T${time}`).toISOString(), note },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: labKeys.all }),
  });
}
