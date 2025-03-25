import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { Link, useLocation } from "react-router-dom";
import AdminHead from "./Admin Part/AdminHead";
import DynamicDate from "../Dynamic Date/DynamicDate";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminUsersDashbaord = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const [selected, setSelected] = useState("Individuals");
  const [isOpen, setIsOpen] = useState(false);

  const options = ["Individuals", "Hospitals"];

  const isActive = (path = "/admin-home-dashboard") =>
    location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [patientRecord, setPatientRecord] = useState(false);
  const [loading, setLoading] = useState("");

  const itemsPerPage = 20;

  const fetchPatientMedicalRecords = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toast.error("Token not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "https://docuhealth-backend-h03u.onrender.com/api/admin/users/get_all",
        {
          params: {
            page: currentPage,
            size: itemsPerPage,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Determine the correct dataset and total pages based on selection
      if (selected === "Individuals") {
        setRecords(response.data.users.patients.patients);
        setTotalPages(response.data.users.patients.total_pages); // Ensure the API provides this value
      } else {
        setRecords(response.data.users.hospitals.hospitals);
        setTotalPages(response.data.users.hospitals.total_pages); // Ensure the API provides this value
      }

      setPatientRecord(true);
      console.log(response.data);
      toast.success(`${selected} records retrieved successfully!`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Failed to fetch ${selected} records.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch data when currentPage or selected option changes
  useEffect(() => {
    fetchPatientMedicalRecords();
  }, [currentPage, selected]);

  return (
    <div>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={closeSidebar}
          ></div>
        )}

        <aside
          className={`fixed top-0 left-0 min-h-screen w-64 bg-white shadow-lg border z-20 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 sm:translate-x-0 sm:static sm:block`}
        >
          <div className="p-4 flex justify-between items-center  ">
            <div className="flex justify-start items-start gap-2">
              <img src={logo} alt="" />
              <h1 className="text-xl font-bold text-blue-600">DocuHealth</h1>
            </div>
            <div className=" sm:hidden " onClick={closeSidebar}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.9994 15L9 9M9.00064 15L15 9"
                  stroke="#1B2B40"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                  stroke="#1B2B40"
                  stroke-width="1.5"
                />
              </svg>
            </div>
          </div>
          <nav className="mt-4">
            <ul>
              <Link to="/admin-home-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/admin-home-dashboard")
                        ? "bg-[#0000FF] text-white"
                        : "text-gray-700"
                    } text-gray-700 hover:bg-[#0000FF] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
                  >
                    <span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        id="svg"
                        className={`group-hover:fill-white ${
                          isActive("/admin-home-dashboard") ? "fill-white" : ""
                        }`}
                      >
                        <path
                          d="M2.5 10C2.5 10.4602 2.8731 10.8333 3.33333 10.8333H8.33333C8.79358 10.8333 9.16667 10.4602 9.16667 10V3.33333C9.16667 2.8731 8.79358 2.5 8.33333 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V10ZM2.5 16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H8.33333C8.79358 17.5 9.16667 17.1269 9.16667 16.6667V13.3333C9.16667 12.8731 8.79358 12.5 8.33333 12.5H3.33333C2.8731 12.5 2.5 12.8731 2.5 13.33333V16.6667ZM10.8333 16.6667C10.8333 17.1269 11.2064 17.5 11.6667 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V10C17.5 9.53975 17.1269 9.16667 16.6667 9.16667H11.6667C11.2064 9.16667 10.8333 9.53975 10.8333 10V16.6667ZM11.6667 2.5C11.2064 2.5 10.8333 2.8731 10.8333 3.33333V6.66667C10.8333 7.1269 11.2064 7.5 11.6667 7.5H16.6667C17.1269 7.5 17.5 7.1269 17.5 6.66667V3.33333C17.5 2.8731 17.1269 2.5 16.6667 2.5H11.6667Z"
                          className={`group-hover:fill-white ${
                            isActive("/admin-home-dashboard")
                              ? "fill-white"
                              : "fill-[#647284]"
                          }`}
                        />
                      </svg>
                    </span>
                    Overview
                  </li>
                </div>
              </Link>
              <Link to="/admin-users-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/admin-users-dashboard")
                        ? "bg-[#0000FF] text-white"
                        : "text-gray-700"
                    } text-gray-700 hover:bg-[#0000FF] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
                  >
                    <span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`group-hover:fill-white ${
                          isActive("/admin-users-dashboard")
                            ? "fill-white"
                            : "fill-[#647284]"
                        }`}
                      >
                        <path
                          d="M2.50004 5.00016H17.5V15.0002H2.50004V5.00016ZM1.66671 3.3335C1.20647 3.3335 0.833374 3.7066 0.833374 4.16683V15.8335C0.833374 16.2937 1.20647 16.6668 1.66671 16.6668H18.3334C18.7936 16.6668 19.1667 16.2937 19.1667 15.8335V4.16683C19.1667 3.7066 18.7936 3.3335 18.3334 3.3335H1.66671ZM10.8334 6.66683H15.8334V8.3335H10.8334V6.66683ZM15 10.0002H10.8334V11.6668H15V10.0002ZM8.75004 8.3335C8.75004 9.48408 7.8173 10.4168 6.66671 10.4168C5.51612 10.4168 4.58337 9.48408 4.58337 8.3335C4.58337 7.1829 5.51612 6.25016 6.66671 6.25016C7.8173 6.25016 8.75004 7.1829 8.75004 8.3335ZM6.66671 11.2502C5.05587 11.2502 3.75004 12.556 3.75004 14.1668H9.58337C9.58337 12.556 8.27754 11.2502 6.66671 11.2502Z"
                          className={`group-hover:fill-white ${
                            isActive("/admin-users-dashboard")
                              ? "fill-white"
                              : "fill-[#647284]"
                          }`}
                        />
                      </svg>
                    </span>
                    Users
                  </li>
                </div>
              </Link>
              <Link to="/admin-settings-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/admin-settings-dashboard")
                        ? "bg-[#0000FF] text-white"
                        : "text-gray-700"
                    } text-gray-700 hover:bg-[#0000FF] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
                  >
                    <span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`group-hover:fill-white ${
                          isActive("/admin-settings-dashboard")
                            ? "fill-white"
                            : "fill-[#647284]"
                        }`}
                      >
                        <g clip-path="url(#clip0_274_2617)">
                          <path
                            d="M7.2386 3.33324L9.4108 1.16107C9.73621 0.835632 10.2639 0.835632 10.5893 1.16107L12.7615 3.33324H15.8334C16.2936 3.33324 16.6667 3.70634 16.6667 4.16657V7.23848L18.8389 9.41067C19.1643 9.73609 19.1643 10.2638 18.8389 10.5892L16.6667 12.7613V15.8333C16.6667 16.2935 16.2936 16.6666 15.8334 16.6666H12.7615L10.5893 18.8388C10.2639 19.1642 9.73621 19.1642 9.4108 18.8388L7.2386 16.6666H4.1667C3.70646 16.6666 3.33336 16.2935 3.33336 15.8333V12.7613L1.1612 10.5892C0.835754 10.2638 0.835754 9.73609 1.1612 9.41067L3.33336 7.23848V4.16657C3.33336 3.70634 3.70646 3.33324 4.1667 3.33324H7.2386ZM5.00003 4.99991V7.92884L2.92896 9.99992L5.00003 12.071V14.9999H7.92896L10 17.071L12.0711 14.9999H15V12.071L17.0711 9.99992L15 7.92884V4.99991H12.0711L10 2.92884L7.92896 4.99991H5.00003ZM10 13.3333C8.15908 13.3333 6.6667 11.8408 6.6667 9.99992C6.6667 8.15896 8.15908 6.66657 10 6.66657C11.841 6.66657 13.3334 8.15896 13.3334 9.99992C13.3334 11.8408 11.841 13.3333 10 13.3333ZM10 11.6666C10.9205 11.6666 11.6667 10.9204 11.6667 9.99992C11.6667 9.07942 10.9205 8.33326 10 8.33326C9.07955 8.33326 8.33338 9.07942 8.33338 9.99992C8.33338 10.9204 9.07955 11.6666 10 11.6666Z"
                            className={`group-hover:fill-white ${
                              isActive("/admin-settings-dashboard")
                                ? "fill-white"
                                : "fill-[#647284]"
                            }`}
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_274_2617">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                    Settings
                  </li>
                </div>
              </Link>
              <Link to="/admin-subscriptions-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/admin-subscriptions-dashboard")
                        ? "bg-[#0000FF] text-white"
                        : "text-gray-700"
                    } text-gray-700 hover:bg-[#0000FF] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
                  >
                    <span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`group-hover:fill-white ${
                          isActive("/admin-subscriptions-dashboard")
                            ? "fill-white"
                            : "fill-[#647284]"
                        }`}
                        class="group-hover:fill-white"
                      >
                        <path
                          d="M2.50411 2.50244H17.5041C17.9644 2.50244 18.3375 2.87553 18.3375 3.33577V16.6691C18.3375 17.1293 17.9644 17.5024 17.5041 17.5024H2.50411C2.04388 17.5024 1.67078 17.1293 1.67078 16.6691V3.33577C1.67078 2.87553 2.04388 2.50244 2.50411 2.50244ZM3.33744 4.16911V15.8357H16.6708V4.16911H3.33744ZM7.08744 11.6691H11.6708C11.9009 11.6691 12.0875 11.4826 12.0875 11.2524C12.0875 11.0223 11.9009 10.8357 11.6708 10.8357H8.33746C7.18685 10.8357 6.25411 9.90307 6.25411 8.7524C6.25411 7.60184 7.18685 6.66911 8.33746 6.66911H9.17079V5.00244H10.8375V6.66911H12.9208V8.33573H8.33746C8.10733 8.33573 7.92078 8.52232 7.92078 8.7524C7.92078 8.98257 8.10733 9.16907 8.33746 9.16907H11.6708C12.8214 9.16907 13.7541 10.1018 13.7541 11.2524C13.7541 12.4031 12.8214 13.3357 11.6708 13.3357H10.8375V15.0024H9.17079V13.3357H7.08744V11.6691Z"
                          className={`group-hover:fill-white ${
                            isActive("/admin-subscriptions-dashboard")
                              ? "fill-white"
                              : "fill-[#647284]"
                          }`}
                        />
                      </svg>
                    </span>
                    Subscriptions Mgt.
                  </li>
                </div>
              </Link>
              <Link to="/admin-logout-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/admin-logout-dashboard")
                        ? "bg-[#0000FF] text-white"
                        : "text-gray-700"
                    } text-gray-700 hover:bg-[#0000FF] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`group-hover:fill-white ${
                        isActive("/admin-logout-dashboard")
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    >
                      <path
                        d="M3.33329 12.4998H4.99996V16.6665H15V3.33317H4.99996V7.49984H3.33329V2.49984C3.33329 2.0396 3.70639 1.6665 4.16663 1.6665H15.8333C16.2935 1.6665 16.6666 2.0396 16.6666 2.49984V17.4998C16.6666 17.9601 16.2935 18.3332 15.8333 18.3332H4.16663C3.70639 18.3332 3.33329 17.9601 3.33329 17.4998V12.4998ZM8.33329 9.1665V6.6665L12.5 9.99984L8.33329 13.3332V10.8332H1.66663V9.1665H8.33329Z"
                        className={`group-hover:fill-white ${
                          isActive("/admin-logout-dashboard")
                            ? "fill-white"
                            : "fill-[#647284]"
                        }`}
                      />
                    </svg>
                    Log-out
                  </li>
                </div>
              </Link>
            </ul>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <AdminHead
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            closeSidebar={closeSidebar}
          />

          {/* Content */}
          <section className="p-8">
            <div className="flex flex-col md:flex-row justify-start items-start md:justify-between md:items-center gap-3">
              <div className=" sm:p-0">
                <DynamicDate />
              </div>
              <div>
                <div className="relative inline-block text-left">
                  <button
                    className="border border-[#0000FF] text-[#0000FF] py-2 px-4 rounded-full flex items-center gap-2"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {selected} <ChevronDown className="w-4 h-4" />
                  </button>

                  {isOpen && (
                    <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md">
                      {options.map((option) => (
                        <button
                          key={option}
                          className="block w-full px-4 py-2 text-left hover:bg-blue-100"
                          onClick={() => {
                            setSelected(option);
                            setIsOpen(false);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden sm:block bg-white my-10 p-4 rounded-md border ">
              {loading ? (
                <p>Loading records...</p>
              ) : records?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse  border-gray-200">
                    <thead className="bg-[#FAFAFA] ">
                      <tr className=" ">
                        <th className=" border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                          Name
                        </th>
                        <th className=" border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                          {selected === "Individuals" ? "Email" : "Address"}
                        </th>
                        <th className=" border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                          {selected === "Individuals" ? "Phone" : "Email"}
                        </th>
                        <th className=" border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                          {selected === "Individuals"
                            ? "D.O.B"
                            : "No Of Doctors"}
                        </th>
                        <th className=" border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                          {selected === "Individuals"
                            ? "HIN"
                            : "Other Personnel"}
                        </th>
                        <th className=" border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                          {selected === "Individuals" ? "Sex" : ""}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.record_id} className="hover:bg-gray-50">
                          <td className="border-gray-200 px-4 py-5 text-sm text-gray-800">
                            {selected === "Individuals"
                              ? record.fullname
                              : record.name}
                          </td>

                          <td className="border-gray-200 px-4 py-5 text-sm text-gray-800">
                            {selected === "Individuals"
                              ? record.email
                              : record.address}
                          </td>

                          <td className="border-gray-200 px-4 py-5 text-sm text-gray-800">
                            {selected === "Individuals"
                              ? record.phone_num
                              : record.email}
                          </td>

                          <td className="border-gray-200 px-4 py-5 text-sm text-gray-800 text-center">
                            {selected === "Individuals"
                              ? record.DOB
                              : record.doctors?.value || "N/A"}
                          </td>

                          <td className="border-gray-200 px-4 py-5 text-sm text-gray-800 text-center">
                            {selected === "Individuals"
                              ? record.HIN_truncated + "************"
                              : record.others?.value || "N/A"}
                          </td>

                          <td className="border-gray-200 px-4 py-5 text-sm text-gray-800">
                            {record.sex || ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No records found.</p>
              )}
                 {/* Pagination Controls */}
                 {totalPages > 1 && (
                  <div className="flex flex-col md:flex-row gap-3 justify-between items-center my-4">
                    {/* Pagination Info */}
                    <span className="text-gray-500 text-sm">
                      Showing page {currentPage} of {totalPages} entries
                    </span>

                    {/* Pagination Buttons */}
                    <div className="flex items-center">
                      {/* Previous Button */}
                      <button
                        className={`px-3 py-1 mx-1 rounded-full ${
                          currentPage === 1
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        &lt;
                      </button>

                      {/* Page Numbers */}
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={`px-3 py-1 mx-1 rounded-full ${
                            currentPage === i + 1
                              ? "bg-[#0000FF] text-white"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}

                      {/* Next Button */}
                      <button
                        className={`px-3 py-1 mx-1 rounded-full ${
                          currentPage === totalPages
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminUsersDashbaord;