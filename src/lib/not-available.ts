/**
 * An action or filter the design has but the API can't do yet. Its message says so, for the
 * screen to show. TODO(api): see docs/backend-gaps-v2-migration.md.
 */
export class NotAvailableYetError extends Error {
  constructor(what: string) {
    super(`${what} isn’t available yet. It’s waiting on the backend.`);
    this.name = "NotAvailableYetError";
  }
}
