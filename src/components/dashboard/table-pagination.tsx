import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { pageItems } from "@/lib/page-items";
import { cn } from "@/lib/utils";

/** "Showing 1 to 10 of 20 entries" and round previous / page / next buttons under a table. */
export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    // Stacked and centred on narrow cards; text left, buttons right once they fit side by side.
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center gap-3 px-4 pt-4 @md:flex-row @md:justify-between"
    >
      <p className="type-caption text-fg-caption">
        Showing {first} to {last} of {total} entries
      </p>
      <div className="flex items-center gap-2">
        <PageButton
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="bg-primary/10 text-primary hover:bg-primary/15"
        >
          <CaretLeftIcon className="size-4" />
        </PageButton>
        {pageItems(page, pageCount).map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} aria-hidden className="type-body text-fg-caption">
              …
            </span>
          ) : (
            <PageButton
              key={item}
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={
                item === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-line text-fg-caption hover:text-fg-heading"
              }
            >
              {item}
            </PageButton>
          ),
        )}
        <PageButton
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="bg-primary/10 text-primary hover:bg-primary/15"
        >
          <CaretRightIcon className="size-4" />
        </PageButton>
      </div>
    </nav>
  );
}

function PageButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "grid size-8 place-content-center rounded-full type-body transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-line disabled:text-fg-caption",
        className,
      )}
      {...props}
    />
  );
}
