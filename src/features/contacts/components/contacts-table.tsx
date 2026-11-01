import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Contact } from "@/features/contacts/api/contacts-api";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, datetime: sortFn_datetime, text: sortFn_text },
});

const column = createColumnHelper<typeof features, Contact>();

const columns = column.columns([
  column.accessor("name", { header: "Name", sortFn: "text" }),
  column.accessor("email", { header: "Email", sortFn: "text" }),
  column.accessor("phone", {
    header: "Phone",
    enableSorting: false,
    cell: (c) => c.getValue() ?? "—",
  }),
  column.accessor((row) => new Date(row.createdAt), {
    id: "createdAt",
    header: "Added",
    sortFn: "datetime",
    cell: (c) => format(c.getValue(), "d MMM yyyy"),
  }),
]);

type Props = { contacts: Contact[] };

export function ContactsTable({ contacts }: Props) {
  const table = useTable({ features, columns, data: contacts });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => {
              const sorted = header.column.getIsSorted();
              return (
                <TableHead key={header.id} aria-sort={sorted ? `${sorted}ending` : undefined}>
                  {header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <table.FlexRender header={header} />
                      {sorted === "asc" && <CaretUpIcon aria-hidden />}
                      {sorted === "desc" && <CaretDownIcon aria-hidden />}
                    </button>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
              No contacts yet.
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
