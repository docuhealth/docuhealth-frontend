import type { RequestHandler } from "msw";

// Fake API endpoints for dev mode (VITE_ENABLE_MOCKS=true) and tests. Add one per endpoint
// with `http.get(\`${env.VITE_API_URL}/path\`, () => HttpResponse.json(...))`.
export const handlers: RequestHandler[] = [];
