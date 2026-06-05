import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { UserIcon, FlaskConical, FileText, ChevronDown } from "lucide-react";
import { LabAppointmentsListContext } from "../../../context/HospitalContext/Lab/LabAppointmentsListContext";

const filterOptions = ["All", "Today", "This week", "This month"];

const Hospital_Lab_Appointments_Dashboard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  const { appointments, loading } = useContext(LabAppointmentsListContext);

  const getPatientName = (appt) =>
    appt.patient_name ||
    (appt.patient ? `${appt.patient.firstname || ""} ${appt.patient.lastname || ""}`.trim() : "") ||
    appt.name ||
    "Unknown";

  const getTestName = (appt) =>
    appt.test_name || appt.test || "Test request";

  const getNote = (appt) =>
    appt.note || appt.doctor_note || appt.description || "—";

  const handleOpen = (appt) => {
    navigate("/hospital-lab-appointment-detail", {
      state: {
        order: {
          id:       appt.id,
          name:     getPatientName(appt),
          hin:      appt.patient_hin || appt.patient?.hin || appt.hin || "—",
          test:     getTestName(appt),
          hospital: appt.hospital_name || appt.hospital || "—",
          datetime: appt.scheduled_at || appt.datetime || "—",
          tab:      "Pending Test",
          requestedBy: appt.requested_by || appt.doctor?.firstname
            ? `Dr. ${appt.doctor?.firstname || ""} ${appt.doctor?.lastname || ""}`.trim()
            : undefined,
          age:    appt.patient?.age,
          gender: appt.patient?.sex || appt.patient?.gender,
        },
      },
    });
  };

  const initials = (name) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="bg-white my-5 rounded-lg">
        <div className="border rounded-lg p-4 lg:p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <h2 className="font-medium">Upcoming appointment</h2>

            {/* Filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors"
              >
                Filter <ChevronDown size={14} className={`transition-transform ${showFilter ? "rotate-180" : ""}`} />
              </button>
              {showFilter && (
                <div className="absolute right-0 top-8 w-36 bg-white border border-gray-100 shadow-lg rounded-lg py-1 z-10">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setActiveFilter(opt); setShowFilter(false); }}
                      className={`w-full text-left text-xs px-4 py-2 hover:bg-gray-50 transition-colors ${
                        activeFilter === opt ? "text-[#3E4095] font-semibold" : "text-gray-600"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-[12px] my-4">
            {loading ? (
              <div className="py-12 text-center text-gray-400 text-sm">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No upcoming appointments</div>
            ) : (
              <>
                {/* Desktop rows */}
                <div className="hidden lg:block">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="mb-4 p-4 border rounded-md flex flex-wrap gap-4 lg:gap-10"
                    >
                      {/* Patient */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-md">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-semibold">Patient</p>
                          <p className="text-sm font-medium">{getPatientName(appt)}</p>
                        </div>
                      </div>

                      {/* Test */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-md">
                          <FlaskConical className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-semibold">Test Request</p>
                          <p className="text-sm font-medium">{getTestName(appt)}</p>
                        </div>
                      </div>

                      {/* Note */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gray-100 rounded-md">
                          <FileText className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-semibold">Note</p>
                          <p className="text-sm font-medium truncate max-w-[220px]">{getNote(appt)}</p>
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        className="border border-[#3E4095] rounded-full py-2 px-5 w-full lg:w-auto hover:bg-blue-50 transition-all duration-300 cursor-pointer"
                        onClick={() => handleOpen(appt)}
                      >
                        <p className="text-[#3E4095]">Open</p>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Mobile cards */}
                <div className="block lg:hidden space-y-4 my-4">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="bg-white border border-gray-200 rounded-md p-4"
                    >
                      <div className="flex items-center gap-3 pb-3 border-b border-gray-50 mb-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100">
                          {initials(getPatientName(appt))}
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-medium">Patient</p>
                          <p className="text-[13px] font-semibold text-gray-800">{getPatientName(appt)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-1 mb-4">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-medium">Test Request</p>
                          <p className="text-[13px] text-gray-600">{getTestName(appt)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-medium">Note</p>
                          <p className="text-[13px] text-gray-600 truncate italic">&ldquo;{getNote(appt)}&rdquo;</p>
                        </div>
                      </div>

                      <button
                        className="w-full bg-white border border-[#3E4095] text-[#3E4095] rounded-full py-2.5 text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                        onClick={() => handleOpen(appt)}
                      >
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Hospital_Lab_Appointments_Dashboard;
