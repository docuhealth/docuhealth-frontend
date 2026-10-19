import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is considered fresh for 30 seconds for optimal UI responsiveness
            staleTime: 30 * 1000,
            
            // Retry failed requests once before throwing an error
            retry: 1,
            
            // Automatically refetch stale queries when returning to the browser tab
            refetchOnWindowFocus: true,
        },
    },
});
