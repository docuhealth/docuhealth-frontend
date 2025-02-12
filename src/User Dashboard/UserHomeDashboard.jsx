import React, { useState, useEffect } from "react";
import UserDashHead from "./Dashboard Part/UserDashHead";
import { Link, useLocation } from "react-router-dom";
import DynamicDate from "../Dynamic Date/DynamicDate";
import logo from "../assets/logo.png";
import { toast } from "react-toastify";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const UserHomeDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hin, setHin] = useState("Loading..");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("fetching...");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(null);
   const [datainfo, setDataInfo] = useState("");

  const location = useLocation();

  const isActive = (path = "/user-home-dashboard") =>
    location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

    useEffect(() => {
      const fetchPatientDashboard = async (page = 1, size = 10) => {
        // Retrieve the JWT token from localStorage
        const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your token key
        const role = "patient"; // Replace with the required role
  
        try {
          // Construct the URL with query parameters
          const url = `https://docuhealth-backend.onrender.com/api/patient/dashboard?page=${page}&size=${size}`;
  
          // Make the GET request
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwtToken}`, // Add JWT token to the Authorization header
              Role: role, // Add role to the headers
            },
          });
  
          // Handle the response
          if (response.ok) {
            const data = await response.json();
            setDataInfo(data);
  
            // Display a success message or process the data as needed
            return data;
          } else {
            const errorData = await response.json();
            console.error("Failed to fetch dashboard data:", errorData);
  
            // Handle errors with a message from the API
            throw new Error(
              errorData.message || "Failed to fetch dashboard data."
            );
          }
        } catch (error) {
          console.error("An unexpected error occurred:", error);
  
          // Handle unexpected errors
          throw error;
        } finally {
          console.log(datainfo);
        }
      };
  
      // Example Usage
      fetchPatientDashboard(1, 10);
    }, []);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const [noticeDisplay, setNoticeDisplay] = useState(false);

  useEffect(() => {
    // Show notice immediately when the dashboard loads
    setNoticeDisplay(true);

    // Then show the notice every 24 hours (1 day)
    const interval = setInterval(() => {
      setNoticeDisplay(true);
    }, 86400000); // 86,400,000 ms = 24 hours

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  useEffect(() => {
    const fetchPatientDashboard = async (page = 1, size = 10) => {
      // Retrieve the JWT token from localStorage
      const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your token key
      const role = "patient"; // Replace with the required role

      try {
        // Construct the URL with query parameters
        const url = `https://docuhealth-backend.onrender.com/api/patient/dashboard?page=${page}&size=${size}`;

        // Make the GET request
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`, // Add JWT token to the Authorization header
            Role: role, // Add role to the headers
          },
        });

        // Handle the response
        if (response.ok) {
          const data = await response.json();
          // console.log("Patient Dashboard Data:", data);
          setHin(data.HIN);
          // Display a success message or process the data as needed
          return data;
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch dashboard data:", errorData);

          // Handle errors with a message from the API
          throw new Error(
            errorData.message || "Failed to fetch dashboard data."
          );
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);

        // Handle unexpected errors
        throw error;
      }
    };

    // Example Usage
    fetchPatientDashboard(1, 10);
  }, []);

  const closeNoticeMessage = () => {
    setNoticeDisplay(false);
  };

  const noticeMessage = [
    {
      title: "Health Identification Number (HIN)",
      details:
        "Your Health Identification Number (HIN) is your personal information which can be accessed by you alone on your dashboard. Protect it at all cost because it is the key to easily accessing your medical history. Dont share it with anyone except with a trusted medical personnel.",
      by: "DocuHealth (admin)",
    },
  ];

  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10;

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
        "https://docuhealth-backend.onrender.com/api/patient/dashboard",

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

      setRecords(response.data.records);
      setTotalPages(response.data.total_pages);

      console.log(response.data.records);
      console.log(response.data);
      toast.success("Patient medical records retrieved successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch patient medical records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientMedicalRecords();
  }, [currentPage]);

  const togglePopover = (recordId) => {
    setPopoverVisible((prev) => (prev === recordId ? null : recordId));
    setSelectedRecord(records.find((r) => r._id === recordId) || null);
  };

  const exportToPDF = () => {
    console.log(records);
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#1E90FF"); // Blue color
    doc.text(`Medical Record Summary Details`, 105, 15, { align: "center" });

    doc.setLineWidth(0.5);
    doc.setDrawColor("#1E90FF"); // Blue color
    doc.line(20, 20, 190, 20); // Horizontal line below the header

    // Add Sub-header for Record Details
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#333333"); // Gray color
    doc.text(`${name} Hospital`, 20, 30);

    // Add Patient and Record Information
    doc.setFontSize(12);
    doc.text(
      `Date: ${new Date(selectedRecord.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      20,
      40
    );

    doc.text(
      `Time: ${(() => {
        const time = new Date(selectedRecord.created_at);
        const hours = time.getHours();
        const minutes = time.getMinutes().toString().padStart(2, "0");
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes} ${period}`;
      })()}`,
      20,
      45
    );

    doc.text(
      `Name of Patient: ${selectedRecord.patient_info.fullname}`,
      20,
      55
    );
    doc.text(`Gender: ${selectedRecord.patient_info.sex}`, 20, 60);

    // Add Medical Details Section
    doc.setFontSize(14);
    doc.setTextColor("#1E90FF");
    doc.text("Medical Details", 20, 70);

    doc.setDrawColor("#1E90FF");
    doc.line(20, 72, 190, 72);

    doc.setFontSize(12);
    doc.setTextColor("#333333");
    doc.text(`Pulse Rate: ${selectedRecord.basic_info.pulse_rate}`, 20, 80);
    doc.text(`Temperature: ${selectedRecord.basic_info.temperature}`, 20, 85);
    doc.text(
      `Respiratory Rate: ${selectedRecord.basic_info.respiratory_rate}`,
      20,
      90
    );
    doc.text(`Weight: ${selectedRecord.basic_info.weight}`, 20, 95);
    doc.text(
      `Blood Pressure: ${selectedRecord.basic_info.blood_pressure} MM HG`,
      20,
      100
    );
    doc.text(`Diagnosis: ${selectedRecord.basic_info.diagnosis}`, 20, 105);

    // Add Summary Section
    doc.setFontSize(14);
    doc.setTextColor("#1E90FF");
    doc.text("Summary of Diagnosis/Treatment", 20, 115);
    doc.setDrawColor("#1E90FF");
    doc.line(20, 117, 190, 117);

    doc.setFontSize(12);
    doc.setTextColor("#333333");

    // Dynamically adjust vertical spacing for summary
    const summaryLines = doc.splitTextToSize(selectedRecord.summary, 170);
    const summaryYStart = 125;
    doc.text(summaryLines, 20, summaryYStart);

    // Add Doctor and Hospital Details below the summary
    const afterSummaryY = summaryYStart + summaryLines.length * 6;
    doc.text(
      `Attended to by: ${selectedRecord.hospital_info.medical_personnel}`,
      20,
      afterSummaryY + 10
    );
    doc.text(`Hospital: ${name} Hospital`, 20, afterSummaryY + 20);
    doc.text(
      `Hospital Address: ${selectedRecord.hospital_info.address}`,
      20,
      afterSummaryY + 30
    );

    // Add Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor("#808080");
    doc.text(
      "Generated by DocuHealth Records System. Confidential and for authorized use only.",
      105,
      290,
      { align: "center" }
    );

    // Save the PDF
    doc.save(`${name}-hospital-record.pdf`);
  };

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
              <Link to="/user-home-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/user-home-dashboard")
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
                          isActive("/user-home-dashboard") ? "fill-white" : ""
                        }`}
                      >
                        <path
                          d="M2.5 10C2.5 10.4602 2.8731 10.8333 3.33333 10.8333H8.33333C8.79358 10.8333 9.16667 10.4602 9.16667 10V3.33333C9.16667 2.8731 8.79358 2.5 8.33333 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V10ZM2.5 16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H8.33333C8.79358 17.5 9.16667 17.1269 9.16667 16.6667V13.3333C9.16667 12.8731 8.79358 12.5 8.33333 12.5H3.33333C2.8731 12.5 2.5 12.8731 2.5 13.33333V16.6667ZM10.8333 16.6667C10.8333 17.1269 11.2064 17.5 11.6667 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V10C17.5 9.53975 17.1269 9.16667 16.6667 9.16667H11.6667C11.2064 9.16667 10.8333 9.53975 10.8333 10V16.6667ZM11.6667 2.5C11.2064 2.5 10.8333 2.8731 10.8333 3.33333V6.66667C10.8333 7.1269 11.2064 7.5 11.6667 7.5H16.6667C17.1269 7.5 17.5 7.1269 17.5 6.66667V3.33333C17.5 2.8731 17.1269 2.5 16.6667 2.5H11.6667Z"
                          className={`group-hover:fill-white ${
                            isActive("/user-home-dashboard")
                              ? "fill-white"
                              : "fill-[#647284]"
                          }`}
                        />
                      </svg>
                    </span>
                    My Medical Record
                  </li>
                </div>
              </Link>
              <Link to="/user-sub-account" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/user-sub-account")
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
                          isActive("/user-sub-account")
                            ? "fill-white"
                            : "fill-[#647284]"
                        }`}
                      >
                        <path
                          d="M1.66675 18.3333C1.66675 14.6514 4.65151 11.6667 8.33341 11.6667C12.0153 11.6667 15.0001 14.6514 15.0001 18.3333H13.3334C13.3334 15.5719 11.0948 13.3333 8.33341 13.3333C5.57199 13.3333 3.33341 15.5719 3.33341 18.3333H1.66675ZM8.33341 10.8333C5.57091 10.8333 3.33341 8.59583 3.33341 5.83333C3.33341 3.07083 5.57091 0.833333 8.33341 0.833333C11.0959 0.833333 13.3334 3.07083 13.3334 5.83333C13.3334 8.59583 11.0959 10.8333 8.33341 10.8333ZM8.33341 9.16667C10.1751 9.16667 11.6667 7.675 11.6667 5.83333C11.6667 3.99167 10.1751 2.5 8.33341 2.5C6.49175 2.5 5.00008 3.99167 5.00008 5.83333C5.00008 7.675 6.49175 9.16667 8.33341 9.16667ZM15.2365 12.2523C17.5537 13.2967 19.1667 15.6267 19.1667 18.3333H17.5001C17.5001 16.3033 16.2903 14.5559 14.5524 13.7726L15.2365 12.2523ZM14.6636 2.84434C16.3287 3.53086 17.5001 5.16967 17.5001 7.08333C17.5001 9.47517 15.6702 11.4377 13.3334 11.648V9.9705C14.7473 9.7685 15.8334 8.55333 15.8334 7.08333C15.8334 5.93279 15.1681 4.93836 14.2009 4.46362L14.6636 2.84434Z"
                          className={`group-hover:fill-white ${
                            isActive("/user-sub-account")
                              ? "fill-white"
                              : "fill-[#647284]"
                          }`}
                        />
                      </svg>
                    </span>
                    Sub-Accounts
                  </li>
                </div>
              </Link>
              <Link to="/user-settings-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/user-settings-dashboard")
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
                          isActive("/user-settings-dashboard")
                            ? "fill-white"
                            : "fill-[#647284]"
                        }`}
                      >
                        <g clip-path="url(#clip0_274_2617)">
                          <path
                            d="M7.2386 3.33324L9.4108 1.16107C9.73621 0.835632 10.2639 0.835632 10.5893 1.16107L12.7615 3.33324H15.8334C16.2936 3.33324 16.6667 3.70634 16.6667 4.16657V7.23848L18.8389 9.41067C19.1643 9.73609 19.1643 10.2638 18.8389 10.5892L16.6667 12.7613V15.8333C16.6667 16.2935 16.2936 16.6666 15.8334 16.6666H12.7615L10.5893 18.8388C10.2639 19.1642 9.73621 19.1642 9.4108 18.8388L7.2386 16.6666H4.1667C3.70646 16.6666 3.33336 16.2935 3.33336 15.8333V12.7613L1.1612 10.5892C0.835754 10.2638 0.835754 9.73609 1.1612 9.41067L3.33336 7.23848V4.16657C3.33336 3.70634 3.70646 3.33324 4.1667 3.33324H7.2386ZM5.00003 4.99991V7.92884L2.92896 9.99992L5.00003 12.071V14.9999H7.92896L10 17.071L12.0711 14.9999H15V12.071L17.0711 9.99992L15 7.92884V4.99991H12.0711L10 2.92884L7.92896 4.99991H5.00003ZM10 13.3333C8.15908 13.3333 6.6667 11.8408 6.6667 9.99992C6.6667 8.15896 8.15908 6.66657 10 6.66657C11.841 6.66657 13.3334 8.15896 13.3334 9.99992C13.3334 11.8408 11.841 13.3333 10 13.3333ZM10 11.6666C10.9205 11.6666 11.6667 10.9204 11.6667 9.99992C11.6667 9.07942 10.9205 8.33326 10 8.33326C9.07955 8.33326 8.33338 9.07942 8.33338 9.99992C8.33338 10.9204 9.07955 11.6666 10 11.6666Z"
                            className={`group-hover:fill-white ${
                              isActive("/user-settings-dashboard")
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
              <Link to="/user-subscriptions-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/user-subscriptions-dashboard")
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
                          isActive("/user-subscriptions-dashboard")
                            ? "fill-white"
                            : "fill-[#647284]"
                        }`}
                      >
                        <path
                          d="M2.50411 2.50244H17.5041C17.9644 2.50244 18.3375 2.87553 18.3375 3.33577V16.6691C18.3375 17.1293 17.9644 17.5024 17.5041 17.5024H2.50411C2.04388 17.5024 1.67078 17.1293 1.67078 16.6691V3.33577C1.67078 2.87553 2.04388 2.50244 2.50411 2.50244ZM3.33744 4.16911V15.8357H16.6708V4.16911H3.33744ZM7.08744 11.6691H11.6708C11.9009 11.6691 12.0875 11.4826 12.0875 11.2524C12.0875 11.0223 11.9009 10.8357 11.6708 10.8357H8.33746C7.18685 10.8357 6.25411 9.90307 6.25411 8.7524C6.25411 7.60184 7.18685 6.66911 8.33746 6.66911H9.17079V5.00244H10.8375V6.66911H12.9208V8.33573H8.33746C8.10733 8.33573 7.92078 8.52232 7.92078 8.7524C7.92078 8.98257 8.10733 9.16907 8.33746 9.16907H11.6708C12.8214 9.16907 13.7541 10.1018 13.7541 11.2524C13.7541 12.4031 12.8214 13.3357 11.6708 13.3357H10.8375V15.0024H9.17079V13.3357H7.08744V11.6691Z"
                          className={`group-hover:fill-white ${
                            isActive("/user-subscriptions-dashboard")
                              ? "fill-white"
                              : "fill-[#647284]"
                          }`}
                        />
                      </svg>
                    </span>
                    Subscriptions
                  </li>
                </div>
              </Link>
              <Link to="/user-logout-dashboard" onClick={closeSidebar}>
                <div className="px-4 my-4">
                  <li
                    className={`group px-4 py-2   ${
                      isActive("/user-logout-dashboard")
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
                        isActive("/user-logout-dashboard")
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    >
                      <path
                        d="M3.33329 12.4998H4.99996V16.6665H15V3.33317H4.99996V7.49984H3.33329V2.49984C3.33329 2.0396 3.70639 1.6665 4.16663 1.6665H15.8333C16.2935 1.6665 16.6666 2.0396 16.6666 2.49984V17.4998C16.6666 17.9601 16.2935 18.3332 15.8333 18.3332H4.16663C3.70639 18.3332 3.33329 17.9601 3.33329 17.4998V12.4998ZM8.33329 9.1665V6.6665L12.5 9.99984L8.33329 13.3332V10.8332H1.66663V9.1665H8.33329Z"
                        className={`group-hover:fill-white ${
                          isActive("/user-logout-dashboard")
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
          <UserDashHead
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            closeSidebar={closeSidebar}
          />

          {/* Content */}
          <section className="p-8">
            {noticeDisplay && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative max-h-[80vh] overflow-y-auto mx-5">
                  {noticeMessage.map((message, index) => (
                    <div key={index} className="">
                      {" "}
                      <div className="flex justify-between items-center gap-2 pb-2">
                        <div className="flex justify-start items-center gap-2 ">
                          <p>
                            <i className="bx bx-info-circle text-3xl"></i>
                          </p>
                          <p className="font-semibold">
                            Health Identification <br /> Number (HIN)
                          </p>
                        </div>
                        <div>
                          <i
                            class="bx bx-x text-2xl cursor-pointer"
                            onClick={closeNoticeMessage}
                          ></i>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 pb-4">
                          {message.details}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-normal">{message.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10">
              <div className="pb-3 sm:p-0 w-full sm:w-auto">
                <DynamicDate />
              </div>
              <div className="w-full sm:w-auto">
                <p>HIN : {hin}</p>
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <div className="hidden lg:block overflow-x-auto mx-3">
                  {loading ? (
                    <p className="text-center py-4">Loading...</p>
                  ) : records === "No medical records" ? (
                    <p className="text-center py-4">
                      No medical records found.
                    </p>
                  ) : (
                    <div className="space-y-4">
                     
                      {Array.isArray(records) && records.length > 0 ? (
                        records.map((record) => (
                          <div
                            key={record._id}
                            className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between space-x-4"
                          >
                            {/* Date and Time */}
                            <div className="text-gray-700">
                              <span className="font-semibold">
                                {new Date(record.created_at)
                                  .toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })
                                  .replace(/^\d{2}/, (day) =>
                                    day.padStart(2, "0")
                                  )}
                              </span>
                              <p className="text-sm text-gray-500">
                                {(() => {
                                  const time = new Date(record.created_at);
                                  const hours = time.getHours();
                                  const minutes = time
                                    .getMinutes()
                                    .toString()
                                    .padStart(2, "0");
                                  const period = hours >= 12 ? "PM" : "AM";
                                  const formattedHours = hours % 12 || 12;
                                  return `${formattedHours}:${minutes} ${period}`;
                                })()}
                              </p>
                            </div>

                            {/* Vertical Divider */}
                            <div className="border-l h-12 border-gray-300"></div>

                            {/* Diagnosis */}
                            <div className="text-gray-700 truncate">
                              <span className="font-medium">Diagnosis:</span>
                              <p>{record.basic_info.diagnosis}</p>
                            </div>

                            {/* Vertical Divider */}
                            <div className="border-l h-12 border-gray-300"></div>

                            {/* Hospital Name */}
                            <div className="text-gray-700 truncate">
                              <span className="font-medium">
                                Name of Hospital:
                              </span>
                              <p>{record.hospital_info.name + ' Hospital'}</p>
                            </div>

                            {/* Vertical Divider */}
                            <div className="border-l h-12 border-gray-300"></div>

                            {/* Medical Personnel */}
                            <div className="text-gray-700 truncate">
                              <span className="font-medium">
                                Medical Personnel:
                              </span>
                              <p>{record.hospital_info.medical_personnel}</p>
                            </div>

                            {/* Vertical Divider */}
                            <div className="border-l h-12 border-gray-300"></div>

                            {/* Summary */}
                            <div className="text-gray-700 truncate max-w-xs">
                              <span className="font-medium">
                                Summary/Treatment:
                              </span>
                              <p>{record.summary}</p>
                            </div>

                            {/* Vertical Divider */}
                            <div className="border-l h-12 border-gray-300"></div>

                            {/* More Options */}
                            <div
                              className="text-gray-700 max-w-xs"
                              onClick={() => togglePopover(record._id)}
                            >
                              <p>
                                <i className="bx bx-dots-vertical-rounded cursor-pointer"></i>
                              </p>
                            </div>
                            {popoverVisible === record._id && (
                              <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
                                <div className="bg-white shadow-lg rounded-lg p-5 relative max-h-[80vh] overflow-y-auto  ">
                                  <div className="flex justify-between items-center">
                                    <div className="flex justify-start items-center gap-2">
                                      <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center p-1">
                                       {datainfo?.fullname
                ? datainfo.fullname
                    .split(" ")
                    .map((word) => (word ? word[0].toUpperCase() : "")) // Add safeguard for empty strings
                    .join("")
                : ""}
                                      </div>

                                      <div>
                                        <p className="font-semibold text-md">
                                          {selectedRecord.hospital_info.name} Hospital
                                        </p>
                                        <div className="text-[12px] flex items-center gap-1 text-gray-400">
                                          <p>
                                            <span className="">
                                              {new Date(record.created_at)
                                                .toLocaleDateString("en-GB", {
                                                  day: "2-digit",
                                                  month: "long",
                                                  year: "numeric",
                                                })
                                                .replace(/^\d{2}/, (day) =>
                                                  day.padStart(2, "0")
                                                )}
                                            </span>
                                          </p>
                                          <p className=" text-gray-500">
                                            {(() => {
                                              const time = new Date(
                                                `${record.created_at}`
                                              ); // Combine date and time
                                              const hours = time.getHours(); // Extract hours
                                              const minutes = time
                                                .getMinutes()
                                                .toString()
                                                .padStart(2, "0"); // Extract and format minutes
                                              const period =
                                                hours >= 12 ? "PM" : "AM"; // Determine AM or PM
                                              const formattedHours =
                                                hours % 12 || 12; // Convert to 12-hour format (midnight = 12)
                                              return `${formattedHours}:${minutes} ${period}`; // Return formatted time
                                            })()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        className="bg-[#0000FF] py-1 px-3 text-white rounded-full cursor-pointer"
                                        onClick={exportToPDF}
                                      >
                                        Export as pdf
                                      </button>
                                      <p
                                        onClick={() => setPopoverVisible(null)}
                                      >
                                        <i className="bx bx-x text-2xl text-black cursor-pointer"></i>
                                      </p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 p-4">
                                    {/* Pulse Rate */}
                                    <div>
                                      <label className="block text-gray-600 text-sm font-medium">
                                        Pulse Rate
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          selectedRecord.basic_info.pulse_rate
                                        }
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                      />
                                    </div>

                                    {/* Temperature */}
                                    <div>
                                      <label className="block text-gray-600 text-sm font-medium">
                                        Temperature
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          selectedRecord.basic_info.temperature
                                        }
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                      />
                                    </div>

                                    {/* Respiratory Rate */}
                                    <div>
                                      <label className="block text-gray-600 text-sm font-medium">
                                        Respiratory Rate (RR)
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          selectedRecord.basic_info
                                            .respiratory_rate
                                        }
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                      />
                                    </div>

                                    {/* Weight */}
                                    <div>
                                      <label className="block text-gray-600 text-sm font-medium">
                                        Weight
                                      </label>
                                      <input
                                        type="text"
                                        value={selectedRecord.basic_info.weight}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                      />
                                    </div>

                                    {/* Blood Pressure */}
                                    <div>
                                      <label className="block text-gray-600 text-sm font-medium">
                                        Blood Pressure
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          selectedRecord.basic_info
                                            .blood_pressure + "MM HG"
                                        }
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                      />
                                    </div>

                                    {/* Diagnosis */}
                                    <div>
                                      <label className="block text-gray-600 text-sm font-medium">
                                        Diagnosis
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          selectedRecord.basic_info.diagnosis
                                        }
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                      />
                                    </div>

                                    {/* Summary/Treatment Plan */}
                                    <div className="col-span-2">
                                      <label className="block text-gray-600 text-sm font-medium">
                                        Summary/Treatment Plan
                                      </label>
                                      <textarea
                                        value={selectedRecord.summary}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 h-24 focus:outline-none"
                                      ></textarea>
                                    </div>

                                    {/* Name of Patient */}
                                    <div>
                                      <label className="block text-gray-600 text-sm font-medium">
                                        Name of Patient
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          selectedRecord.patient_info.fullname
                                        }
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                      />
                                    </div>

                                    {/* Gender */}
                                    <div>
                                      <label className="block text-gray-600 text-sm font-medium">
                                        Gender
                                      </label>
                                      <input
                                        type="text"
                                        value={selectedRecord.patient_info.sex}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                      />
                                    </div>

                                    {/* Name of Medical Personnel */}
                                    <div className="col-span-2">
                                      <label className="block text-gray-600 text-sm font-medium">
                                        Name of Medical Personnel
                                      </label>
                                      <input
                                        type="text"
                                        value={
                                          selectedRecord.hospital_info
                                            .medical_personnel
                                        }
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                      />
                                    </div>

                                    {/* Attachment */}
                                    <div className="col-span-2">
                                      <label className="block text-gray-600 text-sm font-medium">
                                        Attachment
                                      </label>
                                      <input
                                        type="text"
                                        value="NIL"
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-center py-4">
                          No medical records available.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="block lg:hidden space-y-4">
                  {loading ? (
                    <p className="text-gray-500 text-center">
                      Loading medical records...
                    </p>
                  ) : records === "No medical records" ? (
                    <p className="text-center py-4">
                      No medical records found.
                    </p>
                  ) : (
                    <div>
                      
                      {records.map((record) => (
                        <div
                          key={record._id}
                          className="bg-white shadow-md rounded-lg p-4 flex flex-col mb-4 space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4"
                        >
                          <div className="flex justify-between">
                            {/* Date and Time */}
                            <div className="text-gray-700">
                              <span className="font-semibold">
                                {new Date(record.created_at)
                                  .toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })
                                  .replace(/^\d{2}/, (day) =>
                                    day.padStart(2, "0")
                                  )}
                              </span>
                              <p className="text-sm text-gray-500">
                                {(() => {
                                  const time = new Date(`${record.created_at}`); // Combine date and time
                                  const hours = time.getHours(); // Extract hours
                                  const minutes = time
                                    .getMinutes()
                                    .toString()
                                    .padStart(2, "0"); // Extract and format minutes
                                  const period = hours >= 12 ? "PM" : "AM"; // Determine AM or PM
                                  const formattedHours = hours % 12 || 12; // Convert to 12-hour format (midnight = 12)
                                  return `${formattedHours}:${minutes} ${period}`; // Return formatted time
                                })()}
                              </p>
                            </div>

                            <div className="text-gray-700  max-w-xs">
                              <p>
                                <i
                                  class="bx bx-dots-vertical-rounded cursor-pointer"
                                  onClick={() => {
                                    togglePopover(record._id);
                                  }}
                                ></i>
                              </p>
                            </div>
                          </div>
                          {popoverVisible === record._id && (
                        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
                          <div className="bg-white shadow-lg rounded-lg p-5 relative max-h-[80vh] overflow-y-auto w-[90%] sm:w-[60%]">
                            <div className="flex justify-between items-center">
                              <div className="">
                            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center p-1">
                            {datainfo?.fullname
                ? datainfo.fullname
                    .split(" ")
                    .map((word) => (word ? word[0].toUpperCase() : "")) // Add safeguard for empty strings
                    .join("")
                : ""}
                                </div>
                              <div>
                                <p className="font-semibold text-md">
                                  {selectedRecord.hospital_info.name} Hospital
                                </p>
                                <div className="text-[12px] flex items-center gap-1 text-gray-400">
                                  <p>
                                    <span className="font-medium"></span>{" "}
                                    {new Date(selectedRecord.created_at)
                                      .toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                      })
                                      .replace(/^\d{2}/, (day) =>
                                        day.padStart(2, "0")
                                      )}
                                  </p>
                                  <p>
                                    <span className="font-medium"></span>{" "}
                                    {(() => {
                                      const time = new Date(
                                        `${record.created_at}`
                                      ); // Combine date and time
                                      const hours = time.getHours(); // Extract hours
                                      const minutes = time
                                        .getMinutes()
                                        .toString()
                                        .padStart(2, "0"); // Extract and format minutes
                                      const period = hours >= 12 ? "PM" : "AM"; // Determine AM or PM
                                      const formattedHours = hours % 12 || 12; // Convert to 12-hour format (midnight = 12)
                                      return `${formattedHours}:${minutes} ${period}`; // Return formatted time
                                    })()}
                                  </p>
                                </div>
                              </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  className="bg-[#0000FF] py-1 px-3 text-white rounded-full cursor-pointer"
                                  onClick={exportToPDF}
                                >
                                  Export as pdf
                                </button>
                                <p onClick={() => setPopoverVisible(null)}>
                                  <i className="bx bx-x text-2xl text-black cursor-pointer"></i>
                                </p>
                              </div>
                            </div>
                            {/* Responsive Grid Layout */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                              {/* Pulse Rate */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Pulse Rate
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.basic_info.pulse_rate}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Temperature */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Temperature
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.basic_info.temperature}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Respiratory Rate */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Respiratory Rate (RR)
                                </label>
                                <input
                                  type="text"
                                  value={
                                    selectedRecord.basic_info.respiratory_rate
                                  }
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Weight */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Weight
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.basic_info.weight}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Blood Pressure */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Blood Pressure
                                </label>
                                <input
                                  type="text"
                                  value={
                                    selectedRecord.basic_info.blood_pressure +
                                    "MM HG"
                                  }
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Diagnosis */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Diagnosis
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.basic_info.diagnosis}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Summary/Treatment Plan */}
                              <div className="col-span-1 sm:col-span-2">
                                <label className="block text-gray-600 text-sm font-medium">
                                  Summary/Treatment Plan
                                </label>
                                <textarea
                                  value={selectedRecord.summary}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 h-24 focus:outline-none"
                                ></textarea>
                              </div>

                              {/* Name of Patient */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Name of Patient
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.patient_info.fullname}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Gender */}
                              <div>
                                <label className="block text-gray-600 text-sm font-medium">
                                  Gender
                                </label>
                                <input
                                  type="text"
                                  value={selectedRecord.patient_info.sex}
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Name of Medical Personnel */}
                              <div className="col-span-1 sm:col-span-2">
                                <label className="block text-gray-600 text-sm font-medium">
                                  Name of Medical Personnel
                                </label>
                                <input
                                  type="text"
                                  value={
                                    selectedRecord.hospital_info
                                      .medical_personnel
                                  }
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>

                              {/* Attachment */}
                              <div className="col-span-1 sm:col-span-2">
                                <label className="block text-gray-600 text-sm font-medium">
                                  Attachment
                                </label>
                                <input
                                  type="text"
                                  value="NIL"
                                  readOnly
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                          <div className="grid grid-cols-1 gap-y-2 sm:flex sm:space-x-4 sm:items-center ">
                            {/* Name of Hospital */}
                            <div>
                              <span className="text-gray-500 block text-sm">
                                Name of Hospital
                              </span>
                              <p className="text-gray-700 font-medium">
                                {record.hospital_info.name + " Hospital"}
                              </p>
                            </div>

                            {/* Diagnosis */}
                            <div>
                              <span className="text-gray-500 block text-sm">
                                Diagnosis
                              </span>
                              <p className="text-gray-700 font-medium">
                                {record.basic_info.diagnosis}
                              </p>
                            </div>

                            {/* Medical Personnel */}
                            <div>
                              <span className="text-gray-500 block text-sm">
                                Medical Personnel
                              </span>
                              <p className="text-gray-700 font-medium">
                                {record.hospital_info.medical_personnel}
                              </p>
                            </div>

                            {/* Summary */}
                            <div>
                              <span className="text-gray-500 block text-sm">
                                Summary/Treatment
                              </span>
                              <p className="text-gray-700 font-medium truncate">
                                {record.summary}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                      ))}
                      
                    </div>
                  )}
                </div>

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
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default UserHomeDashboard;
