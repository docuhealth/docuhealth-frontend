import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { User, FlaskConical, FileText, ChevronDown, MoreHorizontal } from "lucide-react";

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
  const [openMenu, setOpenMenu]         = useState(null);

  const handleOpen = (appt) => {
    setOpenMenu(null);
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

  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs sm:text-sm font-semibold text-[#1B2B40]">Upcoming appointment</h3>

          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Filter <ChevronDown size={15} className={`transition-transform ${showFilter ? "rotate-180" : ""}`} />
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

        {/* Appointment rows */}
        <div className="flex flex-col gap-3">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="border border-gray-200 rounded-xl"
            >
              {/* Mobile: stacked layout */}
              <div className="flex flex-col sm:hidden px-4 py-3 gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User size={16} className="text-gray-400 shrink-0" />
                    <span>Patient: <span className="font-medium">{appt.patient}</span></span>
                  </div>
                  {/* Three-dot menu */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === appt.id ? null : appt.id)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openMenu === appt.id && (
                      <div className="absolute right-0 top-8 w-40 bg-white border border-gray-100 shadow-lg rounded-lg py-1 z-10">
                        <button
                          onClick={() => handleOpen(appt)}
                          className="w-full text-left text-xs px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Open
                        </button>
                        <button className="w-full text-left text-xs px-4 py-2 text-green-600 hover:bg-green-50 transition-colors">
                          Accept request
                        </button>
                        <button className="w-full text-left text-xs px-4 py-2 text-red-500 hover:bg-red-50 transition-colors">
                          Reject request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FlaskConical size={14} className="text-gray-400 shrink-0" />
                  <span>{appt.test}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-500">
                  <FileText size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <span>Note: {appt.note}</span>
                </div>
              </div>

              {/* Tablet/Desktop: horizontal row */}
              <div className="hidden sm:flex items-stretch">
                {/* Patient */}
                <div className="flex items-center gap-2.5 px-4 py-4 border-r border-gray-200 min-w-[180px] lg:min-w-[200px]">
                  <User size={18} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">Patient: <span className="font-medium">{appt.patient}</span></span>
                </div>

                {/* Test request */}
                <div className="flex items-center gap-2.5 px-4 py-4 border-r border-gray-200 min-w-[130px] lg:min-w-[150px]">
                  <FlaskConical size={18} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">{appt.test}</span>
                </div>

                {/* Note */}
                <div className="flex items-center gap-2.5 px-4 py-4 flex-1">
                  <FileText size={18} className="text-gray-400 shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-600">Note: {appt.note}</span>
                </div>

                {/* Three-dot menu */}
                <div className="relative flex items-center px-4">
                  <button
                    onClick={() => setOpenMenu(openMenu === appt.id ? null : appt.id)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {openMenu === appt.id && (
                    <div className="absolute right-6 top-10 w-40 bg-white border border-gray-100 shadow-lg rounded-lg py-1 z-10">
                      <button
                        onClick={() => handleOpen(appt)}
                        className="w-full text-left text-xs px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Open
                      </button>
                      <button className="w-full text-left text-xs px-4 py-2 text-green-600 hover:bg-green-50 transition-colors">
                        Accept request
                      </button>
                      <button className="w-full text-left text-xs px-4 py-2 text-red-500 hover:bg-red-50 transition-colors">
                        Reject request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
};

export default Hospital_Lab_Appointments_Dashboard;
