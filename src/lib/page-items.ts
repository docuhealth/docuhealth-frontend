/**
 * The page buttons to show for `page` of `pageCount`: every page when there are few, otherwise
 * the first, the last and the current one's neighbours, with "gap" where pages are skipped.
 */
export function pageItems(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const start = Math.max(2, Math.min(page - 1, pageCount - 4));
  const end = Math.min(pageCount - 1, Math.max(page + 1, 5));
  const middle = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return [
    1,
    ...(start > 2 ? (["gap"] as const) : []),
    ...middle,
    ...(end < pageCount - 1 ? (["gap"] as const) : []),
    pageCount,
  ];
}
