/**
 * A query's `placeholderData` that keeps the last page on screen while the next one loads, but
 * only within the same list: switching to another (another kind of note, another chart) shows
 * loading instead of the last list's rows under the new heading. `queryKey` must end with the
 * page.
 */
export function keepPreviousPage(queryKey: readonly unknown[]) {
  return <T>(previous: T | undefined, previousQuery?: { queryKey: readonly unknown[] }) => {
    const before = previousQuery?.queryKey;
    const sameList =
      before?.length === queryKey.length &&
      queryKey.slice(0, -1).every((part, index) => part === before[index]);
    return sameList ? previous : undefined;
  };
}
