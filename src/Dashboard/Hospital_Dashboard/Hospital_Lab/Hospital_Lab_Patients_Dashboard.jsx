import { useState } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { Search } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../Components/ui/Table";

const allPatients = [
  { id: "PAT-1021", name: "Amara Okafor", tests: 3, lastVisit: "2026-05-30", status: "Active" },
  { id: "PAT-1034", name: "Emeka Nwosu", tests: 1, lastVisit: "2026-05-30", status: "Active" },
  { id: "PAT-1047", name: "Fatima Bello", tests: 2, lastVisit: "2026-05-29", status: "Active" },
  { id: "PAT-1055", name: "Chidi Eze", tests: 1, lastVisit: "2026-05-29", status: "Discharged" },
  { id: "PAT-1062", name: "Ngozi Adeyemi", tests: 1, lastVisit: "2026-05-28", status: "Active" },
  { id: "PAT-1078", name: "Yusuf Lawal", tests: 1, lastVisit: "2026-05-28", status: "Active" },
  { id: "PAT-1083", name: "Blessing Obi", tests: 2, lastVisit: "2026-05-27", status: "Discharged" },
  { id: "PAT-1091", name: "Kelechi Nnadi", tests: 1, lastVisit: "2026-05-27", status: "Active" },
  { id: "PAT-1104", name: "Halima Usman", tests: 1, lastVisit: "2026-05-26", status: "Discharged" },
  { id: "PAT-1116", name: "Tunde Afolabi", tests: 1, lastVisit: "2026-05-26", status: "Discharged" },
];

const statusColors = {
  Active: "bg-green-100 text-green-700",
  Discharged: "bg-gray-100 text-gray-500",
};

const Hospital_Lab_Patients_Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = allPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-md p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-docuhealth-dark">Patients</h3>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} patient{filtered.length !== 1 ? "s" : ""} found</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search patient or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs text-gray-600 bg-transparent outline-none w-40"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-[12px] text-gray-400">
                <TableHead className="pb-3 pr-4 font-semibold">Name</TableHead>
                <TableHead className="pb-3 pr-4 font-semibold">Patient ID</TableHead>
                <TableHead className="pb-3 pr-4 font-semibold">Tests Requested</TableHead>
                <TableHead className="pb-3 pr-4 font-semibold">Last Visit</TableHead>
                <TableHead className="pb-3 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="py-3 pr-4 font-medium text-docuhealth-dark">{p.name}</TableCell>
                  <TableCell className="py-3 pr-4 text-gray-400 font-mono">{p.id}</TableCell>
                  <TableCell className="py-3 pr-4 text-gray-500">{p.tests} test{p.tests !== 1 ? "s" : ""}</TableCell>
                  <TableCell className="py-3 pr-4 text-gray-400">{p.lastVisit}</TableCell>
                  <TableCell className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[p.status]}`}>
                      {p.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default Hospital_Lab_Patients_Dashboard;
