import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import DynamicDate from "../../../Components/Dynamic Date/DynamicDate";
import StaffListHospital from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Staff Mgt Dashboard/StaffListHospital";
import OnboardNewStaff from "../../../Components/Dashboard/Hospital_Dashboard_Components/Hospital_Admin/Staff Mgt Dashboard/components/OnboardNewStaff";

const Hospital_Admin_Staff_Dashboard = () => {

    const options = ["All Staffs", "Oldest", "A-Z", "Z-A"];
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("All Staffs");
    const [createNewStaff, setCreateNewStaff] = useState(false)
    const [selectedStaff, setSelectedStaff] = useState([]);


    const handleSelect = (option) => {
        setSelected(option);
        setIsOpen(false);
    };
    return (
        <>
            <div className="py-2 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <DynamicDate />
                <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3 sm:gap-0">
                    <div className="relative w-full sm:w-auto">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex justify-center items-center gap-2 px-6 py-2 border border-[#3E4095] text-[#3E4095] font-medium rounded-full hover:bg-blue-50 transition w-full sm:w-auto"
                        >
                            Filter by: {selected}
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-full lg:w-40 bg-white border border-gray-200 rounded-xs shadow-lg z-10">
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
                    </div>
                    <div className="w-full sm:w-auto">
                        <button
                            className="flex justify-center items-center gap-2 px-6 py-2 bg-[#3E4095] text-white font-medium rounded-full transition cursor-pointer w-full sm:w-auto"
                            onClick={() => {
                                setCreateNewStaff(!createNewStaff)
                            }}
                        >
                            Add a new staff
                        </button>
                    </div>
                </div>

            </div>
            <div className="bg-white my-5 rounded-lg">
                <div className=" border rounded-lg p-4 lg:p-6">
                    <h2 className=" mb-4 pb-2 border-b font-medium">
                        My Staffs
                    </h2>
                    <div>
                        <StaffListHospital selectedStaff={selectedStaff} setSelectedStaff={setSelectedStaff} />
                    </div>
                </div>
            </div>
            {createNewStaff && (
                <>
                    <OnboardNewStaff setCreateNewStaff={setCreateNewStaff} />
                </>
            )}
        </>
    )
}
export default Hospital_Admin_Staff_Dashboard;