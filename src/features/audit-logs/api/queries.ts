import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { request } from "@/lib/api";
import {
  type AuditLogList,
  auditLogPageSchema,
  type AuditType,
} from "@/features/audit-logs/api/schemas";

const auditLogKeys = {
  all: ["audit-logs"] as const,
  list: (type: AuditType, page: number) => [...auditLogKeys.all, type, page] as const,
};

export const AUDIT_LOGS_PAGE_SIZE = 10;

/**
 * A page of one kind of download log, newest first. TODO(api): there's no search or date filter
 * on the logs yet.
 */
export const auditLogListQuery = (type: AuditType, page: number) =>
  queryOptions({
    queryKey: auditLogKeys.list(type, page),
    queryFn: async (): Promise<AuditLogList> => {
      const { count, results } = await request(auditLogPageSchema, {
        url: "/api/audits/audit-logs",
        params: { type, page, size: AUDIT_LOGS_PAGE_SIZE },
      });
      return { total: count, items: results };
    },
    placeholderData: keepPreviousData,
    // A refusal (403) won't change by asking again.
    retry: false,
  });
