import React, { useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { Activity, ChevronLeft, ChevronRight, FileText, User, Calendar, Clock } from "lucide-react";
import { NursesVitalSignsContext } from "../../../../../context/HospitalContext/Nurses/NursesVitalSignsContext";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";
import SearchBar from "../../../../SearchBar/SearchBar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../../../Components/ui/Table";

const getPainBadgeClass = (score) => {
    const num = parseInt(score, 10);
    if (isNaN(num)) return "bg-slate-100 text-slate-700 border-slate-200";
    if (num === 0) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (num <= 3) return "bg-blue-50 text-blue-700 border-blue-200";
    if (num <= 6) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
};

const VitalSignsHistory = ({ selected, setVitalSignsHistory }) => {
    const hin = (selected?.patient_info?.hin || selected?.patient?.hin);
    const {
        vitals,
        count,
        currentPage,
        setCurrentPage,
        totalPages,
        loading,
        isRefreshing,
        setPatientHin,
        searchQuery,
        setSearchQuery,
    } = useContext(NursesVitalSignsContext);

    useEffect(() => {
        if (hin) {
            setPatientHin(hin);
        }
        return () => {
            setPatientHin(null);
            setCurrentPage(1);
        };
    }, [hin, setPatientHin, setCurrentPage]);

    return (
        <div className="bg-white my-5 border border-slate-200 rounded-xl pt-5 lg:pt-8 px-4 lg:px-6 text-sm shadow-xs">
            <div
                className="flex justify-start items-center gap-2 cursor-pointer border-b border-slate-200 pb-4 text-slate-700 hover:text-docuhealth-primary transition-colors"
                onClick={() => setVitalSignsHistory(false)}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
                        fill="currentColor"
                    />
                </svg>
                <h2 className="text-base font-semibold text-slate-800">Vital Signs History</h2>
            </div>

            <div className="my-5">
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search vitals by date, notes, or nurse..."
                />
                {isRefreshing && (
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 w-full">
                        <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-docuhealth-primary rounded-full animate-spin"></span>
                        Searching records...
                    </p>
                )}
            </div>

            <div className="my-5">
                {loading ? (
                    <div className="flex flex-col justify-center items-center gap-3 py-16 text-slate-500">
                        <span className="inline-block w-6 h-6 border-2 border-slate-200 border-t-docuhealth-primary rounded-full animate-spin"></span>
                        <p className="text-sm font-medium">Loading patient's vitals history...</p>
                    </div>
                ) : vitals?.length === 0 ? (
                    <div className="flex flex-col justify-center items-center text-center py-16">
                        <svg
                            width="140"
                            height="140"
                            viewBox="0 0 366 366"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="opacity-75 mb-4"
                        >
                            <circle cx="183" cy="171" r="132" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
                            <path
                                d="M164.25 114.75V102.25H151.75V114.75H126.75C123.298 114.75 120.5 117.548 120.5 121V221C120.5 224.452 123.298 227.25 126.75 227.25H239.25C242.702 227.25 245.5 224.452 245.5 221V121C245.5 117.548 242.702 114.75 239.25 114.75H214.25V102.25H201.75V114.75H164.25ZM133 158.5H233V214.75H133V158.5ZM133 127.25H151.75V133.5H164.25V127.25H201.75V133.5H214.25V127.25H233V146H133V127.25ZM169.741 164.528L183 177.786L196.257 164.528L205.097 173.366L191.839 186.626L205.096 199.883L196.258 208.721L183 195.464L169.741 208.721L160.903 199.882L174.161 186.626L160.902 173.366L169.741 164.528Z"
                                fill="#94A3B8"
                            />
                        </svg>
                        <h2 className="font-semibold text-slate-800 text-base pb-1">No Vital Signs Records</h2>
                        <div className="max-w-sm text-center">
                            <p className="text-xs text-slate-500 leading-relaxed">
                                This patient does not have any recorded vital signs yet.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="overflow-x-auto hidden lg:block rounded-xl border border-slate-200">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/90 text-slate-700 border-b border-slate-200">
                                        <TableHead className="py-3.5 px-4 font-semibold text-xs tracking-wider uppercase border-r border-slate-200 last:border-r-0">Recorded Date & Time</TableHead>
                                        <TableHead className="py-3.5 px-4 font-semibold text-xs tracking-wider uppercase text-center border-r border-slate-200 last:border-r-0">Blood Pressure</TableHead>
                                        <TableHead className="py-3.5 px-4 font-semibold text-xs tracking-wider uppercase text-center border-r border-slate-200 last:border-r-0">Temperature</TableHead>
                                        <TableHead className="py-3.5 px-4 font-semibold text-xs tracking-wider uppercase text-center border-r border-slate-200 last:border-r-0">Heart Rate</TableHead>
                                        <TableHead className="py-3.5 px-4 font-semibold text-xs tracking-wider uppercase text-center border-r border-slate-200 last:border-r-0">Resp Rate</TableHead>
                                        <TableHead className="py-3.5 px-4 font-semibold text-xs tracking-wider uppercase text-center border-r border-slate-200 last:border-r-0">Height</TableHead>
                                        <TableHead className="py-3.5 px-4 font-semibold text-xs tracking-wider uppercase text-center border-r border-slate-200 last:border-r-0">Weight</TableHead>
                                        <TableHead className="py-3.5 px-4 font-semibold text-xs tracking-wider uppercase text-center">BMI</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vitals?.map((record, index) => (
                                        <React.Fragment key={record.id || record.sqid || index}>
                                            {/* Main Measurements Row */}
                                            <TableRow className="border-t-2 border-slate-200/90 bg-white hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="py-3.5 px-4 border-r border-slate-100">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-semibold text-slate-800 text-xs">
                                                            {new Date(record.created_at).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            })}
                                                        </span>
                                                        <span className="text-[11px] text-slate-500 font-medium">
                                                            {new Date(record.created_at).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-center border-r border-slate-100">
                                                    <span className="font-semibold text-slate-800">{record.blood_pressure || "—"}</span>
                                                    {record.blood_pressure && <span className="text-[10px] text-slate-400 block font-normal">mmHg</span>}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-center border-r border-slate-100">
                                                    <span className="font-semibold text-slate-800">{record.temp ? `${record.temp}` : "—"}</span>
                                                    {record.temp && <span className="text-[10px] text-slate-400 block font-normal">°C</span>}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-center border-r border-slate-100">
                                                    <span className="font-semibold text-slate-800">{record.heart_rate ? `${record.heart_rate}` : "—"}</span>
                                                    {record.heart_rate && <span className="text-[10px] text-slate-400 block font-normal">Bpm</span>}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-center border-r border-slate-100">
                                                    <span className="font-semibold text-slate-800">{record.resp_rate ? `${record.resp_rate}` : "—"}</span>
                                                    {record.resp_rate && <span className="text-[10px] text-slate-400 block font-normal">/Min</span>}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-center border-r border-slate-100">
                                                    <span className="font-semibold text-slate-800">{record.height ? `${record.height}` : "—"}</span>
                                                    {record.height && <span className="text-[10px] text-slate-400 block font-normal">cm</span>}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-center border-r border-slate-100">
                                                    <span className="font-semibold text-slate-800">{record.weight ? `${record.weight}` : "—"}</span>
                                                    {record.weight && <span className="text-[10px] text-slate-400 block font-normal">Kg</span>}
                                                </TableCell>
                                                <TableCell className="py-3.5 px-4 text-center">
                                                    <span className="font-semibold text-slate-800">{record.bmi ? `${record.bmi}` : "—"}</span>
                                                    {record.bmi && <span className="text-[10px] text-slate-400 block font-normal">Kg/m²</span>}
                                                </TableCell>
                                            </TableRow>

                                            {/* Sub-row: Notes & Extra Clinical Markers */}
                                            <TableRow className="border-b border-slate-200 bg-slate-50/50">
                                                <TableCell colSpan={8} className="py-2.5 px-4">
                                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white p-3.5 rounded-lg border border-slate-200/80">
                                                        {/* Clinical Note */}
                                                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                                            <div className="mt-0.5 p-1 rounded-md bg-blue-50 text-docuhealth-primary shrink-0">
                                                                <FileText size={14} />
                                                            </div>
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Clinical Note</span>
                                                                <p className={`text-xs mt-1 break-words whitespace-pre-wrap leading-relaxed ${record.notes ? "text-slate-800 font-medium" : "text-slate-400 italic"}`}>
                                                                    {record.notes || "No additional notes recorded for this reading."}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Badges: SpO2, Pain Score & Staff */}
                                                        <div className="flex flex-wrap items-center gap-2 shrink-0 md:pt-0.5">
                                                            {record.spo2 !== null && record.spo2 !== undefined && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                                                                    SpO₂: {record.spo2}%
                                                                </span>
                                                            )}
                                                            {record.pain_score !== null && record.pain_score !== undefined && (
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getPainBadgeClass(record.pain_score)}`}>
                                                                    Pain: {record.pain_score}/10
                                                                </span>
                                                            )}
                                                            {record.staff_info && (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                                    <User size={12} className="text-slate-500" />
                                                                    {record.staff_info.firstname} {record.staff_info.lastname}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden flex flex-col gap-4">
                            {vitals?.map((record, index) => (
                                <div key={record.id || record.sqid || index} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                                    {/* Card Header: Date & Time + Staff */}
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-docuhealth-primary" />
                                            <span className="font-semibold text-slate-800 text-xs">
                                                {new Date(record.created_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                            <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                                                {new Date(record.created_at).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        {record.staff_info && (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                                                <User size={11} className="text-slate-400" />
                                                {record.staff_info.firstname} {record.staff_info.lastname}
                                            </span>
                                        )}
                                    </div>

                                    {/* Card Body: Vital Grid */}
                                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Blood Pressure</span>
                                            <span className="text-slate-800 font-semibold text-sm mt-0.5">{record.blood_pressure ? `${record.blood_pressure} mmHg` : "—"}</span>
                                        </div>
                                        <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Temperature</span>
                                            <span className="text-slate-800 font-semibold text-sm mt-0.5">{record.temp ? `${record.temp} °C` : "—"}</span>
                                        </div>
                                        <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Heart Rate</span>
                                            <span className="text-slate-800 font-semibold text-sm mt-0.5">{record.heart_rate ? `${record.heart_rate} Bpm` : "—"}</span>
                                        </div>
                                        <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Respiratory Rate</span>
                                            <span className="text-slate-800 font-semibold text-sm mt-0.5">{record.resp_rate ? `${record.resp_rate} /Min` : "—"}</span>
                                        </div>
                                        <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Weight</span>
                                            <span className="text-slate-800 font-semibold text-sm mt-0.5">{record.weight ? `${record.weight} Kg` : "—"}</span>
                                        </div>
                                        <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Height</span>
                                            <span className="text-slate-800 font-semibold text-sm mt-0.5">{record.height ? `${record.height} cm` : "—"}</span>
                                        </div>
                                        <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">BMI</span>
                                            <span className="text-slate-800 font-semibold text-sm mt-0.5">{record.bmi ? `${record.bmi} Kg/m²` : "—"}</span>
                                        </div>
                                        {record.spo2 !== null && record.spo2 !== undefined && (
                                            <div className="bg-cyan-50/60 p-2.5 rounded-lg border border-cyan-100 flex flex-col">
                                                <span className="text-[10px] uppercase tracking-wider text-cyan-600 font-bold">SpO₂</span>
                                                <span className="text-cyan-900 font-semibold text-sm mt-0.5">{record.spo2}%</span>
                                            </div>
                                        )}
                                        {record.pain_score !== null && record.pain_score !== undefined && (
                                            <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 flex flex-col">
                                                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Pain Score</span>
                                                <span className="text-slate-800 font-semibold text-sm mt-0.5">{record.pain_score}/10</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Footer: Clinical Note */}
                                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                                            <FileText size={13} className="text-docuhealth-primary shrink-0" />
                                            <span>Clinical Note</span>
                                        </div>
                                        <p className={`text-xs mt-1 break-words whitespace-pre-wrap leading-relaxed ${record.notes ? "text-slate-800 font-medium" : "text-slate-400 italic"}`}>
                                            {record.notes || "No additional notes recorded for this reading."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
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

export default VitalSignsHistory;
