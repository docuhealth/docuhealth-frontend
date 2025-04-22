import React, { useState, useEffect } from "react";
import logo from "../assets/img/logo.png";
import { Link, useLocation } from "react-router-dom";
import AdminHead from "./Admin Part/AdminHead";
import DynamicDate from "../Components/Dynamic Date/DynamicDate";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminSideBar from "../Components/AdminSideBar/AdminSideBar";

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

        <AdminSideBar
          isSidebarOpen={isSidebarOpen}
          closeSidebar={closeSidebar}
          isActive={isActive}
        />
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
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
