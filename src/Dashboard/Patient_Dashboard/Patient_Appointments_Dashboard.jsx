import React, { useState, useEffect, useContext } from "react";
import DynamicDate from "../../Components/Dynamic Date/DynamicDate";
import { AppContext } from "../../context/Patient Context/AppContext";
import { ChevronDown } from "lucide-react";
import PatientAppointmentsList from "../../Components/Dashboard/Patient_Dashboard_Components/Patient_Appointments_Dashboard/PatientAppointmentsList";

const Patient_Appointments_Dashboard = () => {
  const {profile} = useContext(AppContext);

  const options = ["Latest", "Oldest", "A-Z", "Z-A"];
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Latest");

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex flex-col text-sm sm:flex-row justify-between sm:items-center py-2 gap-1 sm:gap-0">
        <div>
          <DynamicDate />
        </div>
        <div className=" flex flex-col sm:flex-row items-start sm:items-center gap-3 ">
          <p>
            HIN : <span># {profile ? profile.hin : "loading.."}</span>
          </p>
          {/* <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex justify-center  items-center gap-2 px-6 py-2 border border-[#0000FF] text-[#0000FF] font-medium rounded-full hover:bg-blue-50 transition w-full "
            >
              Sort by: {selected}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-2 w-full sm:w-40 bg-white border border-gray-200 rounded-xs shadow-lg z-10">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div> */}
        </div>
      </div>
      <div className="bg-white my-5 border rounded-2xl p-5">
        <div className=" border rounded-lg p-5">
          <h2 className=" mb-4 pb-2 border-b font-medium">
            My Upcoming Appointments
          </h2>
          <div>
            <PatientAppointmentsList />
          </div>
        </div>
      </div>
    </>
  );
};

export default Patient_Appointments_Dashboard;
