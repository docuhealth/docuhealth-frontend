import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Retrying a 4xx won't change the answer.
        retry: (failureCount, error) =>
          failureCount < 2 && !(isAxiosError(error) && (error.response?.status ?? 0) < 500),
      },
    },
  });
}
