import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import HealthPersonnelList from "../../../Components/Dashboard/Hospital_Dashboard_Components/Shared/HealthPersonnelList";

// Same shared HealthPersonnelList used by Doctors/Nurses/Lab/Pharmacist —
// it's backed by a real, role-agnostic, already-live endpoint
// (api/hospitals/team-members), so this needs no dummy data.
const Hospital_Radiology_HealthPersonnel_Dashboard = () => {
  return (
    <>
      <div className="py-2 text-sm flex justify-between items-center">
        <DynamicDate />
      </div>
      <div className="bg-white my-5 rounded-lg">
        <div className="border rounded-lg p-4 lg:p-6">
          <h2 className="mb-4 pb-2 border-b font-medium">Health Personnel List</h2>
          <HealthPersonnelList />
        </div>
      </div>
    </>
  );
};

export default Hospital_Radiology_HealthPersonnel_Dashboard;
