import { Plus, X } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../ui/Table";

const ResultTableEditor = ({
  tables,
  addTable,
  removeTable,
  updateTableTitle,
  addRow,
  removeRow,
  updateRow,
}) => (
  <div className="flex flex-col gap-4">
    {tables.map((table) => (
      <div key={table.id} className="border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Table title (e.g. Typhoid Fever Widal Test)"
            value={table.title}
            onChange={(e) => updateTableTitle(table.id, e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-docuhealth-primary transition-colors"
          />
          <button
            onClick={() => removeTable(table.id)}
            className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[480px]">
            <TableHeader>
              <TableRow className="text-[12px] text-gray-400">
                <TableHead className="pb-2 pr-3 font-semibold text-left min-w-[120px]">Test</TableHead>
                <TableHead className="pb-2 pr-3 font-semibold text-left min-w-[100px]">Result</TableHead>
                <TableHead className="pb-2 pr-3 font-semibold text-left min-w-[120px]">Reference range</TableHead>
                <TableHead className="pb-2 pr-3 font-semibold text-left min-w-[100px]">Status</TableHead>
                <TableHead className="pb-2 font-semibold w-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="py-2 pr-3">
                    <input
                      type="text"
                      placeholder="Test name"
                      value={row.test}
                      onChange={(e) => updateRow(table.id, row.id, "test", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-docuhealth-primary"
                    />
                  </TableCell>
                  <TableCell className="py-2 pr-3">
                    <input
                      type="text"
                      placeholder="e.g. 1:80"
                      value={row.result}
                      onChange={(e) => updateRow(table.id, row.id, "result", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-docuhealth-primary"
                    />
                  </TableCell>
                  <TableCell className="py-2 pr-3">
                    <input
                      type="text"
                      placeholder="e.g. <1:160"
                      value={row.reference}
                      onChange={(e) => updateRow(table.id, row.id, "reference", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-docuhealth-primary"
                    />
                  </TableCell>
                  <TableCell className="py-2 pr-3">
                    <select
                      value={row.status}
                      onChange={(e) => updateRow(table.id, row.id, "status", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-docuhealth-primary bg-white"
                    >
                      <option>Negative</option>
                      <option>Positive</option>
                      <option>Normal</option>
                      <option>Abnormal</option>
                    </select>
                  </TableCell>
                  <TableCell className="py-2">
                    <button
                      onClick={() => removeRow(table.id, row.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <button
          onClick={() => addRow(table.id)}
          className="self-start text-xs text-docuhealth-primary hover:underline flex items-center gap-1"
        >
          <Plus size={12} /> Add row
        </button>
      </div>
    ))}

    <button
      onClick={addTable}
      className="flex items-center gap-1 text-sm text-docuhealth-primary hover:underline w-fit"
    >
      <Plus size={14} /> Add new test result table
    </button>
  </div>
);

export default ResultTableEditor;
