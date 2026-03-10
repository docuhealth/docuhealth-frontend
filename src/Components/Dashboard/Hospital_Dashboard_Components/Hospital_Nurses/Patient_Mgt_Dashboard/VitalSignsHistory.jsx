import React, { useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { NursesVitalSignsContext } from "../../../../../context/HospitalContext/Nurses/NursesVitalSignsContext";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";

const VitalSignsHistory = ({ selected, setVitalSignsHistory }) => {
    const hin = selected?.patient?.hin;
    const {
        vitals,
        count,
        currentPage,
        setCurrentPage,
        totalPages,
        loading,
        setPatientHin
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
        <div className="bg-white my-5 border rounded-lg pt-5 lg:pt-8 px-4 lg:px-6 text-sm">
            <div
                className="flex justify-start items-center gap-1 cursor-pointer border-b pb-3"
                onClick={() => setVitalSignsHistory(false)}
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
                        fill="#1B2B40"
                    />
                </svg>
                <h2 className="text-sm">Vital Signs History</h2>
            </div>

            <div className="my-5">
                {loading ? (
                    <div className="flex justify-center items-center gap-3 px-2 py-3 text-gray-500">
                        Loading patient's vitals history...
                    </div>
                ) : vitals?.length === 0 ? (

                    <div className="flex flex-col justify-center items-center text-center  h-full">
                        <svg
                            width="180"
                            height="180"
                            viewBox="0 0 366 366"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g filter="url(#filter0_d_1517_47151)">
                                <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
                            </g>
                            <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
                            <path
                                d="M164.25 114.75V102.25H151.75V114.75H126.75C123.298 114.75 120.5 117.548 120.5 121V221C120.5 224.452 123.298 227.25 126.75 227.25H239.25C242.702 227.25 245.5 224.452 245.5 221V121C245.5 117.548 242.702 114.75 239.25 114.75H214.25V102.25H201.75V114.75H164.25ZM133 158.5H233V214.75H133V158.5ZM133 127.25H151.75V133.5H164.25V127.25H201.75V133.5H214.25V127.25H233V146H133V127.25ZM169.741 164.528L183 177.786L196.257 164.528L205.097 173.366L191.839 186.626L205.096 199.883L196.258 208.721L183 195.464L169.741 208.721L160.903 199.882L174.161 186.626L160.902 173.366L169.741 164.528Z"
                                fill="#929AA3"
                            />
                            <defs>
                                <filter
                                    id="filter0_d_1517_47151"
                                    x="0"
                                    y="0"
                                    width="366"
                                    height="366"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                >
                                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                    <feColorMatrix
                                        in="SourceAlpha"
                                        type="matrix"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                        result="hardAlpha"
                                    />
                                    <feOffset dy="12" />
                                    <feGaussianBlur stdDeviation="12" />
                                    <feComposite in2="hardAlpha" operator="out" />
                                    <feColorMatrix
                                        type="matrix"
                                        values="0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0.15 0"
                                    />
                                    <feBlend
                                        mode="normal"
                                        in2="BackgroundImageFix"
                                        result="effect1_dropShadow_1517_47151"
                                    />
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="effect1_dropShadow_1517_47151"
                                        result="shape"
                                    />
                                </filter>
                            </defs>
                        </svg>

                        <h2 className="font-medium pb-1">No Vital Signs Records!</h2>
                        <div className="max-w-md text-center">
                            <p className="text-[12px] text-gray-500">
                                {" "}
                                This patient does not have any recorded vital signs yet.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-hidden hidden lg:block">
                            <table className=" w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 border-b">
                                        <th className="py-3 px-4 font-medium border-r last:border-r-0">Date & Time</th>
                                        <th className="py-3 px-4 font-medium text-center border-r last:border-r-0">BP (mmHg)</th>
                                        <th className="py-3 px-4 font-medium text-center border-r last:border-r-0">Temp (°C)</th>
                                        <th className="py-3 px-4 font-medium text-center border-r last:border-r-0">HR (Bpm)</th>
                                        <th className="py-3 px-4 font-medium text-center border-r last:border-r-0">RR (/Min)</th>
                                        <th className="py-3 px-4 font-medium text-center border-r last:border-r-0">Height (m)</th>
                                        <th className="py-3 px-4 font-medium text-center">Weight (Kg)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vitals?.map((record, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 border-r last:border-r-0">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800">
                                                        {new Date(record.created_at).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500">
                                                        {new Date(record.created_at).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center border-r last:border-r-0">{record.blood_pressure || "—"}</td>
                                            <td className="py-3 px-4 text-center border-r last:border-r-0">{record.temp || "—"}</td>
                                            <td className="py-3 px-4 text-center border-r last:border-r-0">{record.heart_rate || "—"}</td>
                                            <td className="py-3 px-4 text-center border-r last:border-r-0">{record.resp_rate || "—"}</td>
                                            <td className="py-3 px-4 text-center border-r last:border-r-0">{record.height || "—"}</td>
                                            <td className="py-3 px-4 text-center">{record.weight || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="lg:hidden flex flex-col gap-4 ">
                            {vitals?.map((record, index) => (
                                <div key={index} className="bg-white rounded-lg border border-gray-200  overflow-hidden">
                                    {/* Card Header: Date & Time */}
                                    <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                        <span className="font-medium text-gray-800">
                                            {new Date(record.created_at).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                                            {new Date(record.created_at).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>

                                    {/* Card Body: Vital Grid */}
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

                            {/* Empty State for Mobile */}
                            {(!vitals || vitals.length === 0) && (
                                <div className="text-center py-10 text-gray-500 italic">
                                    No vital records found.
                                </div>
                            )}
                        </div>

                        <>
                            <Pagination2
                                count={count}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                setCurrentPage={setCurrentPage}
                            />
                        </>
                    </>
                )}
            </div>
        </div>
    );
};

export default VitalSignsHistory;
