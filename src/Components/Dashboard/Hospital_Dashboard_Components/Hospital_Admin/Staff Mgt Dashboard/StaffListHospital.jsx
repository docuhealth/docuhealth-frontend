import React, { useState, useContext } from "react";
import { HosStaffsContext } from "../../../../../context/Hospital Context/HosStaffsContext";
import {
  formatFullDate,
  formatTime,
} from "../../../Patient_Dashboard_Components/Patient_Appointments_Dashboard/Components/Date_Time_Formatter";
import Pagination2 from "../../../Patient_Dashboard_Components/Pagination/Pagination2";

const StaffListHospital = ({ selectedStaff, setSelectedStaff }) => {
  const { staffs, loading, count, currentPage, totalPages, setCurrentPage } =
    useContext(HosStaffsContext);
  const [activeMenu, setActiveMenu] = useState(null);

  console.log(staffs)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-sm">
        Loading...
      </div>
    );
  }

  if (staffs.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center  h-full">
        <svg
          width="200"
          height="200"
          viewBox="0 0 366 366"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_1517_47151)">
            <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
          </g>
          <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
          <path
            d="M164.25 114.75V102.25H151.75V114.75H126.75C123.298 114.75 120.5 117.548 120.5 121V221C120.5 224.452 123.298 227.25 126.75 227.25H239.25C242.702 227.25 245.5 224.452 245.5 221V121C245.5 117.548 242.702 114.75 239.25 114.75H214.25V102.25H201.75V114.75H164.25ZM133 158.5H233V214.75H133V158.5ZM133 127.25H151.75V133.5H164.25V127.25H201.75V133.5H214.25V127.25H233V146H133V127.25ZM169.741 164.528L183 177.786L196.257 164.528L205.097 173.366L191.839 186.626L205.096 199.883L196.258 208.721L183 195.464L169.741 208.721L160.903 199.882L174.161 186.626L160.902 173.366L169.741 164.528Z"
            fill="#929AA3"
          />
          <defs>
            <filter
              id="filter0_d_1517_47151"
              x="0"
              y="0"
              width="366"
              height="366"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="12" />
              <feGaussianBlur stdDeviation="12" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0.15 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1517_47151"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1517_47151"
                result="shape"
              />
            </filter>
          </defs>
        </svg>

        <h2 className="font-medium pb-1">No Staffs!</h2>
        <div className="max-w-md text-center">
          <p className="text-[12px] text-gray-500">
            {" "}
            You currently don’t have any staffs in this hospital.
          </p>
        </div>
      </div>
    );
  }

const handleBulkRemove = () => {
  // Map the selected staff_ids back to the full objects for logging
  const staffObjectsToRemove = staffs.filter((staff) =>
    selectedStaff.includes(staff.staff_id)
  );

  console.log("Bulk Removing Staff Details:", staffObjectsToRemove);

  // Trigger your API request here using selectedStaff (the IDs)
  // deleteStaffsApi(selectedStaff);

  setSelectedStaff([]); // Reset selection
};

const handleIndividualRemove = (staff) => {
  // Use the whole object passed in to log details
  console.log("Removing Staff Member:", staff);
  
  // Trigger your API request here using staff.staff_id
  // deleteStaffApi(staff.staff_id);

  setActiveMenu(null);
};

const handleUpdateRole = (staff) => {
  console.log(`Directly updating role for: ${staff.firstname} (${staff.staff_id})`);
  console.log(`Current role is: ${staff.role}`);
  
  // Usually, you would open a modal here. For direct request:
  // updateRoleApi(staff.staff_id, "New Role");

  setActiveMenu(null);
};

  // --- SELECTION LOGIC ---

  const allChecked = staffs.length > 0 && selectedStaff.length === staffs.length;

const toggleSelectAll = () => {
    if (allChecked) {
      console.log("Deselected all staff");
      setSelectedStaff([]);
    } else {
      const allIds = staffs.map((s) => s.staff_id);
      // Log the full objects of everyone being selected
      console.log("Selected all staff:", staffs);
      setSelectedStaff(allIds);
    }
  };

const toggleStaff = (id) => {
    if (!id) {
    console.error("Error: This staff member has no ID property!");
    return;
  }
  
    setSelectedStaff((prev) => {
      const isRemoving = prev.includes(id);
      
    if (isRemoving) {
      console.log(`Unchecked staff ID: ${id}`);
      return prev.filter((item) => item !== id);
    } else {
      // Find the specific staff object using staff_id to log it
      const staffMember = staffs.find((s) => s.staff_id === id);
      console.log("Checked staff:", staffMember);
      return [...prev, id];
    }
    });
  };

  return (
    <>
      {selectedStaff.length > 0 && (
        <div
          className={`transition-all duration-300 mb-4 flex items-center justify-between p-3 rounded-lg ${
            selectedStaff.length > 0
              ? "bg-red-50 border border-red-100 opacity-100"
              : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          <p className="text-sm text-red-700 font-medium">
            {selectedStaff.length} staff member(s) selected
          </p>
          <button
            onClick={handleBulkRemove}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-xs font-bold transition-colors"
          >
            Remove from Team
          </button>
        </div>
      )}
      <div className="hidden lg:flex lg:flex-col">
        <div className="grid grid-cols-8 text-left text-sm bg-gray-100 py-5 rounded-md">
          {/* Checkbox + Name of Staff */}
          <div className="col-span-2 w-full pl-5 flex items-center gap-2">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-[#3E4095] cursor-pointer"
            />
            <p>Name of Staff</p>
          </div>

          <p>Staff Id</p>
          <p>Role</p>
          <p>Phone no</p>
          <p>Email Address</p>
          <p>Sex</p>
        </div>

        {staffs.map((staff, index) => (
          <div key={index} className="relative">
            <div className="grid grid-cols-8 items-center text-[12px] text-gray-700 text-left w-full  border-b border-b-gray-200">
              <div className="font-semibold col-span-2 w-full py-6 pl-5 flex items-center gap-2 ">
                {/* ADDED: Individual Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedStaff.includes(staff.staff_id)}
                  onChange={() => toggleStaff(staff.staff_id)}
                  className="w-4 h-4 accent-[#3E4095] cursor-pointer"
                />

                {/* Existing Icon and Name */}
                <div className="flex items-center gap-1">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z"
                      fill="#647284"
                    />
                  </svg>
                  <p>
                      {staff.role === 'doctor'
  ? `Dr. ${staff.firstname} ${staff.lastname}`
  : `${staff.firstname} ${staff.lastname}`}
                
                  </p>
                </div>
              </div>

              <p>{staff.staff_id}</p>
              <p>{staff.role}</p>
              <p>{staff.phone_num}</p>
              <p className="truncate max-w-[120px] ">{staff.email}</p>
              <p>{staff.gender}</p>

              <div className="relative flex justify-center">
                <button
                  onClick={() =>
                    setActiveMenu(activeMenu === staff.staff_id ? null : staff.staff_id)
                  }
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  </svg>
                </button>

                {activeMenu === staff.staff_id && (
                  <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 rounded-md shadow z-50 ">
                    <button
                      onClick={() => handleUpdateRole(index, staff.role)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 hover:rounded-t-md"
                    >
                      Update Role
                    </button>
                    <button
                      onClick={() => handleIndividualRemove(staff)}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium hover:rounded-b-md"
                    >
                      Remove from Team
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="lg:hidden">
        {staffs.length > 0 && (
          <div className="flex items-center gap-2 mb-4 px-2">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleSelectAll}
              className="w-5 h-5 accent-[#3E4095] rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              {allChecked ? "Deselect All" : "Select All Staffs"}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {staffs.map((staff, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-5   transition-all"
            >
              {/* 1. Header: Avatar & Primary Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedStaff.includes(staff.staff_id)}
                    onChange={() => toggleStaff(staff.staff_id)}
                    className="w-5 h-5 accent-[#3E4095] cursor-pointer"
                  />
                  {/* Dynamic Avatar with Initials */}
                  <div className="h-11 w-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3E4095] font-bold text-sm shadow-inner">
                    {staff.firstname?.[0]}
                    {staff.lastname?.[0]}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-[15px] truncate">
                       {staff.role === 'doctor'
  ? `Dr. ${staff.firstname} ${staff.lastname}`
  : `${staff.firstname} ${staff.lastname}`}
               
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-[#3E4095] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {staff.role || "Staff"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        #{staff.staff_id || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sex Badge */}
                <div className="flex items-center gap-2">
                   <div className="bg-gray-100 px-2 py-1 rounded-lg">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">
                    {staff.gender || "—"}
                  </p>
                </div>
                  <div className="relative">
                  <button onClick={() => setActiveMenu(activeMenu === staff.staff_id ? null : staff.staff_id)} className="p-1">
                    <svg width="20" height="20" fill="#647284" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
                  </button>
                  {activeMenu === staff.staff_id && (
                    <div className="absolute right-0 top-8 w-52 bg-white border border-gray-200 rounded-lg shadow z-50 py-2">
                      <button  onClick={() => handleUpdateRole(index, staff.role)} className="w-full text-left px-4 py-3 text-sm border-b border-gray-50 hover:rounded-t-md">Update Role</button>
                      <button onClick={() => handleIndividualRemove(staff)} className="w-full text-left px-4 py-3 text-sm text-red-600 font-bold hover:rounded-b-md">Remove from Team</button>
                    </div>
                  )}
                </div>
                </div>
               

                
              </div>

              {/* 2. Contact Quick-Action Box */}
              <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="bg-white p-1.5 rounded-md shadow-sm">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3E4095"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <p className="text-[12px] font-medium">
                    {staff.phone_num || "No Phone"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="bg-white p-1.5 rounded-md shadow-sm">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3E4095"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <p className="text-[12px] font-medium truncate">
                    {staff.email || "No Email"}
                  </p>
                </div>
              </div>

              {/* 3. Footer Action */}
              <div className="flex gap-2">
                {/* <a 
                        href={`tel:${staff.phone_no}`}
                        className="flex-1 bg-white border border-gray-200 py-2.5 rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold text-gray-700 active:bg-gray-100"
                    >
                        Call
                    </a> */}
                <button className="flex-1 bg-[#3E4095] py-2.5 rounded-full flex items-center justify-center gap-2 text-[12px] font-bold text-white">
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Pagination2
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

     
    </>
  );
};

export default StaffListHospital;
