import { useState, useContext, useMemo } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { PharmacistAppointmentsListContext } from "../../../context/HospitalContext/Pharmacist/PharmacistAppointmentsListContext";
import PharmacistAppointmentRow from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Pharmacist/PharmacistAppointmentRow";
import PharmacistAppointmentMobileCard from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Pharmacist/PharmacistAppointmentMobileCard";
import PharmacistPatientInfo from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Pharmacist/PharmacistPatientInfo";
import PharmacistCreateOrder from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Pharmacist/PharmacistCreateOrder";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";
import SearchBar from "../../../Components/SearchBar/SearchBar";

const Hospital_Pharmacist_Appointments_Dashboard = () => {
  const [seePatientDetails, setSeePatientDetails] = useState(false);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [createOrder, setCreateOrder] = useState(false);

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
  } = useContext(PharmacistAppointmentsListContext);

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

  const handleSeeDetails = (appt) => {
    const normalized = {
      ...appt,
      patient: appt.patient || { hin: appt.patient_hin || appt.hin },
    };
    setSelectedPatientDetails(normalized);
    setSeePatientDetails(true);
  };

  const handleCreateOrder = (appt) => {
    const normalized = {
      ...appt,
      patient: appt.patient || { hin: appt.patient_hin || appt.hin },
      sqid: appt.sqid || appt.id,
    };
    setSelectedPatientDetails(normalized);
    setCreateOrder(true);
  };

  if (seePatientDetails) {
    return (
      <>
        <div className="py-2">
          <DynamicDate />
        </div>
        <PharmacistPatientInfo
          selectedPatientDetails={selectedPatientDetails}
          setSeePatientDetails={setSeePatientDetails}
          setCreateOrder={setCreateOrder}
          hideCreateOrder={appointmentType === 'history'}
        />
      </>
    );
  }

  if (createOrder) {
    return (
      <>
        <div className="py-2">
          <DynamicDate />
        </div>
        <PharmacistCreateOrder
          selectedPatientDetails={selectedPatientDetails}
          setCreateOrder={setCreateOrder}
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
                    <PharmacistAppointmentRow 
                      key={appt.id} 
                      appt={appt} 
                      onSeeDetails={handleSeeDetails} 
                      onCreateOrder={handleCreateOrder} 
                      hideCreateOrder={appointmentType === 'history'} 
                    />
                  ))}
                </div>

                <div className="block lg:hidden space-y-4 my-4">
                  {sortedAppointments.map((appt) => (
                    <PharmacistAppointmentMobileCard 
                      key={appt.id} 
                      appt={appt} 
                      onSeeDetails={handleSeeDetails} 
                      onCreateOrder={handleCreateOrder} 
                      hideCreateOrder={appointmentType === 'history'} 
                    />
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
    </>
  );
};

export default Hospital_Pharmacist_Appointments_Dashboard;
