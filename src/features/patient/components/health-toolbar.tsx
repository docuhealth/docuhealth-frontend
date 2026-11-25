import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import timelineIconUrl from "@/assets/svgs/timeline.svg";
import trendsIconUrl from "@/assets/svgs/trends.svg";
import { Button } from "@/components/ui/button";

/** The Health page's search over the record kinds, and its Trends and Timeline buttons. */
export function HealthToolbar({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (search: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border bg-card px-4">
        <MagnifyingGlassIcon className="size-4 text-fg-caption" />
        <span className="sr-only">Search your records</span>
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search your records"
          className="w-full bg-transparent type-body-sm-regular outline-none placeholder:text-fg-caption"
        />
      </label>
      <div className="grid grid-cols-2 gap-3 md:w-96">
        <Button variant="outline" className="h-11 bg-card text-fg-heading" asChild>
          <Link to="/patient/health/trends">
            <img src={trendsIconUrl} alt="" className="size-4.5" />
            Trends
          </Link>
        </Button>
        <Button variant="outline" className="h-11 bg-card text-fg-heading" asChild>
          <Link to="/patient/health/timeline">
            <img src={timelineIconUrl} alt="" className="size-4.5" />
            Timeline
          </Link>
        </Button>
      </div>
    </div>
  );
}
