import { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { FlaskConical, ChevronDown } from "lucide-react";
import { LabAppointmentsListContext } from "../../../context/HospitalContext/Lab/LabAppointmentsListContext";
import LabAppointmentRow from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/LabAppointmentRow";
import LabAppointmentMobileCard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/LabAppointmentMobileCard";
import PatientInfo from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/PatientInfoComponents/LabPatientInfo";
import CreateOrderModal from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Lab/CreateOrderModal";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";
import SearchBar from "../../../Components/SearchBar/SearchBar";

const getPatientName = (appt) =>
  appt.patient_name ||
  (appt.patient ? `${appt.patient.firstname || ""} ${appt.patient.lastname || ""}`.trim() : "") ||
  appt.name ||
  "Unknown";

const getTestName = (appt) => appt.test_name || appt.test || "Test request";

const Hospital_Lab_Appointments_Dashboard = () => {
  const navigate = useNavigate();
  const [seePatientDetails, setSeePatientDetails] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderPatientHin, setOrderPatientHin] = useState(null);

  const {
    appointments,
    loading,
    count,
    currentPage,
    setCurrentPage,
    totalPages,
    appointmentType,
    setAppointmentType,
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    isRefreshing,
  } = useContext(LabAppointmentsListContext);

  const sortedAppointments = useMemo(() => {
    if (appointmentType === 'upcoming') {
      const now = new Date().getTime();
      return [...appointments].sort((a, b) => {
        const dateA = new Date(a.scheduled_time || a.scheduled_at || a.datetime).getTime();
        const dateB = new Date(b.scheduled_time || b.scheduled_at || b.datetime).getTime();
        return Math.abs(dateA - now) - Math.abs(dateB - now);
      });
    }
    return [...appointments].sort((a, b) => new Date(b.scheduled_time || b.scheduled_at || b.datetime).getTime() - new Date(a.scheduled_time || a.scheduled_at || a.datetime).getTime());
  }, [appointments, appointmentType]);

  const handleOpen = (appt) => {
    navigate("/hospital-lab-appointment-detail", {
      state: {
        appt: {
          id:          appt.id,
          name:        getPatientName(appt),
          hin:         appt.patient_hin || appt.patient_info?.hin || appt.hin || "—",
          test:        getTestName(appt),
          hospital:    appt.hospital_name || appt.hospital || "—",
          scheduledAt: appt.scheduled_time || appt.scheduled_at || appt.datetime || null,
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
    setOrderPatientHin(appt.patient_hin || appt.patient_info?.hin || appt.hin || null);
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
          hideCreateOrder={appointmentType === 'history'}
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
          <div className="w-full mb-8 md:border-b md:border-gray-200">
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:gap-8">
              <button
                onClick={() => setAppointmentType('today')}
                className={`px-2 sm:px-4 py-2 text-center text-[13px] sm:text-sm font-medium transition-colors md:-mb-[1px] ${
                  appointmentType === 'today'
                    ? 'bg-docuhealth-primary text-white rounded-md md:bg-transparent md:text-docuhealth-primary md:border-b-2 md:border-docuhealth-primary md:rounded-none'
                    : 'text-gray-500 hover:text-gray-700 md:border-b-2 md:border-transparent'
                }`}
              >
                Today's Appointments
              </button>
              <button
                onClick={() => setAppointmentType('upcoming')}
                className={`px-2 sm:px-4 py-2 text-center text-[13px] sm:text-sm font-medium transition-colors md:-mb-[1px] ${
                  appointmentType === 'upcoming'
                    ? 'bg-docuhealth-primary text-white rounded-md md:bg-transparent md:text-docuhealth-primary md:border-b-2 md:border-docuhealth-primary md:rounded-none'
                    : 'text-gray-500 hover:text-gray-700 md:border-b-2 md:border-transparent'
                }`}
              >
                Upcoming Appointments
              </button>
              <button
                onClick={() => setAppointmentType('history')}
                className={`px-2 sm:px-4 py-2 text-center text-[13px] sm:text-sm font-medium transition-colors md:-mb-[1px] ${
                  appointmentType === 'history'
                    ? 'bg-docuhealth-primary text-white rounded-md md:bg-transparent md:text-docuhealth-primary md:border-b-2 md:border-docuhealth-primary md:rounded-none'
                    : 'text-gray-500 hover:text-gray-700 md:border-b-2 md:border-transparent'
                }`}
              >
                Past Appointments
              </button>
            </div>
          </div>

          <div className="mb-4 w-full space-y-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search patient's name, doctor's name, or notes..."
            />
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 whitespace-nowrap">From:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-docuhealth-primary focus:border-docuhealth-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 whitespace-nowrap">To:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-docuhealth-primary focus:border-docuhealth-primary"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="text-xs text-red-500 hover:text-red-700 underline cursor-pointer"
                >
                  Clear dates
                </button>
              )}
              {isRefreshing && (
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5 w-full">
                  <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin"></span>
                  Searching...
                </p>
              )}
            </div>
          </div>

          <div className="text-[12px] my-4">
            {loading || (isRefreshing && appointments.length === 0) ? (
              <div className="py-12 text-center text-gray-400 text-sm">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                <p className="font-medium">No results found.</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search term or date range, or check another tab.</p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block">
                  {sortedAppointments.map((appt) => (
                    <LabAppointmentRow key={appt.id} appt={appt} onOpen={handleOpen} onSeeDetails={handleSeeDetails} onCreateOrder={handleCreateOrder} hideCreateOrder={appointmentType === 'history'} />
                  ))}
                </div>

                <div className="block lg:hidden space-y-4 my-4">
                  {sortedAppointments.map((appt) => (
                    <LabAppointmentMobileCard key={appt.id} appt={appt} onOpen={handleOpen} onSeeDetails={handleSeeDetails} onCreateOrder={handleCreateOrder} hideCreateOrder={appointmentType === 'history'} />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <Pagination2
                    count={count}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                  />
                )}
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
