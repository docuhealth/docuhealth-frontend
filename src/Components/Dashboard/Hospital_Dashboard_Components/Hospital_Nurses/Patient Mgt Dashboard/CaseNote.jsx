import React, { useContext, useEffect, useState, useRef } from "react";
import axiosInstanceHos from "../../../../../utils/axiosInstanceHos";
import toast from "react-hot-toast";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";

const CaseNote = ({ selected, setCaseNoteHistory, setCaseNoteDetail }) => {
  const [caseNotes, setCaseNotes] = useState(null);
  const [loading, setLoading] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPatientCaseNotes = async () => {
      // Ensure we have a HIN before calling
      const hin = selected?.patient?.hin;
      if (!hin) return;

      setLoading(true);
      try {
        const res = await axiosInstanceHos.get(
          `api/nurses/case-notes/patient/${hin}`,
        );
        console.log(res.data);
        setCaseNotes(res.data.results);
      } catch (err) {
        console.error("Error fetching patient's case notes:", err);
        toast.error("Failed to load patient's case notes");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientCaseNotes();
  }, [selected]);

  return (
    <div className="bg-white my-5 border rounded-lg pt-5 lg:pt-8 px-4 lg:px-6 text-sm ">
      <div
        className="flex justify-start items-center gap-1 cursor-pointer border-b pb-3"
        onClick={() => setCaseNoteHistory(false)}
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

        <h2 className=" text-sm">Case Note History</h2>
      </div>
      <div className="border rounded-md p-5 my-5">
        <div className="border-b pb-3">
          <h2 className="font-medium ">Case Notes</h2>
        </div>

        {loading ? (
          <>
            <div className="flex justify-center items-center gap-3 px-2 py-3">
              <p className="text-sm text-gray-500 pt-3">
                Loading patient's case note...
              </p>
            </div>
          </>
        ) : caseNotes?.length === 0 && !loading ? (
          <>
            <div className="flex flex-col justify-center items-center text-center  my-2">
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

              <h2 className="font-medium pb-1">No Case Note!</h2>
              <div className="max-w-md text-center">
                <p className="text-[12px] text-gray-500">
                  {" "}
                  You currently don’t have any case notes in this hospital for
                  this patient.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4 mt-4">
              {caseNotes?.map((note) => (
                <div
                  key={note.id}
                  className="flex flex-col-reverse lg:flex-row lg:items-center justify-between border rounded-lg p-4 transition-colors"
                >
                  <div className="flex flex-row flex-wrap gap-4 lg:gap-10">
                    {/* Date Uploaded */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <CalendarIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          Date uploaded
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(note.created_at).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" },
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Time Uploaded */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <ClockIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          Time uploaded
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(note.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <UserIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                          Patient
                        </p>
                        <p className="text-sm font-medium">
                          {note.patient_info.firstname}{" "}
                          {note.patient_info.lastname}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative flex justify-end  lg:mt-0">
                    <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === note.id ? null : note.id);
                    }}
                      className="p-2 hover:bg-gray-200 rounded-full transition-all"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                      </svg>
                    </button>

                    {openMenuId === note.id && (
                    <div className="absolute right-0 top-10 z-10 w-40 bg-white rounded-md shadow text-sm border border-gray-100  animate-in fade-in zoom-in duration-200">
                      <button
                        onClick={() => {
                          setCaseNoteDetail(note);
                          setCaseNoteHistory(false);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:rounded-md transition-colors"
                      >
                        View note details
                      </button>
                    </div>
                  )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CaseNote;
