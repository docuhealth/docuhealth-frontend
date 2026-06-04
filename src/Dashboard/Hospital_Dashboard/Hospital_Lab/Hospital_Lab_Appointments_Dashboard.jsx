import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { UserIcon, FlaskConical, FileText, ChevronDown } from "lucide-react";

const appointments = [
  { id: 1,  patient: "Amara Okafor",   test: "Test request", note: "Patient is complaining of severe cough and cold" },
  { id: 2,  patient: "Emeka Nwosu",    test: "Test request", note: "Patient presents with persistent fever for 3 days" },
  { id: 3,  patient: "Fatima Bello",   test: "Test request", note: "Routine check — doctor requested full blood panel" },
  { id: 4,  patient: "Chidi Eze",      test: "Test request", note: "Patient is complaining of severe cough and cold" },
  { id: 5,  patient: "Ngozi Adeyemi",  test: "Test request", note: "Patient reports abdominal pain and loss of appetite" },
  { id: 6,  patient: "Yusuf Lawal",    test: "Test request", note: "Follow-up malaria test after initial treatment" },
  { id: 7,  patient: "Blessing Obi",   test: "Test request", note: "Patient is complaining of severe cough and cold" },
  { id: 8,  patient: "Kelechi Nnadi",  test: "Test request", note: "Thyroid check requested by endocrinologist" },
  { id: 9,  patient: "Halima Usman",   test: "Test request", note: "Patient is complaining of severe cough and cold" },
  { id: 10, patient: "Tunde Afolabi",  test: "Test request", note: "Annual wellness lab screen" },
];

const filterOptions = ["All", "Today", "This week", "This month"];

const Hospital_Lab_Appointments_Dashboard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilter, setShowFilter]     = useState(false);

  const handleOpen = (appt) => {
    navigate("/hospital-lab-appointment-detail", {
      state: {
        order: {
          name:     appt.patient,
          hin:      "12456********",
          test:     appt.test === "Test request" ? "Malaria/Typhoid Test" : appt.test,
          hospital: "Lagos General Hospital",
          datetime: "30th, May., 2026/ 9:45 AM",
          tab:      "Pending Test",
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
                      <p className="text-sm font-medium">{appt.patient}</p>
                    </div>
                  </div>

                  {/* Test */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <FlaskConical className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Test Request</p>
                      <p className="text-sm font-medium">{appt.test}</p>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">Note</p>
                      <p className="text-sm font-medium truncate max-w-[220px]">{appt.note}</p>
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
                  {/* Patient header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-50 mb-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100">
                      {initials(appt.patient)}
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Patient</p>
                      <p className="text-[13px] font-semibold text-gray-800">{appt.patient}</p>
                    </div>
                  </div>

                  {/* Test + Note */}
                  <div className="grid grid-cols-2 gap-4 pt-1 mb-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Test Request</p>
                      <p className="text-[13px] text-gray-600">{appt.test}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Note</p>
                      <p className="text-[13px] text-gray-600 truncate italic">&ldquo;{appt.note}&rdquo;</p>
                    </div>
                  </div>

                  {/* Action button */}
                  <button
                    className="w-full bg-white border border-[#3E4095] text-[#3E4095] rounded-full py-2.5 text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 active:bg-blue-100 transition-colors"
                    onClick={() => handleOpen(appt)}
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Hospital_Lab_Appointments_Dashboard;
