import React, { useState, useEffect } from "react";
import UserDashHead from "./Dashboard Part/UserDashHead";
import { Link, useLocation } from "react-router-dom";
import DynamicDate from "../Components/Dynamic Date/DynamicDate";
import logo from "../assets/img/logo.png";
import NL from "../assets/img/NL.png";
import { toast } from "react-toastify";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import TIDF from "../assets/img/templateIDCardFront.png";
import TIDB from "../assets/img/templateIDCardBack.png";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import UserSideBar from "../Components/UserSideBar/UserSideBar";
import NoticeDisplay from "../Components/NoticeDisplay/NoticeDisplay";
import EmergencyNotice from "../Components/EmergencyNotice/EmergencyNotice";
import IdCardForm from "../Components/IdCardForm/IdCardForm";
import UserDashboardRecords from "../Components/UserDashboardRecords/UserDashboardRecords";

const downloadIDCard = () => {
  toast.success("Feature Coming Soon");
};

const UserHomeDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hin, setHin] = useState("Loading..");
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [name, setName] = useState("fetching...");
  const [dob, setDob] = useState("fetching...");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(null);
  const [datainfo, setDataInfo] = useState("");
  const [generateIDCard, setGenerateIDCard] = useState(false);
  const [generateIDCardForm, setGenerateIDCardForm] = useState(false);

  const location = useLocation();

  const isActive = (path = "/user-home-dashboard") =>
    location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [formData, setFormData] = useState({
    fullName: "",
    firstEmergency: "",
    secondEmergency: "",
    emergencyAddress: "",
  });

  const handleIDCreation = async (e) => {
    e.preventDefault(); // Prevents page reload
    setLoading("Generating");

    // Prepare the data to send
    const requestBody = {
      first_emergency_contact: formData.firstEmergency,
      second_emergency_contact: formData.secondEmergency,
      emergency_address: formData.emergencyAddress,
    };

    // Retrieve JWT token and role from localStorage
    const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your actual token key

    try {
      const response = await fetch(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/emergency/create_id_card",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`, // Add the JWT token to the Authorization header
          },
          body: JSON.stringify(requestBody), // Convert the request body to JSON
        }
      );

      if (response.ok) {
        const result = await response.json();
        // console.log("Form Submitted Successfully:", result);

        // Show success toast
        toast.success("Generated ID Card");
        setGenerateIDCard(true);
        setGenerateIDCardForm(false);
      } else {
        console.error(
          "Failed to submit the form:",
          response.status,
          response.statusText
        );
        const errorData = await response.json();
        console.error("Error Details:", errorData);

        // Show error toast with message from the API or generic message
        toast.error("An error occurred while submitting the form.");
      }
    } catch (error) {
      console.error("An error occurred while submitting the form:", error);

      // Show error toast for unexpected errors
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading("Generate ID Card");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchPatientDashboard = async (page = 1, size = 10) => {
      // Retrieve the JWT token from localStorage
      const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your token key
      const role = "patient"; // Replace with the required role

      try {
        // Construct the URL with query parameters
        const url = `https://docuhealth-backend-h03u.onrender.com/api/patient/dashboard?page=${page}&size=${size}`;

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
        // console.log(datainfo);
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
        const url = `https://docuhealth-backend-h03u.onrender.com/api/patient/dashboard?page=${page}&size=${size}`;

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

          if(data.is_subscribed){
            sessionStorage.setItem("is_subscribed", true);

          }


          if (sessionStorage.getItem("is_subscribed") === "true") {
            setPaymentStatus(true);
            sessionStorage.setItem("is_subscribed", true);
         
          }else{
            setPaymentStatus(false);
          }

          setHin(data.HIN);
          setName(data.fullname);
          setDob(data.DOB);
          localStorage.setItem("toggleState", data.emergency);
          setEmergencyModeEnabled(data.emergency);
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
        "https://docuhealth-backend-h03u.onrender.com/api/patient/dashboard",

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

      // console.log(response.json);
      console.log(response.data.records);
      setRecords(response.data.records);
      setTotalPages(response.data.total_pages);

      // console.log(response.data.records);
      // console.log(response.data);
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
    // console.log(records);
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
    doc.text(`${selectedRecord.hospital_info.name} Hospital`, 20, 30);

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
    doc.text(
      `Hospital: ${selectedRecord.hospital_info.name} Hospital`,
      20,
      afterSummaryY + 20
    );
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
    doc.save(`${selectedRecord.hospital_info.name}-hospital-record.pdf`);
  };

  const [emergencyNotice, setEmergencyNotice] = useState(false);
  const [isEmergencyModeEnabled, setEmergencyModeEnabled] = useState(false);

  const handleToggleEmergencyMode = async () => {
    const newState = !isEmergencyModeEnabled;
    setEmergencyModeEnabled(newState);
    setEmergencyNotice(false);

    localStorage.setItem("toggleState", newState.toString()); // Update local storage

    const jwtToken = localStorage.getItem("jwtToken");

    try {
      const response = await fetch(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/emergency/toggle_emergency_mode",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update emergency mode");
      }

      const responseData = await response.json();
      toast.success(responseData.message);
      // console.log(responseData);
    } catch (error) {
      console.error("Error:", error.message);
    }
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
        <UserSideBar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
          isEmergencyModeEnabled={isEmergencyModeEnabled}
          setEmergencyNotice={setEmergencyNotice}
          isActive={isActive}
        />

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <UserDashHead
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            closeSidebar={closeSidebar}
          />

          {/* Content */}
          <section className="py-8 px-4">
            <NoticeDisplay
              noticeDisplay={noticeDisplay}
              paymentStatus={paymentStatus}
              closeNoticeMessage={closeNoticeMessage}
              setGenerateIDCardForm={setGenerateIDCardForm}
            />

            <EmergencyNotice
              emergencyNotice={emergencyNotice}
              paymentStatus={paymentStatus}
              setEmergencyNotice={setEmergencyNotice}
              handleToggleEmergencyMode={handleToggleEmergencyMode}
            />

            <IdCardForm
              generateIDCard={generateIDCard}
              generateIDCardForm={generateIDCardForm}
              setGenerateIDCardForm={setGenerateIDCardForm}
              formData={formData}
              handleChange={handleChange}
              loading={loading}
              handleIDCreation={handleIDCreation}
              setGenerateIDCard={setGenerateIDCard}
              setEmergencyModeEnabled={setEmergencyModeEnabled}
              downloadIDCard={downloadIDCard}
            />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10">
              <div className="pb-3 sm:p-0 w-full sm:w-auto text-sm">
                <DynamicDate />
              </div>
              <div className="flex justify-center flex-col sm:flex-row gap-3 sm:gap-5 items-start sm:items-center">
                <div className="w-full sm:w-auto text-sm">
                  <p>HIN : {hin}</p>
                </div>
                <div
                  className="border border-[#0000FF] py-2 px-6 rounded-full text-[#0000FF] cursor-pointer text-sm"
                  onClick={() => {
                    if (paymentStatus) {
                      setGenerateIDCardForm(true);
                      return;
                    } else {
                      toast.success(
                        "Kindly subscribe to a plan to access this feature"
                      );
                    }
                  }}
                >
                  <p>Get Identity Card</p>
                </div>
              </div>
            </div>

            <UserDashboardRecords
              loading={loading}
              records={records}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              togglePopover={togglePopover}
              popoverVisible={popoverVisible}
              datainfo={datainfo}
              selectedRecord={selectedRecord}
              paymentStatus={paymentStatus}
              exportToPDF={exportToPDF}
              setPopoverVisible={setPopoverVisible}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

export default UserHomeDashboard;
