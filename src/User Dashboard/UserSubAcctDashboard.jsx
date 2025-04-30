import React, { useState, useEffect } from "react";
import UserDashHead from "./Dashboard Part/UserDashHead";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/img/logo.png";
import { toast } from "react-toastify";
import axios from "axios";
import DynamicDate from "../Components/Dynamic Date/DynamicDate";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import NL from "../assets/img/NL.png";
import TIDF from "../assets/img/templateIDCardFront.png";
import TIDB from "../assets/img/templateIDCardBack.png";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import UserSideBar from "../Components/UserSideBar/UserSideBar";
import EmergencyNotice from "../Components/EmergencyNotice/EmergencyNotice";
import UserSubAcctOverlay from "../Components/UserSubAcct/UserSubAcctOverlay";
import UserSubAcctNoticeDisplay from "../Components/UserSubAcct/UserSubAcctNoticeDisplay";
import UserSubAcctRecordsDesktop from "../Components/UserSubAcct/UserSubAcctRecordsDesktop";
import UserSubAcctRecordsMobile from "../Components/UserSubAcct/UserSubAcctRecordsMobile";
import UserSubAcctIDCard from "../Components/UserSubAcct/UserSubAcctIDCard";

const downloadIDCard = () => {
  toast.success("Feature Coming Soon");
};

const UserSubAcctDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [loading, setLoading] = useState("");
  const [subaccounts, setSubaccounts] = useState([]);

  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [subAcctRecord, setSubAcctRecord] = useState(false);
  const [isMedicalRecords, setIsMedicalRecords] = useState(false);
  const [defaultRecords, setDefaultRecords] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(null);
  const [generateIDCard, setGenerateIDCard] = useState(false);
  const [generateIDCardForm, setGenerateIDCardForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Store selected object
  const [selectedUserHIN, setSelectedUserHIN] = useState(null); // Store selected object
  const [selectedUserDOB, setSelectedUserDOB] = useState(null); // Store selected object

  const [isEmergencyModeEnabled, setEmergencyModeEnabled] = useState(false);

  const itemsPerPage = 10;

  const togglePopoverr = (recordId) => {
    setPopoverVisible((prev) => (prev === recordId ? null : recordId));
    setSelectedRecord(records.find((r) => r._id === recordId) || null);
  };

  const fetchMedicalHistory = async (subaccountHIN) => {
    toast.success("Fetching medical history...");

    try {
      const token = localStorage.getItem("jwtToken");
      console.log(token);
      if (!token) {
        toast.error("Token not found. Please log in again.");
        return;
      }

      const response = await axios.get(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/subaccounts/get_subaccounts_medical_records",

        {
          params: {
            page: currentPage,
            size: itemsPerPage,
            subaccount_HIN: subaccountHIN,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setIsMedicalRecords(true);
      setDefaultRecords(false);
      setRecords(response.data.records);
      setTotalPages(response.data.total_pages);
      setSubAcctRecord(true);
      console.log("Records:", response.data);
      toast.success("Sub account medical records retrieved successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch patient medical records."
      );
    }
  };

  const isActive = (path = "/user-home-dashboard") =>
    location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const [showOverlay, setShowOverlay] = useState(false);

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sex: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page reload
    setLoading("Creating Sub Account");

    // Prepare the data to send
    const requestBody = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      DOB: formData.dateOfBirth,
      sex: formData.sex,
    };

    // Retrieve JWT token and role from localStorage
    const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your actual token key

    try {
      const response = await fetch(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/subaccounts/create",
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
        console.log("Form Submitted Successfully:", result);
        setLoading("Create Sub Account");

        // Show success toast
        toast.success("sub-account created successfully!");

        // Close the overlay after successful submission
        setShowOverlay(false);

        // Reset form data
        setFormData({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          sex: "",
        });
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
      setLoading("Create Sub Account");
    }
  };

  const [subAccounts, setSubAccounts] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [error, SetError] = useState(false);

  useEffect(() => {
    // Fetch data from JSON file
    fetch("data.json")
      .then((response) => response.json())
      .then((data) => setSubAccounts(data))
      .catch((error) => {
        console.error("Error fetching data:", error);
        SetError(true);
      });
  }, []);

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

  const closeNoticeMessageToCreateAcct = () => {
    setNoticeDisplay(false);
    setShowOverlay(true);
  };
  const closeNoticeMessage = () => {
    setNoticeDisplay(false);
  };

  const [openPopover, setOpenPopover] = useState(null);

  const togglePopover = (index) => {
    setOpenPopover(openPopover === index ? null : index);
  };

  const noticeMessage = [
    {
      title: "Sub Account",
      instruction: "Read about the sub account feature below",
      benefitTitle: "Benefits of SUB Account :",
      benefit1:
        "Store and track your child's medical history, including vaccinations, allergies, and illnesses.",
      benefit2:
        " Easily access and share medical information with healthcare providers.",
      benefit3:
        " Transfer ownership to your child when they start using their own mobile device.",
      workTitle: "How it Works:",
      work1:
        " Create a SUB account for your child, providing their basic information.",
      work2:
        " View and easily get access to all of  their medical information when needed.",
      work3:
        "  When your child start using his/her own device, they can take ownership of their own account and start keeping their own health record summary without your permission.",
      lastMessage:
        "By using our SUB account feature, you can ensure your child's medical history is accurate, up-to-date, and easily accessible – giving you peace of mind and empowering your child to take control of their health as they grow older.",
    },
  ];

  const fetchSubaccounts = async (page = 1, size = 100) => {
    try {
      // setLoading(true);

      // Retrieve JWT token
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toast.error("No token found. Please log in again.");
        return;
      }

      // Make the GET request
      const response = await axios.get(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/subaccounts/get_subaccounts",
        {
          params: { page, size },
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the header
          },
        }
      );

      // Success: Update state and show toast
      setSubaccounts(response.data.subaccounts || []);
      // console.log(response.data.subaccounts);
      // toast.success("Subaccounts fetched successfully!");
    } catch (error) {
      console.error("Error fetching subaccounts:", error.message);
      // toast.error("Failed to fetch subaccounts. Please try again.");
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubaccounts(); // Default to page 1, size 5
  }, []);

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
    doc.text("Summary of Treatment", 20, 115);
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

  const handleOpenForm = (name, hin, dob) => {
    setSelectedUser(name); // Store the clicked user
    setSelectedUserHIN(hin);
    setSelectedUserDOB(dob);

    console.log(name);
    setGenerateIDCardForm(true); // Open the form
  };

  const [loadingCard, setLoadingCard] = useState(null);
  const handleIDCreation = async (e) => {
    e.preventDefault(); // Prevents page reload
    setLoadingCard("Generating");

    // Prepare the data to send
    const requestBody = {
      first_emergency_contact: formData.firstEmergency,
      second_emergency_contact: formData.secondEmergency,
      emergency_address: formData.emergencyAddress,
      subaccount_HIN: selectedUserHIN,
    };

    // Retrieve JWT token and role from localStorage
    const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your actual token key

    try {
      const response = await fetch(
        "https://docuhealth-backend-h03u.onrender.com/api/patient/emergency/create_subaccount_id_card",
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
      setLoadingCard("Generate ID Card");
    }
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

          if(data.is_subscribed){
            sessionStorage.setItem("is_subscribed", true);

          }


          if (sessionStorage.getItem("is_subscribed") === "true") {
            setPaymentStatus(true);
            sessionStorage.setItem("is_subscribed", true);
         
          }else{
            setPaymentStatus(false);
          }

          localStorage.setItem("toggleState", data.emergency);
          setEmergencyModeEnabled(data.emergency);

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

  const [emergencyNotice, setEmergencyNotice] = useState(false);

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

          <EmergencyNotice
            emergencyNotice={emergencyNotice}
            setEmergencyNotice={setEmergencyNotice}
            handleToggleEmergencyMode={handleToggleEmergencyMode}
          />

          {/* Content */}
          <section className="pt-6 px-8 w-full relative bg-gray-100 shadow min-h-screen">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10">
              <div className="pb-3 sm:p-0 w-full sm:w-auto">
                <DynamicDate />
              </div>
              <div className="w-full sm:w-auto ">
                <button
                  onClick={() => {
                    if (paymentStatus) {
                      toggleOverlay();
                      return;
                    } else {
                      toast.success(
                        "Kindly subscribe to a plan to access this feature"
                      );
                    }
                  }}
                  className="bg-[#0000FF] text-white py-2 px-4 rounded-full w-full sm:w-auto"
                >
                  Create A Sub Account
                </button>
              </div>
            </div>

            <UserSubAcctOverlay
            showOverlay={showOverlay}
            toggleOverlay={toggleOverlay}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            formData={formData}
            loading={loading}
            />
           
           <UserSubAcctNoticeDisplay 
           noticeDisplay={noticeDisplay}
           noticeMessage={noticeMessage}
           paymentStatus={paymentStatus}
           closeNoticeMessage={closeNoticeMessage}
           closeNoticeMessageToCreateAcct={closeNoticeMessageToCreateAcct}
           />

         <UserSubAcctRecordsDesktop 
         defaultRecords={defaultRecords}
         subaccounts={subaccounts}
         togglePopover={togglePopover}
         fetchMedicalHistory={fetchMedicalHistory}
         handleOpenForm={handleOpenForm}
          paymentStatus={paymentStatus}
          isMedicalRecords={isMedicalRecords}
          setIsMedicalRecords={setIsMedicalRecords}
          setDefaultRecords={setDefaultRecords}
          records={records}
          popoverVisible={popoverVisible}
          exportToPDF={exportToPDF}
          setPopoverVisible={setPopoverVisible}
          selectedRecord={selectedRecord}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage} 
          openPopover={openPopover}
          togglePopoverr={togglePopoverr}
          
         />

      <UserSubAcctRecordsMobile 
           defaultRecords={defaultRecords}
           subaccounts={subaccounts}
           togglePopover={togglePopover}
           fetchMedicalHistory={fetchMedicalHistory}
           handleOpenForm={handleOpenForm}
            paymentStatus={paymentStatus}
            isMedicalRecords={isMedicalRecords}
            setIsMedicalRecords={setIsMedicalRecords}
            setDefaultRecords={setDefaultRecords}
            records={records}
            popoverVisible={popoverVisible}
            exportToPDF={exportToPDF}
            setPopoverVisible={setPopoverVisible}
            selectedRecord={selectedRecord}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage} 
            openPopover={openPopover}
            togglePopoverr={togglePopoverr}
      />

            <UserSubAcctIDCard 
              generateIDCard={generateIDCard}
            generateIDCardForm={generateIDCardForm}
              selectedUser={selectedUser}
              formData={formData}
              handleChange={handleChange}
              handleIDCreation={handleIDCreation}
              loadingCard={loadingCard}
              setGenerateIDCard={setGenerateIDCard}
              downloadIDCard={downloadIDCard}
              TIDB={TIDB}
              TIDF={TIDF}
              logo={logo}
              NL={NL}
              selectedUserHIN={selectedUserHIN}
              selectedUserDOB={selectedUserDOB}
              
            />
          
          </section>
        </main>
      </div>
    </div>
  );
};

export default UserSubAcctDashboard;
