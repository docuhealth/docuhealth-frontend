import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import { MessageSquare } from "lucide-react";

const Hospital_Lab_Messages_Dashboard = () => {
  return (
    <>
      <div className="py-2">
        <DynamicDate />
      </div>
      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center py-24 text-gray-400">
        <MessageSquare size={48} className="opacity-20 mb-3" />
        <p className="text-sm">Messages coming soon</p>
      </div>
    </>
  );
};

export default Hospital_Lab_Messages_Dashboard;
