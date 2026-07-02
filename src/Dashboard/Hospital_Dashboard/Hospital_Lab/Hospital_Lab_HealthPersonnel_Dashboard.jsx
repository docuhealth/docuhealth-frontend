import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import HealthPersonnelList from "../../../Components/Dashboard/Hospital_Dashboard_Components/Shared/HealthPersonnelList";

const Hospital_Lab_HealthPersonnel_Dashboard = () => {
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

export default Hospital_Lab_HealthPersonnel_Dashboard;
