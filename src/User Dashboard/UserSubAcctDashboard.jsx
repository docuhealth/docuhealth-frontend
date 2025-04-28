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

          if (data.is_subscribed) {
            setPaymentStatus(true);
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
                      toggleOverlay;
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

            {showOverlay && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-5">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
                  {/* Cancel Icon */}
                  <div className="flex justify-between items-center pb-8">
                    <div className="flex-1 text-center">
                      <h2 className="text-lg font-semibold">
                        Create Sub Account
                      </h2>
                    </div>
                    <button
                      onClick={toggleOverlay}
                      className="text-gray-500 hover:text-black"
                    >
                      <i className="bx bx-x text-2xl"></i>
                    </button>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit}
                    className=" sm:grid sm:grid-cols-2 sm:gap-3"
                  >
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Child's First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 h-12 focus:outline-none focus:border-[#0000FF]"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Child's Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 h-12 focus:outline-none focus:border-[#0000FF]"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Child's Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 h-12 focus:outline-none focus:border-[#0000FF]"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sex
                      </label>
                      <select
                        name="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-2 py-2 h-12 focus:outline-none focus:border-[#0000FF] "
                        required
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="mb-4 col-span-2">
                      <p className="block text-sm font-medium text-gray-700 mb-1">
                        Please Note :
                      </p>

                      <div
                        className="text-sm text-gray-500 mt-2 border border-gray-300 rounded-lg p-3
                      "
                      >
                        Please note that once this account is created, its
                        information cannot be edited. However, you will have the
                        option to update the account details when you upgade the
                        account and transfer ownership to the child.
                      </div>
                    </div>
                    <div className="col-span-2 text-center bg-[#0000FF] text-white py-3 px-4 rounded-full">
                      <button type="submit" onClick={handleChange}>
                        {loading ? loading : "Create Sub Account"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {noticeDisplay && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative max-h-[80vh] overflow-y-auto mx-5">
                  {noticeMessage.map((message, index) => (
                    <div key={index} className="">
                      <div className="flex justify-start items-center gap-2 pb-1">
                        <p>
                          <i className="bx bx-info-circle text-3xl"></i>
                        </p>
                        <p className="font-semibold">{message.benefitTitle}</p>
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium">
                          {message.instruction}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600 pb-4">
                        <p className="pb-1">{message.benefitTitle}</p>
                        <p className="pb-1">- {message.benefit1}</p>
                        <p className="pb-1">- {message.benefit2}</p>
                        <p className="pb-1">- {message.benefit3}</p>
                      </div>
                      <div className="text-sm text-gray-600 pb-4">
                        <p className="pb-1">{message.workTitle}</p>
                        <p className="pb-1">1 {message.work1}</p>
                        <p className="pb-1">2 {message.work2}</p>
                        <p className="pb-1">3 {message.work3}</p>
                      </div>
                      <p className="pb-4">
                        <p className="text-sm text-gray-600">
                          {message.lastMessage}
                        </p>
                      </p>
                      <div className="text-sm flex justify-start items-center gap-4">
                        <button
                          className="bg-[#0000FF] text-white py-2 px-3 rounded-full"
                          onClick={() => {
                            if (paymentStatus) {
                              closeNoticeMessageToCreateAcct;
                              return;
                            } else {
                              toast.success(
                                "Kindly subscribe to a plan to access this feature"
                              );
                            }
                          }}
                        >
                          Create a sub account
                        </button>
                        <button
                          className="border border-[#0000FF] text-[#0000FF] py-2 px-3 rounded-full"
                          onClick={closeNoticeMessage}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {defaultRecords && (
              <div className="hidden sm:block py-8 px-6 border rounded-2xl bg-white">
                <h1 className="text-xl font-semibold mb-4">Sub-Accounts</h1>
                <div className="relative">
                  <table className="min-w-full">
                    <thead className="text-left text-gray-500">
                      <tr>
                        <th className="px-4 py-2 font-normal">Name</th>
                        <th className="px-4 py-2 font-normal">HIN</th>
                        <th className="px-4 py-2 font-normal">Date of Birth</th>
                        <th className="px-4 py-2 font-normal">Sex</th>
                        <th className="px-4 py-2 font-normal">Date Created</th>
                      </tr>
                    </thead>

                    <tbody>
                      {subaccounts.map((subaccount, index) => (
                        <tr key={index} className="relative">
                          <td className="border-b border-gray-300 px-4 pb-3 pt-3">
                            {subaccount.firstname + " " + subaccount.lastname}
                          </td>
                          <td className="border-b border-gray-300 px-4 pb-3 pt-3">
                            {subaccount.HIN.slice(0, 4) +
                              "*".repeat(subaccount.HIN.length - 5)}
                          </td>
                          <td className="border-b border-gray-300 px-4 pb-3 pt-3">
                            {subaccount.DOB}
                          </td>
                          <td className="border-b border-gray-300 px-4 pb-3 pt-3">
                            {subaccount.sex}
                          </td>
                          <td className="border-b border-gray-300 px-4 pb-3 pt-3 relative">
                            {subaccount.date_created.split("T")[0]}
                            <i
                              className={`bx bx-dots-vertical-rounded ml-3  p-2 ${
                                openPopover === index
                                  ? "bg-slate-300 p-2 rounded-full"
                                  : ""
                              }`}
                              onClick={() => togglePopover(index)}
                            ></i>

                            {openPopover === index && (
                              <div className="absolute right-0 mt-2 bg-white border shadow-md rounded-lg p-2 w-52  z-30">
                                <Link to="">
                                  <p
                                    className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer"
                                    onClick={() =>
                                      fetchMedicalHistory(subaccount.HIN)
                                    }
                                  >
                                    Check Medical History
                                  </p>
                                </Link>

                                <Link to="/user-sub-account-upgrade">
                                  {" "}
                                  <p className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer">
                                    Upgrade Sub Account
                                  </p>
                                </Link>

                                <p
                                  className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer"
                                  onClick={() => {
                                    if (paymentStatus) {
                                      handleOpenForm(
                                        subaccount.firstname +
                                          " " +
                                          subaccount.lastname,
                                        subaccount.HIN,
                                        subaccount.DOB
                                      );
                                      return;
                                    } else {
                                      toast.success(
                                        "Kindly subscribe to a plan to access this feature"
                                      );
                                    }
                                  }}
                                >
                                  Generate ID Card
                                </p>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {isMedicalRecords && (
              <div className="hidden sm:block bg-white py-10 px-5 rounded-2xl ">
                <div className="flex justify-start items-center gap-2 pb-4 text-[#647284]">
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setIsMedicalRecords(false);
                      setDefaultRecords(true);
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z"
                        fill="#1B2B40"
                      />
                    </svg>
                  </div>
                  <div>
                    {records.map((record, index) => (
                      <div
                        key={index}
                        className="flex justify-start items-center gap-2"
                      >
                        <p>
                          Full Name:{" "}
                          {record.patient_info?.fullname || "No Name Available"}
                        </p>
                        <p>
                          (#{" "}
                          {record.patient_HIN.slice(0, 4) +
                            "*".repeat(record.patient_HIN.length - 5) ||
                            "No HIN Available"}{" "}
                          )
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="">
                  {records.map((record) => (
                    <div
                      key={record._id}
                      className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between space-x-2"
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
                            .replace(/^\d{2}/, (day) => day.padStart(2, "0"))}
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

                      {/* Vertical Divider */}
                      <div className="border-l h-12 border-gray-300"></div>

                      {/* Diagnosis */}
                      <div className="text-gray-700  truncate">
                        <span className="font-medium">Diagnosis:</span>
                        <p>{record.basic_info.diagnosis}</p>
                      </div>

                      {/* Vertical Divider */}
                      <div className="border-l h-12 border-gray-300"></div>

                      {/* Hospital Name */}
                      <div className="text-gray-700  truncate">
                        <span className="font-medium">Name of Hospital:</span>
                        <p>{record.hospital_info.name}</p>
                      </div>

                      {/* Vertical Divider */}
                      <div className="border-l h-12 border-gray-300"></div>

                      {/* Medical Personnel */}
                      <div className="text-gray-700  truncate">
                        <span className="font-medium">Medical Personnel:</span>
                        <p>{record.hospital_info.medical_personnel}</p>
                      </div>

                      {/* Vertical Divider */}
                      <div className="border-l h-12 border-gray-300"></div>

                      {/* Summary */}
                      <div className="text-gray-700 truncate max-w-xs">
                        <span className="font-medium">Summary/Treatment:</span>
                        <p>{record.summary}</p>
                      </div>
                      {/* Vertical Divider */}
                      <div className="border-l h-12 border-gray-300"></div>

                      {/* Summary */}
                      <div
                        className="text-gray-700  max-w-xs"
                        onClick={() => togglePopoverr(record._id)}
                      >
                        <p>
                          <i class="bx bx-dots-vertical-rounded cursor-pointer"></i>
                        </p>
                      </div>

                      {popoverVisible === record._id && (
                        <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
                          <div className="bg-white shadow-lg rounded-lg p-5 relative max-h-[80vh] overflow-y-auto  ">
                            <div className="flex justify-between items-center">
                              <div className="flex justify-start items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center p-1">
                                  {record.patient_info.fullname
                                    ? record.patient_info.fullname
                                        .split(" ")
                                        .map((word) =>
                                          word ? word[0].toUpperCase() : ""
                                        ) // Add safeguard for empty strings
                                        .join("")
                                    : ""}
                                </div>

                                <div>
                                  <p className="font-semibold text-md">
                                    {record.hospital_info.name} Hospital
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
                                  onClick={() => {
                                    if (paymentStatus) {
                                      exportToPDF;
                                      return;
                                    } else {
                                      toast.success(
                                        "Kindly subscribe to a plan to access this feature"
                                      );
                                    }
                                  }}
                                >
                                  Export as pdf
                                </button>
                                <p onClick={() => setPopoverVisible(null)}>
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

                                <div className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100">
                                  {selectedRecord.attachments &&
                                  selectedRecord.attachments.length > 0 ? (
                                    selectedRecord.attachments.map(
                                      (attachment, index) => (
                                        <a
                                          key={index}
                                          href={attachment.secure_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-500 underline mr-2"
                                        >
                                          Image {index + 1}
                                        </a>
                                      )
                                    )
                                  ) : (
                                    <span>NIL</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

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
            )}

            {defaultRecords && (
              <div className=" py-5 border-t-2 sm:hidden">
                <p className="font-semibold">Sub accounts</p>
                {subaccounts.map((subaccount, index) => (
                  <div key={index} className="bg-white shadow px-4 py-2 my-3">
                    <div className=" flex justify-between items-center py-3 relative ">
                      <p>
                        HIN :{" "}
                        {subaccount.HIN.slice(0, 4) +
                          "*".repeat(subaccount.HIN.length - 5)}
                      </p>
                      <p>
                        <i
                          className={`bx bx-dots-vertical-rounded ml-3  p-2 ${
                            openPopover === index
                              ? "bg-slate-300 p-2 rounded-full"
                              : ""
                          }`}
                          onClick={() => togglePopover(index)}
                        ></i>
                      </p>
                      {openPopover === index && (
                        <div className="absolute right-0 top-10  mt-2 bg-white border shadow-md rounded-lg p-2 w-52  z-30">
                          <Link
                            to=""
                            onClick={() => fetchMedicalHistory(subaccount.HIN)}
                          >
                            <p className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer">
                              Check Medical History
                            </p>
                          </Link>

                          <Link to="/user-sub-account-upgrade">
                            {" "}
                            <p className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer">
                              Upgrade Sub Account
                            </p>
                          </Link>

                          <p
                            className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer"
                            onClick={() => {
                              if (paymentStatus) {
                                handleOpenForm(
                                  subaccount.firstname +
                                    " " +
                                    subaccount.lastname,
                                  subaccount.HIN,
                                  subaccount.DOB
                                );
                                return;
                              } else {
                                toast.success(
                                  "Kindly subscribe to a plan to access this feature"
                                );
                              }
                            }}
                          >
                            Generate ID Card
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-5 py-3">
                      <div className="flex flex-col">
                        <p className="text-gray-500">Name</p>
                        <p>
                          {" "}
                          {subaccount.firstname + " " + subaccount.lastname}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-gray-500">Date Of Birth</p>
                        <p>{subaccount.DOB}</p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-gray-500">Sex</p>
                        <p>{subaccount.sex}</p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-gray-500">Date Created</p>
                        <p> {subaccount.date_created.split("T")[0]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isMedicalRecords && (
              <div className="sm:hidden ">
                <div className="flex justify-start items-center gap-2 pb-4 text-[#647284]">
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setIsMedicalRecords(false);
                      setDefaultRecords(true);
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z"
                        fill="#1B2B40"
                      />
                    </svg>
                  </div>
                  <div>
                    {records.map((record, index) => (
                      <div
                        key={index}
                        className="flex justify-start items-center gap-2"
                      >
                        <p>
                          {record.patient_info?.fullname || "No Name Available"}
                        </p>
                        <p>
                          (#{" "}
                          {record.patient_HIN.slice(0, 4) +
                            "*".repeat(record.patient_HIN.length - 5) ||
                            "No HIN Available"}{" "}
                          )
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                {records.map((record) => (
                  <div
                    key={record._id}
                    className="bg-white shadow-md rounded-lg p-4 flex flex-col my-4 "
                  >
                    <div className="flex justify-between py-3">
                      {/* Date and Time */}
                      <div className="text-gray-700">
                        <span className="font-semibold">
                          {new Date(record.created_at)
                            .toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                            .replace(/^\d{2}/, (day) => day.padStart(2, "0"))}
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
                            onClick={() => togglePopoverr(record._id)}
                          ></i>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-2 sm:flex sm:space-x-4 sm:items-center">
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
                    {popoverVisible === record._id && (
                      <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50">
                        <div className="bg-white shadow-lg rounded-lg p-5 relative max-h-[80vh] overflow-y-auto w-[90%] sm:w-[60%]">
                          <div className="flex justify-between items-center">
                            <div className="">
                              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex justify-center items-center p-1">
                                {record.patient_info.fullname
                                  ? record.patient_info.fullname
                                      .split(" ")
                                      .map((word) =>
                                        word ? word[0].toUpperCase() : ""
                                      ) // Add safeguard for empty strings
                                      .join("")
                                  : ""}
                              </div>
                              <div>
                                <p className="font-semibold text-md">
                                  {record.hospital_info.name} Hospital
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
                                onClick={() => {
                                  if (paymentStatus) {
                                    exportToPDF;
                                    return;
                                  } else {
                                    toast.success(
                                      "Kindly subscribe to a plan to access this feature"
                                    );
                                  }
                                }}
                              >
                                Export as pdf
                              </button>
                              <p onClick={() => setPopoverVisible(null)}>
                                <i className="bx bx-x text-2xl text-black cursor-pointer"></i>
                              </p>
                            </div>
                          </div>
                          {/* Responsive Grid Layout */}
                          <div className=" flex flex-col gap-3 p-4">
                            {/* Pulse Rate */}
                            <div>
                              <label className="block  text-gray-600 text-sm font-medium">
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
                                  selectedRecord.hospital_info.medical_personnel
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

                              <div className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100">
                                {selectedRecord.attachments &&
                                selectedRecord.attachments.length > 0 ? (
                                  selectedRecord.attachments.map(
                                    (attachment, index) => (
                                      <a
                                        key={index}
                                        href={attachment.secure_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 underline mr-2"
                                      >
                                        Image {index + 1}
                                      </a>
                                    )
                                  )
                                ) : (
                                  <span>NIL</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {generateIDCardForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50  ">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative max-h-[80vh] overflow-y-auto mx-5">
                  <div className="flex justify-between items-center gap-2 pb-2">
                    <div className="flex justify-start items-center gap-2 ">
                      <p>
                        <i className="bx bx-info-circle text-3xl"></i>
                      </p>
                      <p className="font-semibold">Create Your ID Card</p>
                    </div>
                    <div>
                      <i
                        class="bx bx-x text-2xl cursor-pointer"
                        onClick={() => setGenerateIDCardForm(false)}
                      ></i>
                    </div>
                  </div>
                  <div>
                    <div className="bg-white max-w-96 py-3">
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={selectedUser}
                          readOnly
                          className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Input first emergency number
                        </label>
                        <input
                          type="text"
                          name="firstEmergency"
                          value={formData.firstEmergency}
                          onChange={handleChange}
                          placeholder="Enter first emergency number"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Input second emergency number
                        </label>
                        <input
                          type="text"
                          name="secondEmergency"
                          value={formData.secondEmergency}
                          onChange={handleChange}
                          placeholder="Enter second emergency number"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                          Input an emergency address
                        </label>
                        <textarea
                          name="emergencyAddress"
                          value={formData.emergencyAddress}
                          onChange={handleChange}
                          placeholder="Enter emergency address"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div
                    className=" bg-[#0000FF]  text-center text-white rounded-full py-2 cursor-pointer"
                    onClick={handleIDCreation}
                  >
                    <p>{loadingCard || "Generate ID Card"}</p>
                  </div>
                </div>
              </div>
            )}
            {generateIDCard && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center "
                onClick={() => setGenerateIDCard(false)} // Close modal on click
                id="id-card-container"
              >
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 place-items-center gap-2 mx-2  sm:gap-6 relative py-10 items-stretch "
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute top-0 right-0 z-50 flex justify-center items-center gap-2">
                    <div onClick={downloadIDCard} style={{ cursor: "pointer" }}>
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="15"
                          cy="15"
                          r="14.25"
                          stroke="white"
                          stroke-width="1.5"
                        />
                        <path
                          d="M5.8335 17.0837C5.8335 15.1433 6.85374 13.4412 8.38705 12.4847C8.80407 9.20366 11.6059 6.66699 15.0002 6.66699C18.3944 6.66699 21.1962 9.20366 21.6132 12.4847C23.1466 13.4412 24.1668 15.1433 24.1668 17.0837C24.1668 19.935 21.9637 22.2717 19.1668 22.4846L10.8335 22.5003C8.03665 22.2717 5.8335 19.935 5.8335 17.0837ZM19.0404 20.8227C20.9849 20.6747 22.5002 19.0471 22.5002 17.0837C22.5002 15.7728 21.8238 14.5805 20.7311 13.8987L20.0597 13.4798L19.9599 12.6948C19.6447 10.2154 17.5242 8.33366 15.0002 8.33366C12.4761 8.33366 10.3556 10.2154 10.0404 12.6948L9.94063 13.4798L9.26923 13.8987C8.17646 14.5805 7.50016 15.7728 7.50016 17.0837C7.50016 19.0471 9.01544 20.6747 10.9599 20.8227L11.1043 20.8337H18.896L19.0404 20.8227ZM15.8335 15.8337V19.167H14.1668V15.8337H11.6668L15.0002 11.667L18.3335 15.8337H15.8335Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                    <div
                      onClick={() => setGenerateIDCard(false)}
                      className="cursor-pointer"
                    >
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="15"
                          cy="15"
                          r="14.25"
                          fill="white"
                          stroke="white"
                          stroke-width="1.5"
                        />
                        <path
                          d="M13.8217 14.9998L7.32764 8.50566L8.50615 7.32715L15.0002 13.8212L21.4943 7.32715L22.6728 8.50566L16.1787 14.9998L22.6728 21.4938L21.4943 22.6724L15.0002 16.1783L8.50615 22.6724L7.32764 21.4938L13.8217 14.9998Z"
                          fill="#1B2B40"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* First ID Card */}
                  <div
                    style={{ backgroundImage: `url(${TIDF})` }}
                    className="bg-cover bg-center  w-full sm:w-[450px] rounded-md min-h-[320px] "
                  >
                    <div className="p-4 ">
                      <div className="flex justify-between items-center">
                        <div>
                          <img src={logo} alt="" />
                        </div>
                        <div>
                          <img src={NL} alt="" className="w-10" />
                        </div>
                      </div>
                      <div className=" text-center">
                        <div className="w-16 h-16 mx-auto mb-2 border-2 border-[#1C1CFE] rounded-full flex items-center justify-center text-[#1C1CFE] text-lg font-bold">
                          {selectedUser
                            ? selectedUser
                                .split(" ")
                                .filter((word) => word.trim() !== "") // Remove empty entries
                                .map((word) => word[0].toUpperCase())
                                .join("")
                            : ""}
                        </div>

                        <h2 className="text-gray-700 font-bold text-lg">
                          {selectedUserHIN}
                        </h2>
                        <p className="text-gray-600">{selectedUser}</p>
                        <p className="text-gray-500 text-sm">
                          {selectedUserDOB.split("-").reverse().join("-")}
                        </p>

                        <div className="flex justify-between text-left text-[13px] mt-4 w-full ">
                          <div>
                            <h3 className="font-semibold text-[#313131]">
                              Emergency Numbers
                            </h3>
                            <p className="text-[#313131] text-[10px]">
                              {formData.firstEmergency || ""}
                            </p>
                            <p className="text-[#313131] text-[10px]">
                              {formData.secondEmergency || ""}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#313131]">
                              Emergency Address
                            </h3>
                            <p className="text-[#313131] max-w-28 break-words text-[10px]">
                              {formData.emergencyAddress || ""}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[#313131] text-[11px] text-center pt-8">
                          www.docuhealthservices.com
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{ backgroundImage: `url(${TIDB})` }}
                    className="bg-cover bg-center   w-full sm:w-[450px] min-h-[320px]   rounded-md text-white text-[13px] font-bold p-4 "
                  >
                    <div className="flex justify-between items-center ">
                      <div>
                        <img src={NL} alt="" className="w-10" />
                      </div>
                      <div className=" opacity-0  ">
                        <img src={logo} alt="" />
                      </div>
                    </div>
                    <div className="flex justify-center flex-col items-center">
                      <div className="bg-[#F2F2F2] p-2 rounded-full">
                        <img src={logo} alt="" />
                      </div>
                      <div className="text-center pt-3 ">
                        <h3 className=" text-[#313131]  pb-1">
                          Basic instruction
                        </h3>
                        <p className="text-[#313131] text-[10px]">
                          This card is linked to your Health Identification
                          Number (HIN). Present it at any DocuHealth-enabled
                          hospital to access your medical summary. Keep it safe
                          and secure.
                        </p>
                      </div>
                      <div className="text-center pt-3 ">
                        <h3 className=" text-[#313131]  pb-1">Warning!!!</h3>
                        <p className="text-[#313131] text-[10px]">
                          This card belongs to the registered patient. If found,
                          please return it to the nearest hospital or contact
                          support@docuhealthServices.com.
                        </p>
                        <p className="text-[#313131] text-[10px] py-2">
                          www.docuhealthservices.com
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[#313131] text-[11px] text-center pt-4 ">
                        Health is wealth, and a healthy Nigeria is a stronger
                        Nigeria
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default UserSubAcctDashboard;
