import React, { useState, useEffect } from "react";
import docuhealth_logo from "../../../assets/img/docuhealth_logo.png";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

import { Logo } from "../ui/Logo";
import EmergencyModeForm from "../../../Emergency Mode Feature/EmergencyModeForm";
import EmergencyModeRecords from "../../../Emergency Mode Feature/EmergencyModeRecords";
import EmergencyModeRecordsMobile from "../../../Emergency Mode Feature/EmergencyModeRecordsMobile";
import PharmacyModal from "../../../Components/Pharmacy Mode/PharmacyModal";
import PharmacyModeGenerate from "../../../Components/Pharmacy Mode/PharmacyModeGenerate";
import PharmacyModeUpload from "../../../Components/Pharmacy Mode/PharmacyModeUpload";
import PharmacyModeReset from "../../../Components/Pharmacy Mode/PharmacyModeReset";
import PharmacyGenerateMessage from "../../../Components/Pharmacy Mode/PharmacyGenerateMessage";
import PharmacyResetMessage from "../../../Components/Pharmacy Mode/PharmacyResetMessage";
import PharmacyModeUploadNext from "../../../Components/Pharmacy Mode/PharmacyModeUploadNext";
import PharmacyUploadSuccessfulMessage from "../../../Components/Pharmacy Mode/PharmacyUploadSucessfulMessage";


const Navbar = ({ showPharmacyMode }) => {
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
  const [pharmacyMode, setPharmacyMode] = useState(showPharmacyMode);
  const [pharmacyModeProceed, setPharmacyModeProceed] = useState();
  const [isPharmacyCreated, setIsPharmacyCreated] = useState(false);
  const [isPharmacyReset, setIsPharmacyReset] = useState(false);
  const [isPharmacyUploadCode, setIsPharmacyUploadCode] = useState(false);
  const [isPharmacyUploadSuccessful, setIsPharmacyUploadSuccessful] =
    useState(false);

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

  const [openDropdown, setOpenDropdown] = useState(null); // for toggling dropdowns

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // console.log("pharmacyMode", pharmacyMode)


  const location = useLocation();
  const currentPath = location.pathname;
  const currentHash = location.hash;
  useEffect(() => {
    if (currentHash) {
      const element = document.querySelector(currentHash);
      if (element) {
        // Small delay ensures the route change finished
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } else {
      // No hash → scroll to top on route change
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentHash]);

  return (
    <div className="text-[#0E0E31] relative z-50">
      <div
        className={` ${isScrolled
          ? "fixed w-full  bg-white shadow transition-transform"
          : "w-full shadow"
          } ${isVisible ? "translate-y-0" : "-translate-y-full"}
      hidden lg:flex justify-between px-16 items-center py-4 `}
        style={{ transition: "transform 0.3s ease-in-out" }}
      >
        <Link to="/">
          <Logo />
        </Link>

        {/* Middle Links */}
        <div className="flex justify-center items-center gap-5 text-sm relative">
          <Link to="/"
            className={`relative font-semibold transition-all hover:text-[#3E4095] ${currentPath === "/"
                ? "text-[#3E4095] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[#3E4095] after:rounded-full"
                : "text-[#797979] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[3px] after:bg-[#3E4095] after:rounded-full after:transition-all after:duration-300 hover:after:w-full"
              }`}
            onClick={() => toggleDropdown("")}
          >
            Home
          </Link>

          {/* Our Company Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("company")}
              className={`relative flex items-center gap-1 transition-all hover:text-[#3E4095] hover:scale-105
    ${[
                  "/our-mission",
                  "/our-vision",
                  "/docuhealth-api",
                  "/our-legal-notice",
                  "/our-privacy-policy",
                ].includes(currentPath)
                  ? "text-[#3E4095] font-medium after:content-[''] after:absolute after:left-0 after:bottom-[-3px] after:w-full after:h-[3px] after:bg-[#3E4095] after:rounded-full after:transition-all after:duration-300"
                  : "text-[#797979] after:content-[''] after:absolute after:left-0 after:bottom-[-3px] after:w-0 after:h-[3px] after:bg-[#3E4095] after:rounded-full after:transition-all after:duration-300 hover:after:w-full"
                }`}
            >
              Our Company
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${openDropdown === "company" ? "rotate-180" : ""
                  }`}
              />
            </button>


            {/* Dropdown Menu */}
            {openDropdown === "company" && (
              <div className="absolute left-0 mt-8 w-48 bg-white border shadow-lg rounded-lg  ">
                <a
                  href="/#about-us"
                  className="block px-4 py-2.5 text-sm text-[#797979] hover:bg-gray-100 hover:text-[#3E4095] hover:rounded-t-lg"
                  onClick={() => toggleDropdown("")}
                >
                  About Us
                </a>
                <Link
                  to="/our-mission"
                  className={`block px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-[#3E4095] ${currentPath === "/our-mission"
                      ? "text-[#3E4095] font-medium"
                      : "text-[#797979]"
                    }`}
                  onClick={() => toggleDropdown("")}
                >
                  Our Mission
                </Link>
                <Link
                  to="/our-vision"
                  className={`block px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-[#3E4095] ${currentPath === "/our-vision"
                      ? "text-[#3E4095] font-medium"
                      : "text-[#797979]"
                    }`}
                  onClick={() => toggleDropdown("")}
                >
                  Our Vision
                </Link>
                <Link
                  to="/docuhealth-api"
                  className={`block px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-[#3E4095] ${currentPath === "/docuhealth-api"
                      ? "text-[#3E4095] font-medium"
                      : "text-[#797979]"
                    }`}
                  onClick={() => toggleDropdown("")}
                >
                  Docu Health API
                </Link>
                <Link
                  to="/our-legal-notice"
                  className={`block px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-[#3E4095] ${currentPath === "/our-legal-notice"
                      ? "text-[#3E4095] font-medium"
                      : "text-[#797979]"
                    }`}
                  onClick={() => toggleDropdown("")}
                >
                  Legal Notice
                </Link>
                <Link
                  to="/our-privacy-policy"
                  className={`block px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-[#3E4095] hover:rounded-b-lg ${currentPath === "/our-privacy-policy"
                      ? "text-[#3E4095] font-medium"
                      : "text-[#797979]"
                    }`}
                  onClick={() => toggleDropdown("")}
                >
                  Our Privacy Policy
                </Link>
              </div>
            )}
          </div>

          <a
            href="/#our-services"
            className="text-[#797979] transition-all hover:text-[#3E4095] hover:scale-105"
            onClick={() => toggleDropdown("")}
          >
            Our Products
          </a>

          <a
            href="/#faq"
            className="text-[#797979] transition-all hover:text-[#3E4095] hover:scale-105"
            onClick={() => toggleDropdown("")}
          >
            FAQ
          </a>

          <a
            href="/#contact-us"
            className="text-[#797979] transition-all hover:text-[#3E4095] hover:scale-105"
            onClick={() => toggleDropdown("")}
          >
            Contact Us
          </a>

          <Link
            to="/docuhealth-news"
            onClick={() => toggleDropdown("")}
            className={`relative transition-all hover:text-[#3E4095] hover:scale-105
    ${currentPath === "/docuhealth-news"
                ? "text-[#3E4095] font-medium after:content-[''] after:absolute after:left-0 after:bottom-[-3px] after:w-full after:h-[3px] after:bg-[#3E4095] after:rounded-full after:transition-all after:duration-300"
                : "text-[#797979] after:content-[''] after:absolute after:left-0 after:bottom-[-3px] after:w-0 after:h-[3px] after:bg-[#3E4095] after:rounded-full after:transition-all after:duration-300 hover:after:w-full"
              }`}
          >
            DocuHealth News
          </Link>


          {/* Others Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("others")}
              className="flex items-center gap-1 text-[#797979] transition-all hover:text-[#3E4095] hover:scale-105"
            >
              Others
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${openDropdown === "others" ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {openDropdown === "others" && (
              <div className="absolute left-0 mt-8 w-48 bg-white border shadow-lg rounded-lg  z-50">
                <Link
                  to="/privacy-policy"
                  className="block px-4 py-2.5 text-sm text-[#797979] hover:bg-gray-100 hover:text-[#3E4095] hover:rounded-t-lg"
                  onClick={() => toggleDropdown("")}
                >
                  Pharmacy Mode
                </Link>
                <Link
                  to="/terms"
                  className="block px-4 py-2.5 text-sm text-[#797979]  hover:bg-gray-100 hover:text-[#3E4095]"
                  onClick={() => toggleDropdown("")}
                >
                  Guest Mode
                </Link>
                <Link
                  to="/support"
                  className="block px-4 py-2.5 text-sm text-[#797979] hover:bg-gray-100 hover:text-[#3E4095] hover:rounded-b-lg"
                  onClick={() => toggleDropdown("")}
                >
                  Support
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex justify-center items-center gap-2 text-sm">
          <Link to="/user-create-account">
            <button className="border border-[#3E4095]  transition-all hover:bg-[#3E4095] hover:text-white rounded-full py-2 px-8 text-[#3E4095]">
              Sign Up
            </button>
          </Link>
          <Link to="/user-login">
            <button className="border rounded-full py-2 px-8  transition-all hover:bg-[#34345F] bg-[#3E4095] text-white">
              Sign In
            </button>
          </Link>
        </div>
      </div>

      {guestModeForm && (
        <EmergencyModeForm
          emergencyFormToggle={setGuestModeForm}
          name={setName}
          medicalRecordToggle={setisMedicalRecord}
          records={setRecords}
        />
      )}
      {isMedicalRecord && (
        <div className="hidden overflow-x-auto  fixed inset-0 bg-black bg-opacity-60 lg:flex items-start justify-center z-50">
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : records === "No medical records" ? (
            <p className="text-center py-4">No medical records found.</p>
          ) : (
            <div>
              <EmergencyModeRecords
                records={records}
                medicalRecordToggle={setisMedicalRecord}
                name={name}
              />
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
              <EmergencyModeRecordsMobile
                records={records}
                medicalRecordToggle={setisMedicalRecord}
                name={name}
              />
            </div>
          )}
        </div>
      )}

      {pharmacyMode && (
        <PharmacyModal
          setPharmacyMode={setPharmacyMode}
          setPharmacyModeProceed={setPharmacyModeProceed}
        />
      )}

      {pharmacyModeProceed === "generate" && (
        <PharmacyModeGenerate
          setPharmacyModeProceed={setPharmacyModeProceed}
          setIsPharmacyCreated={setIsPharmacyCreated}
        />
      )}

      {isPharmacyCreated && (
        <PharmacyGenerateMessage setIsPharmacyCreated={setIsPharmacyCreated} />
      )}

      {pharmacyModeProceed === "upload" && (
        <PharmacyModeUpload
          setPharmacyModeProceed={setPharmacyModeProceed}
          setIsPharmacyUploadCode={setIsPharmacyUploadCode}
        />
      )}

      {isPharmacyUploadCode && (
        <PharmacyModeUploadNext
          setIsPharmacyUploadCode={setIsPharmacyUploadCode}
          setIsPharmacyUploadSuccessful={setIsPharmacyUploadSuccessful}
        />
      )}

      {isPharmacyUploadSuccessful && (
        <PharmacyUploadSuccessfulMessage
          setIsPharmacyUploadSuccessful={setIsPharmacyUploadSuccessful}
        />
      )}

      {pharmacyModeProceed === "reset" && (
        <PharmacyModeReset
          setPharmacyModeProceed={setPharmacyModeProceed}
          setIsPharmacyReset={setIsPharmacyReset}
        />
      )}

      {isPharmacyReset && (
        <PharmacyResetMessage setIsPharmacyReset={setIsPharmacyReset} />
      )}

      <div className={` w-full z-50  ${isScrolled
          ? "fixed w-full  bg-white shadow transition-transform"
          : "absolute top-0 w-full shadow"
          }`}>
        {/* Top Navigation Bar */}
        <div className={`lg:hidden flex justify-between items-center px-3 py-4 ${currentPath === '/' ? 'bg-none' : 'bg-white'}  `}>
          <button onClick={() => setIsOpen(true)}>
            <i className={`bx bx-menu-alt-left text-3xl ${currentPath === '/' && !isScrolled ? 'text-white' : 'text-[#3E4095]'} `}></i>
          </button>
          <div className="bg-white p-2 rounded-full">
            <img src={docuhealth_logo} alt="DocuHealth Logo" className="w-6" />
          </div>
        </div>

        <hr className="text-[#BDB5B5]" />

        {/* Sidebar Menu */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform z-50 lg:hidden ${isOpen
            ? "translate-x-0 z-50 lg:hidden"
            : "-translate-x-full z-50 lg:hidden"
            } transition-transform duration-300 ease-in-out text-[#0E0E31]`}
        >
          {/* Close Button */}
          <div className="flex justify-between items-center px-4 py-4">
            <Link to="/">
              <div className="   flex gap-1 items-center font-bold">
                <img src={docuhealth_logo} alt="Logo" className="w-6" />
                <h1 className="text-xl text-[#3E4095]">DocuHealth</h1>
              </div>
            </Link>

            <button onClick={() => setIsOpen(false)}>
              <i className="bx bx-x text-3xl"></i>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col px-6 mt-4 space-y-4 text-[#797979] text-sm">
            {/* Home */}
            <Link
              to="/"
              className={`relative transition-all hover:text-[#3E4095] ${currentPath === "/"
                ? "text-[#3E4095] font-medium"
                : "text-[#797979]"
              }`}
              onClick={() => {
                setIsOpen(false);
                setOpenDropdown("");
                toggleDropdown("");
              }}
            >
              Home
            </Link>

            {/* Our Company Dropdown */}
            <div>
              <button
                onClick={() => toggleDropdown("company")}
                className={`relative flex items-center gap-1 transition-all hover:text-[#3E4095] hover:scale-105
                  ${[
                                "/our-mission",
                                "/our-vision",
                                "/docuhealth-api",
                                "/our-legal-notice",
                                "/our-privacy-policy",
                              ].includes(currentPath)
                                ? "text-[#3E4095] font-medium "
                                : "text-[#797979] "
                              }`}
              >
                Our Company
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${openDropdown === "company" ? "-rotate-90 " : ""
                    }`}
                />
              </button>

              {openDropdown === "company" && (
                <div className="flex flex-col mt-3 ml-3 space-y-3 text-sm">
                  <a
                    href="/#about-us"
                  className="block  text-[#797979] hover:bg-gray-100 hover:text-[#3E4095] hover:rounded-t-lg"
                    onClick={() => {
                      setIsOpen(false);
                      toggleDropdown("");
                    }
                    }
                   
                  >
                    About Us
                  </a>
                  <Link
                           to="/our-mission"
                           className={`block  hover:bg-gray-100 hover:text-[#3E4095] ${currentPath === "/our-mission"
                               ? "text-[#3E4095] font-medium"
                               : "text-[#797979]"
                             }`}
                             onClick={() => {
                              setIsOpen(false);
                              toggleDropdown("");
                            }
                            }
                  >
                    Our Mission
                  </Link>
                  <Link
                    to="/our-vision"
                    onClick={() => {
                      setIsOpen(false);
                      toggleDropdown("");
                    }
                    }
                    className={`block  hover:bg-gray-100 hover:text-[#3E4095] ${currentPath === "/our-vision"
                      ? "text-[#3E4095] font-medium"
                      : "text-[#797979]"
                    }`}
                  >
                    Our Vision
                  </Link>
                  <Link
                    to="/docuhealth-api"
                    onClick={() => {
                      setIsOpen(false);
                      toggleDropdown("");
                    }
                    }
                    className={`block  hover:bg-gray-100 hover:text-[#3E4095] ${currentPath === "/docuhealth-api"
                      ? "text-[#3E4095] font-medium"
                      : "text-[#797979]"
                    }`}
                  >
                    Docu Health API
                  </Link>
                  <Link
                    to="/our-legal-notice"
                    onClick={() => {
                      setIsOpen(false);
                      toggleDropdown("");
                    }
                    }
                    className={`block  hover:bg-gray-100 hover:text-[#3E4095] ${currentPath === "/our-legal-notice"
                      ? "text-[#3E4095] font-medium"
                      : "text-[#797979]"
                    }`}
                  >
                    Legal Notice
                  </Link>
                  <Link
                    to="/our-privacy-policy"
                    onClick={() => {
                      setIsOpen(false);
                      toggleDropdown("");
                    }
                    }
                    className={`block  hover:bg-gray-100 hover:text-[#3E4095] hover:rounded-b-lg ${currentPath === "/our-privacy-policy"
                      ? "text-[#3E4095] font-medium"
                      : "text-[#797979]"
                    }`}
                  >
                    Our Privacy Policy
                  </Link>
                </div>
              )}
            </div>

            {/* Other Menu Items */}
            <a
              href="/#our-services"
              className=""
              onClick={() => {
                setIsOpen(false);
                setOpenDropdown("");
                toggleDropdown("")
              }}
            >
              Our Products
            </a>

            <a
              href="/#faq"
              className=""
              onClick={() => {
                setIsOpen(false);
                setOpenDropdown("");
                toggleDropdown("")
              }}
            >
              FAQ
            </a>

            <a
              href="/#contact-us"
              className=""
              onClick={() => {
                setIsOpen(false);
                setOpenDropdown("");
                toggleDropdown("")
              }}
            >
              Contact Us
            </a>

            <Link
              to="/docuhealth-news"
              className={`relative transition-all hover:text-[#3E4095] hover:scale-105
                ${currentPath === "/docuhealth-news"
                            ? "text-[#3E4095] font-medium "
                            : "text-[#797979] "
                          }`}
              onClick={() => {
                setIsOpen(false);
                setOpenDropdown("");
                toggleDropdown("")
              }}
            >
              DocuHealth News
            </Link>

            {/* Others Dropdown */}
            <div>
              <button
                onClick={() => toggleDropdown("others")}
                className="flex items-center justify-between w-full "
              >
                Others
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${openDropdown === "others" ? "-rotate-90 " : ""
                    }`}
                />
              </button>

              {openDropdown === "others" && (
                <div className="flex flex-col mt-3 ml-3 space-y-3 text-sm">
                  <Link
                    to=""
                    onClick={() => {
                      setIsOpen(false);
                      setOpenDropdown("");
                      toggleDropdown("")
                    }}
                    className=""
                  >
                    Pharmacy Mode
                  </Link>
                  <p
                    onClick={() => {
                      setIsOpen(false);
                      setGuestModeForm(true);
                      setOpenDropdown("")
                      toggleDropdown("")
                    }}
                    className=" cursor-pointer"
                  >
                    Guest Mode
                  </p>
                  <Link
                    to="/support"
                    onClick={() => {
                      setIsOpen(false);
                      setOpenDropdown("")
                      toggleDropdown("")
                    }}
                    className=""
                  >
                    Support
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Sign In / Sign Up Buttons */}
          <div className="absolute bottom-8 left-0 w-full px-6">
            <Link to="/user-login">
              <button
                className="w-full bg-[#3E4095] text-white py-2 rounded-full text-sm"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Sign in
              </button>
            </Link>
            <Link to="/user-create-account">
              <button
                className="w-full mt-2 border border-[#3E4095] text-[#3E4095] py-2 rounded-full text-sm"
                onClick={() => {
                  setIsOpen(false);
                  setOpenDropdown("");
                }}
              >
                {" "}
                Sign up
              </button>
            </Link>
          </div>
        </div>



        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300  ${isOpen
            ? "opacity-60 pointer-events-auto"
            : "opacity-0 pointer-events-none"
            } bg-black `}
          onClick={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
};

export default Navbar;
