import React from "react";
import { ChevronLeft } from "lucide-react";
import Pagination2 from "../../Pagination/Pagination2";
import { PaginatedResponse, VitalSignsInfo } from "../../../../../types/patients/shared";
import EmptyState from "../../../../../Components/ui/EmptyState";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../../Components/ui/Table";

interface RecentVitalSignsProps {
  vitalSigns?: PaginatedResponse<VitalSignsInfo>;
  setViewRecentVitals: (value: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const RecentVitalSigns = ({ vitalSigns, setViewRecentVitals, currentPage, setCurrentPage }: RecentVitalSignsProps) => {
  const vitals = vitalSigns?.results || [];
  const count = vitalSigns?.count || 0;
  const pageSize = 7;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="bg-white my-5 border rounded-lg pt-5 lg:pt-8 px-4 lg:px-6 text-sm">
      <div
        className="flex justify-start items-center gap-1 cursor-pointer border-b pb-3"
        onClick={() => setViewRecentVitals(false)}
      >
        <ChevronLeft size={18} className="text-docuhealth-dark" />
        <h2 className="text-sm font-medium">Recent Vital Signs</h2>
      </div>

      <div className="my-5">
        {vitals.length === 0 ? (
          <EmptyState
            icon="calendar"
            className="py-10"
            title="No Vital Signs Records!"
            description="You currently don’t have any recorded vital signs. Once your vitals are updated by a healthcare provider, they will appear here!"
          />
        ) : (
          <>
            <div className="overflow-x-auto hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 text-gray-600">
                    <TableHead className="py-3 px-4 font-medium border-r last:border-r-0">Date & Time</TableHead>
                    <TableHead className="py-3 px-4 font-medium text-center border-r last:border-r-0">BP (mmHg)</TableHead>
                    <TableHead className="py-3 px-4 font-medium text-center border-r last:border-r-0">Temp (°C)</TableHead>
                    <TableHead className="py-3 px-4 font-medium text-center border-r last:border-r-0">HR (Bpm)</TableHead>
                    <TableHead className="py-3 px-4 font-medium text-center border-r last:border-r-0">RR (/Min)</TableHead>
                    <TableHead className="py-3 px-4 font-medium text-center border-r last:border-r-0">Height (m)</TableHead>
                    <TableHead className="py-3 px-4 font-medium text-center">Weight (Kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vitals.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="py-3 px-4 border-r last:border-r-0">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {new Date(record.created_at || 0).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {new Date(record.created_at || 0).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center border-r last:border-r-0">{record.blood_pressure || "—"}</TableCell>
                      <TableCell className="py-3 px-4 text-center border-r last:border-r-0">{record.temp || "—"}</TableCell>
                      <TableCell className="py-3 px-4 text-center border-r last:border-r-0">{record.heart_rate || "—"}</TableCell>
                      <TableCell className="py-3 px-4 text-center border-r last:border-r-0">{record.resp_rate || "—"}</TableCell>
                      <TableCell className="py-3 px-4 text-center border-r last:border-r-0">{record.height || "—"}</TableCell>
                      <TableCell className="py-3 px-4 text-center">{record.weight || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="lg:hidden flex flex-col gap-4">
              {vitals.map((record, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden ">
                  <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      {new Date(record.created_at || 0).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                      {new Date(record.created_at || 0).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">BP (mmHg)</span>
                      <span className="text-gray-700 font-medium">{record.blood_pressure || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Temp (°C)</span>
                      <span className="text-gray-700 font-medium">{record.temp || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">HR (Bpm)</span>
                      <span className="text-gray-700 font-medium">{record.heart_rate || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">RR (/Min)</span>
                      <span className="text-gray-700 font-medium">{record.resp_rate || "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Weight</span>
                      <span className="text-gray-700 font-medium">{record.weight ? `${record.weight} Kg` : "—"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Height</span>
                      <span className="text-gray-700 font-medium">{record.height ? `${record.height} m` : "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Pagination2
                count={count}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecentVitalSigns;