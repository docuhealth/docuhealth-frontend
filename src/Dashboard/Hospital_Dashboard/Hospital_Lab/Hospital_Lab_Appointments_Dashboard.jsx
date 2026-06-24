import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { FlaskConical, ChevronDown } from "lucide-react";
import { LabAppointmentsListContext } from "../../../context/HospitalContext/Lab/LabAppointmentsListContext";
import LabAppointmentRow from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/LabAppointmentRow";
import LabAppointmentMobileCard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/LabAppointmentMobileCard";
import PatientInfo from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Doctors/Appointments_Dashboard/components/PatientInfo";
import CreateOrderModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/CreateOrderModal";

const filterOptions = ["All", "Today", "This week", "This month"];

const getPatientName = (appt) =>
  appt.patient_name ||
  (appt.patient ? `${appt.patient.firstname || ""} ${appt.patient.lastname || ""}`.trim() : "") ||
  appt.name ||
  "Unknown";

const getTestName = (appt) => appt.test_name || appt.test || "Test request";

const Hospital_Lab_Appointments_Dashboard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [seePatientDetails, setSeePatientDetails] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderPatientHin, setOrderPatientHin] = useState(null);

  const { appointments, loading } = useContext(LabAppointmentsListContext);

  const handleOpen = (appt) => {
    navigate("/hospital-lab-appointment-detail", {
      state: {
        appt: {
          id:          appt.id,
          name:        getPatientName(appt),
          hin:         appt.patient_hin || appt.patient?.hin || appt.hin || "—",
          test:        getTestName(appt),
          hospital:    appt.hospital_name || appt.hospital || "—",
          scheduledAt: appt.scheduled_at || appt.datetime || null,
          requestedBy: appt.requested_by ||
            (appt.doctor ? `Dr. ${appt.doctor.firstname || ""} ${appt.doctor.lastname || ""}`.trim() : undefined),
          age:    appt.patient?.age,
          gender: appt.patient?.sex || appt.patient?.gender,
          status: appt.status || "upcoming",
          note:   appt.note || appt.doctor_note || appt.description,
        },
      },
    });
  };

  const handleSeeDetails = (appt) => {
    const normalized = {
      ...appt,
      patient: appt.patient || { hin: appt.patient_hin || appt.hin },
    };
    setSelectedPatientDetails(normalized);
    setSeePatientDetails(true);
  };

  const handleCreateOrder = (appt) => {
    setOrderPatientHin(appt.patient_hin || appt.patient?.hin || appt.hin || null);
    setShowOrderModal(true);
  };

  if (seePatientDetails) {
    return (
      <>
        <div className="py-2">
          <DynamicDate />
        </div>
        <PatientInfo
          selectedPatientDetails={selectedPatientDetails}
          setSeePatientDetails={setSeePatientDetails}
        />
      </>
    );
  }

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
                    <LabAppointmentRow key={appt.id} appt={appt} onOpen={handleOpen} onSeeDetails={handleSeeDetails} onCreateOrder={handleCreateOrder} />
                  ))}
                </div>

                {/* Mobile cards */}
                <div className="block lg:hidden space-y-4 my-4">
                  {appointments.map((appt) => (
                    <LabAppointmentMobileCard key={appt.id} appt={appt} onOpen={handleOpen} onSeeDetails={handleSeeDetails} onCreateOrder={handleCreateOrder} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <CreateOrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        patientHin={orderPatientHin}
      />
    </>
  );
};

export default Hospital_Lab_Appointments_Dashboard;
