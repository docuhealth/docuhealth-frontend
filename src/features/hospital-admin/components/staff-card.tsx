import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { staffListQuery } from "@/features/hospital-admin/api/queries";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { SearchField } from "@/components/dashboard/search-field";
import { StaffDirectory } from "@/features/hospital-admin/components/staff-directory";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/** The dashboard's staff section: the hospital's staff, searchable by name or email. */
export function StaffCard() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const term = useDebouncedValue(search.trim());
  // Shares StaffDirectory's query, for the count in the title.
  const { data } = useQuery(staffListQuery(term, page));

  return (
    <DashboardCard
      title={
        <>
          Staff{" "}
          {data && (
            <span className="ml-1 type-body-sm-regular text-fg-caption">
              {data.total} {data.total === 1 ? "person" : "people"}
            </span>
          )}
        </>
      }
      action={
        <SearchField
          label="Search staff"
          placeholder="Search names..."
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
      }
    >
      <StaffDirectory search={term} page={page} onPageChange={setPage} />
    </DashboardCard>
  );
}
