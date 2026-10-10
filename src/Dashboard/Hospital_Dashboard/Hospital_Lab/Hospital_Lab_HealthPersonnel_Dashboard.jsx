import React, { useState, useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import HealthPersonnelList from "../../../Components/Dashboard/Hospital_Dashboard_Components/Shared/HealthPersonnelList";
import OnboardNewStaff from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Staff_Mgt_Dashboard/components/OnboardNewStaff";
import { LabAppContext } from "../../../context/HospitalContext/Lab/LabAppContext";

const Hospital_Lab_HealthPersonnel_Dashboard = () => {
  const { isLabAdmin } = useContext(LabAppContext);
  const [createNewStaff, setCreateNewStaff] = useState(false);

  return (
    <>
      <div className="py-2 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <DynamicDate />
        {isLabAdmin && (
          <button
            onClick={() => setCreateNewStaff(true)}
            className="flex justify-center items-center gap-2 px-6 py-2.5 bg-docuhealth-primary hover:bg-docuhealth-primary-hover text-white font-medium rounded-full transition cursor-pointer text-sm w-full sm:w-auto shadow-xs"
          >
            Add Lab Scientist
          </button>
        )}
      </div>
      <div className="bg-white my-5 rounded-lg">
        <div className="border rounded-lg p-4 lg:p-6">
          <h2 className="mb-4 pb-2 border-b font-medium">Health Personnel List</h2>
          <HealthPersonnelList />
        </div>
      </div>

      {createNewStaff && (
        <OnboardNewStaff
          setCreateNewStaff={setCreateNewStaff}
          defaultRole="lab_scientist"
          lockRole={true}
        />
      )}
    </>
  );
};

export default Hospital_Lab_HealthPersonnel_Dashboard;
