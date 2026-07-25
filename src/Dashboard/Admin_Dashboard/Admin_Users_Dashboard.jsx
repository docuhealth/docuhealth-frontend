import { useContext, useState } from "react";
import { AdminUsersContext } from "../../context/AdminContext/AdminUsersContext";
import { ChevronDown } from "lucide-react";
import DynamicDate from "../../Components/DynamicDate/DynamicDate";
import UsersListAdmin from "../../Components/Dashboard/Admin_Dashboard_Components/Admin_Users_Dashboard/UsersListAdmin";

const Admin_Users_Dashboard = () => {
    const {
        selectedRole,
        setSelectedRole,
        setCurrentPage,
    } = useContext(AdminUsersContext);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const options = [
      { label: "Individuals", value: "patient" },
      { label: "Hospital", value: "hospital" }
    ];

    const handleSelect = (option) => {
        setSelectedRole(option.value);
        setCurrentPage(1);
        setSelectedUsers([]);
        setIsOpen(false);
    };

    const displaySelected = options.find(o => o.value === selectedRole)?.label || "Individuals";

    return (
        <div className="flex flex-col">
            <div className="py-2 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <DynamicDate />
                <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
                    <div className="relative w-full sm:w-auto">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex justify-center items-center gap-2 px-6 py-2 border border-docuhealth-primary text-docuhealth-primary font-medium rounded-full hover:bg-blue-50 transition w-full sm:w-auto"
                        >
                            Filter by : {displaySelected}
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            />
                        </button>
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-full lg:w-40 bg-white border border-gray-200 rounded-xs shadow-lg z-10">
                                {options.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSelect(option)}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="bg-white my-5 rounded-lg flex-1">
                <div className="border rounded-lg p-4 lg:p-6 h-full flex flex-col">
                    <h2 className="mb-4 pb-2 border-b font-medium">
                        Users
                    </h2>
                    <div>
                        <UsersListAdmin 
                            selectedUsers={selectedUsers} 
                            setSelectedUsers={setSelectedUsers} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin_Users_Dashboard;