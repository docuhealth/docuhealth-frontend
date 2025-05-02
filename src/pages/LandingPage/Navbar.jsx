import React, { useState, useEffect } from "react";
import logo from "../../assets/img/logo.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import EmergencyModeForm from "../../Emergency Mode Feature/EmergencyModeForm";
import EmergencyModeRecords from "../../Emergency Mode Feature/EmergencyModeRecords";
import EmergencyModeRecordsMobile from '../../Emergency Mode Feature/EmergencyModeRecordsMobile'
import PharmacyModal from "../../Components/Pharmacy Mode/PharmacyModal";
import PharmacyModeGenerate from "../../Components/Pharmacy Mode/PharmacyModeGenerate";
import PharmacyModeUpload from "../../Components/Pharmacy Mode/PharmacyModeUpload";
import PharmacyModeReset from "../../Components/Pharmacy Mode/PharmacyModeReset";
import PharmacyGenerateMessage from "../../Components/Pharmacy Mode/PharmacyGenerateMessage";
import PharmacyResetMessage from "../../Components/Pharmacy Mode/PharmacyResetMessage";
import PharmacyModeUploadNext from "../../Components/Pharmacy Mode/PharmacyModeUploadNext";
import PharmacyUploadSuccessfulMessage from "../../Components/Pharmacy Mode/PharmacyUploadSucessfulMessage";

const Navbar = ({showPharmacyMode}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [guestModeForm, setGuestModeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [isMedicalRecord, setisMedicalRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(null);
  const [name, setName] = useState("...");
  const [pharmacyMode, setPharmacyMode] = useState(showPharmacyMode)
  const [pharmacyModeProceed, setPharmacyModeProceed] = useState()
  const[isPharmacyCreated, setIsPharmacyCreated] = useState(false)
  const[isPharmacyReset, setIsPharmacyReset] = useState(false)
  const [isPharmacyUploadCode, setIsPharmacyUploadCode] = useState(false)
  const[isPharmacyUploadSuccessful, setIsPharmacyUploadSuccessful] = useState(false)


  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScrollTop) {
        // User is scrolling down → hide navbar after a short delay
        setIsVisible(false);
      } else {
        // User is scrolling up → show navbar
        setIsVisible(true);
      }

      // If user scrolls past a certain threshold, make navbar fixed
      setIsScrolled(currentScroll > 50);
      setLastScrollTop(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollTop]);

  // console.log("pharmacyMode", pharmacyMode)


  return (
    <div className="text-[#0E0E31] ">
      <div
        className={`${
          isScrolled
            ? "fixed w-full z-50 bg-white shadow transition-transform"
            : "absolute w-full"
        } ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } hidden sm:flex justify-around items-center py-4`}
        style={{ transition: "transform 0.3s ease-in-out" }}
      >
        <div className="flex justify-center gap-1 items-center">
          <div>
            <img src={logo} alt="DocuHealth Logo" />
          </div>
          <div className="font-semibold text-xl">
            <h1>DocuHealth</h1>
          </div>
        </div>
        <div className="flex justify-center items-center gap-5 text-sm">
          <a href="#" className="font-semibold">
            Home
          </a>
          <a
            href="#OurServices"
            className="text-gray-500 transition-all hover:text-[#34345F] hover:scale-105"
          >
            Our Services
          </a>
          <a
            href="#OurBenefits"
            className="text-gray-500 transition-all hover:text-[#34345F] hover:scale-105"
          >
            Benefits
          </a>
          <a
            href="#OurFeatures"
            className="text-gray-500 transition-all hover:text-[#34345F] hover:scale-105"
          >
            Features
          </a>
          <button
            href=""
            className=" text-gray-500 transition-all hover:text-[#34345F] hover:scale-105 "
            onClick={() => setGuestModeForm(true)}
          >
            Guest Mode
          </button>
        </div>
        <div className="flex justify-center items-center gap-2 text-sm">
          <Link to="/welcome">
            <button className="border border-[#0E0E31]  transition-all hover:bg-[#0E0E31] hover:text-white rounded-full py-2 px-5">
              Sign Up
            </button>
          </Link>
          <Link to="/welcome">
            <button className="border rounded-full py-2 px-5  transition-all hover:bg-[#34345F] bg-[#0E0E31] text-white">
              Sign In
            </button>
          </Link>
        </div>
      </div>

      {guestModeForm && (
         <EmergencyModeForm emergencyFormToggle = {setGuestModeForm}  name = {setName} medicalRecordToggle = {setisMedicalRecord} records = {setRecords}/>
      )}
      {isMedicalRecord && (
        <div className="hidden overflow-x-auto  fixed inset-0 bg-black bg-opacity-60 lg:flex items-start justify-center z-50">
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : records === "No medical records" ? (
            <p className="text-center py-4">No medical records found.</p>
          ) : (
        <div>
             <EmergencyModeRecords records={records} medicalRecordToggle = {setisMedicalRecord} name={name} />
        </div>
          )}
        </div>
      )}
      {isMedicalRecord && (
        <div className=" lg:hidden space-y-4 overflow-x-auto  fixed inset-0 bg-black bg-opacity-60 z-50 py-20">
          {loading ? (
            <p className="text-gray-500 text-center">
              Loading medical records...
            </p>
          ) : records === "No medical records" ? (
            <p className="text-center py-4">No medical records found.</p>
          ) : (
           <div>
             <EmergencyModeRecordsMobile records={records} medicalRecordToggle = {setisMedicalRecord}  name={name} />
           </div>
          )}
        </div>
      )}

      {pharmacyMode && (
        <PharmacyModal setPharmacyMode = {setPharmacyMode} setPharmacyModeProceed ={setPharmacyModeProceed}/>
       )}

       {pharmacyModeProceed === 'generate' && (
        <PharmacyModeGenerate setPharmacyModeProceed ={setPharmacyModeProceed} setIsPharmacyCreated = {setIsPharmacyCreated} />
       )}

       {isPharmacyCreated && (
        <PharmacyGenerateMessage setIsPharmacyCreated = {setIsPharmacyCreated} />
       )}
  

       {pharmacyModeProceed === 'upload' && (
        <PharmacyModeUpload setPharmacyModeProceed ={setPharmacyModeProceed} setIsPharmacyUploadCode={setIsPharmacyUploadCode}/>
       )}

       {isPharmacyUploadCode && (
        <PharmacyModeUploadNext setIsPharmacyUploadCode ={setIsPharmacyUploadCode} setIsPharmacyUploadSuccessful={setIsPharmacyUploadSuccessful}/>
       )}

       {isPharmacyUploadSuccessful && (
        <PharmacyUploadSuccessfulMessage setIsPharmacyUploadSuccessful = {setIsPharmacyUploadSuccessful} />
       )}

       {pharmacyModeProceed === 'reset' && (
        <PharmacyModeReset setPharmacyModeProceed ={setPharmacyModeProceed} setIsPharmacyReset = {setIsPharmacyReset} />
       )}

       {isPharmacyReset && (<PharmacyResetMessage setIsPharmacyReset = {setIsPharmacyReset} />)}

      <div className="fixed w-full z-50">
        {/* Top Navigation Bar */}
        <div className="sm:hidden flex justify-between items-center px-3 py-4 bg-white shadow">
          <button onClick={() => setIsOpen(true)}>
            <i className="bx bx-menu-alt-left text-3xl"></i>
          </button>
          <img src={logo} alt="DocuHealth Logo" />
        </div>

        {/* Sidebar Menu */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform z-50 sm:hidden ${
            isOpen
              ? "translate-x-0 z-50 sm:hidden"
              : "-translate-x-full z-50 sm:hidden"
          } transition-transform duration-300 ease-in-out text-[#0E0E31]`}
        >
          {/* Close Button */}
          <div className="flex justify-between items-center px-4 py-4">
            <div className="flex justify-center items-center gap-1">
              <img src={logo} alt="DocuHealth Logo" className="h-8" />
              <h2 className="text-xl font-semibold">DocuHealth</h2>
            </div>

            <button onClick={() => setIsOpen(false)}>
              <i className="bx bx-x text-3xl"></i>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col px-6 mt-4 space-y-4 text-gray-700">
            <a
              href="#"
              className="text-lg font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </a>
            <a
              href="#OurServices"
              className="text-lg text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Our services
            </a>
            <a
              href="#OurBenefits"
              className="text-lg text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Benefits
            </a>
            <a
              href="#OurFeatures"
              className="text-lg text-gray-400"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <p
              href=""
              className="text-lg text-gray-400"
              onClick={() => {
                setIsOpen(false);
                setGuestModeForm(true);
              }}
            >
              Guest Mode
            </p>
          </nav>

          {/* Sign In / Sign Up Buttons */}
          <div className="absolute bottom-8 left-0 w-full px-6">
            <Link to="/welcome">
              <button
                className="w-full bg-[#0E0E31] text-white py-2 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                Sign in
              </button>
            </Link>
            <Link to="/welcome">
              <button
                className="w-full mt-2 border border-[#0E0E31] text-[#0E0E31] py-2 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                {" "}
                Sign up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
