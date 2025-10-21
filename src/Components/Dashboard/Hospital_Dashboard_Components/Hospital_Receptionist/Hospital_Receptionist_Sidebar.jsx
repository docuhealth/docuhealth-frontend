import React, { useState, useEffect, useContext } from "react";
import logo from "../../../../assets/img/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Hospital_Receptionist_Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
  return (
    <>
    <div className="p-4 flex justify-between items-center  ">
        <div className="flex justify-start items-center gap-1">
          <img src={logo} alt="docuhealth logo" className="w-6" />
          <h1 className="text-xl font-semibold text-[#0000FF]">DocuHealth</h1>
        </div>
      </div>
      <nav className="mt-4 text-sm">
        <ul>
          <Link to="/hospital-receptionist-home-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-receptionist-home-dashboard"
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
                      currentPath === "/hospital-receptionist-home-dashboard"
                        ? "fill-white"
                        : ""
                    }`}
                  >
                    <path
                      d="M2.5 10C2.5 10.4602 2.8731 10.8333 3.33333 10.8333H8.33333C8.79358 10.8333 9.16667 10.4602 9.16667 10V3.33333C9.16667 2.8731 8.79358 2.5 8.33333 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V10ZM2.5 16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H8.33333C8.79358 17.5 9.16667 17.1269 9.16667 16.6667V13.3333C9.16667 12.8731 8.79358 12.5 8.33333 12.5H3.33333C2.8731 12.5 2.5 12.8731 2.5 13.3333V16.6667ZM10.8333 16.6667C10.8333 17.1269 11.2064 17.5 11.6667 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V10C17.5 9.53975 17.1269 9.16667 16.6667 9.16667H11.6667C11.2064 9.16667 10.8333 9.53975 10.8333 10V16.6667ZM11.6667 2.5C11.2064 2.5 10.8333 2.8731 10.8333 3.33333V6.66667C10.8333 7.1269 11.2064 7.5 11.6667 7.5H16.6667C17.1269 7.5 17.5 7.1269 17.5 6.66667V3.33333C17.5 2.8731 17.1269 2.5 16.6667 2.5H11.6667Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/hospital-receptionist-home-dashboard"
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
          <Link to="/hospital-receptionist-admission-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-receptionist-admission-dashboard"
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
                      currentPath === "/hospital-receptionist-admission-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
            <path d="M17.5062 2.5C17.9627 2.5 18.3327 2.87079 18.3327 3.32783V16.6722C18.3327 17.1293 17.9533 17.5 17.5062 17.5H2.49252C2.03606 17.5 1.66602 17.1292 1.66602 16.6722V3.32783C1.66602 2.87063 2.04544 2.5 2.49252 2.5H17.5062ZM16.666 4.16667H3.33268V15.8333H16.666V4.16667ZM14.9993 12.5V14.1667H4.99935V12.5H14.9993ZM9.99935 5.83333V10.8333H4.99935V5.83333H9.99935ZM14.9993 9.16667V10.8333H11.666V9.16667H14.9993ZM8.33268 7.5H6.66602V9.16667H8.33268V7.5ZM14.9993 5.83333V7.5H11.666V5.83333H14.9993Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/hospital-receptionist-admission-dashboard"
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    />
                  </svg>
                </span>
                Admission Requests
              </li>
            </div>
          </Link>
          <Link to="/hospital-receptionist-patients-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-receptionist-patients-dashboard"
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
                      currentPath === "/hospital-receptionist-patients-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M12.5 3.33268H4.16667V16.666H15.8333V6.66602H12.5V3.33268ZM2.5 2.49252C2.5 2.03606 2.87291 1.66602 3.33208 1.66602H13.3333L17.4998 5.83268L17.5 17.4931C17.5 17.9568 17.1292 18.3327 16.6722 18.3327H3.32783C2.87063 18.3327 2.5 17.9533 2.5 17.5062V2.49252ZM10 9.58268C8.84942 9.58268 7.91667 8.64993 7.91667 7.49935C7.91667 6.34876 8.84942 5.41602 10 5.41602C11.1506 5.41602 12.0833 6.34876 12.0833 7.49935C12.0833 8.64993 11.1506 9.58268 10 9.58268ZM6.27288 14.166C6.48016 12.291 8.06977 10.8327 10 10.8327C11.9303 10.8327 13.5198 12.291 13.7271 14.166H6.27288Z"
                      className={`group-hover:fill-white ${
                          currentPath === "/hospital-receptionist-patients-dashboard"
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    />
                  </svg>
                </span>
                Patient Mgt.
              </li>
            </div>
          </Link>
          <Link to="/hospital-receptionist-messages-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-receptionist-messages-dashboard"
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
                      currentPath === "/hospital-receptionist-messages-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M1.66797 7.49478C1.66797 4.73624 3.89842 2.5 6.66852 2.5H13.3341C16.0958 2.5 18.3346 4.74565 18.3346 7.49478V17.5H6.66852C3.90679 17.5 1.66797 15.2543 1.66797 12.5052V7.49478ZM16.668 15.8333V7.49478C16.668 5.66283 15.1721 4.16667 13.3341 4.16667H6.66852C4.82179 4.16667 3.33464 5.65382 3.33464 7.49478V12.5052C3.33464 14.3372 4.83057 15.8333 6.66852 15.8333H16.668ZM11.668 9.16667H13.3346V10.8333H11.668V9.16667ZM6.66797 9.16667H8.33464V10.8333H6.66797V9.16667Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/hospital-receptionist-messages-dashboard"
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    />
                  </svg>
                </span>
                Messages
              </li>
            </div>
          </Link>
          <Link to="/hospital-receptionist-healthpersonnel-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-receptionist-healthpersonnel-dashboard"
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
                      currentPath === "/hospital-receptionist-healthpersonnel-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                  <path d="M9.99985 12.5013C13.3995 12.5013 16.2048 15.0461 16.6149 18.3346H3.38477C3.79483 15.0461 6.60017 12.5013 9.99985 12.5013ZM8.48893 14.4009C7.29424 14.7796 6.28799 15.5957 5.66769 16.668H9.99985L8.48893 14.4009ZM11.5111 14.4011L9.99985 16.668H14.332C13.7118 15.5959 12.7057 14.7798 11.5111 14.4011ZM14.9998 1.66797V6.66797C14.9998 9.42939 12.7613 11.668 9.99985 11.668C7.23843 11.668 4.99986 9.42939 4.99986 6.66797V1.66797H14.9998ZM6.66652 6.66797C6.66652 8.50889 8.15891 10.0013 9.99985 10.0013C11.8408 10.0013 13.3332 8.50889 13.3332 6.66797H6.66652ZM13.3332 3.33464H6.66652L6.66643 5.0013H13.3331L13.3332 3.33464Z" 
                      className={`group-hover:fill-white ${
                        currentPath === "/hospital-receptionist-healthpersonnel-dashboard"
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    />
                  </svg>
                </span>
                Health Personnel
              </li>
            </div>
          </Link>
          <Link to="/hospital-receptionist-appointments-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-receptionist-appointments-dashboard"
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
                      currentPath === "/hospital-receptionist-appointments-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M5.83464 2.49992V0.833252H7.5013V2.49992H12.5013V0.833252H14.168V2.49992H17.5013C17.9616 2.49992 18.3346 2.87302 18.3346 3.33325V7.49992H16.668V4.16659H14.168V5.83325H12.5013V4.16659H7.5013V5.83325H5.83464V4.16659H3.33464V15.8333H8.33464V17.4999H2.5013C2.04107 17.4999 1.66797 17.1268 1.66797 16.6666V3.33325C1.66797 2.87302 2.04107 2.49992 2.5013 2.49992H5.83464ZM14.168 9.99992C12.3271 9.99992 10.8346 11.4923 10.8346 13.3333C10.8346 15.1742 12.3271 16.6666 14.168 16.6666C16.0089 16.6666 17.5013 15.1742 17.5013 13.3333C17.5013 11.4923 16.0089 9.99992 14.168 9.99992ZM9.16797 13.3333C9.16797 10.5718 11.4066 8.33325 14.168 8.33325C16.9294 8.33325 19.168 10.5718 19.168 13.3333C19.168 16.0947 16.9294 18.3333 14.168 18.3333C11.4066 18.3333 9.16797 16.0947 9.16797 13.3333ZM13.3346 10.8333V13.6784L15.2454 15.5892L16.4239 14.4107L15.0013 12.9881V10.8333H13.3346Z"
                      className={`group-hover:fill-white ${
                        currentPath ===
                        "/hospital-receptionist-appointments-dashboard"
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    />
                  </svg>
                </span>
                Appointments
              </li>
            </div>
          </Link>        
          <Link to="/hospital-receptionist-settings-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-receptionist-settings-dashboard"
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
                      currentPath === "/hospital-receptionist-settings-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M7.2386 3.33324L9.4108 1.16107C9.73621 0.835632 10.2639 0.835632 10.5893 1.16107L12.7615 3.33324H15.8334C16.2936 3.33324 16.6667 3.70634 16.6667 4.16657V7.23848L18.8389 9.41067C19.1643 9.73609 19.1643 10.2638 18.8389 10.5892L16.6667 12.7613V15.8333C16.6667 16.2935 16.2936 16.6666 15.8334 16.6666H12.7615L10.5893 18.8388C10.2639 19.1642 9.73621 19.1642 9.4108 18.8388L7.2386 16.6666H4.1667C3.70646 16.6666 3.33336 16.2935 3.33336 15.8333V12.7613L1.1612 10.5892C0.835754 10.2638 0.835754 9.73609 1.1612 9.41067L3.33336 7.23848V4.16657C3.33336 3.70634 3.70646 3.33324 4.1667 3.33324H7.2386ZM5.00003 4.99991V7.92884L2.92896 9.99992L5.00003 12.071V14.9999H7.92896L10 17.071L12.0711 14.9999H15V12.071L17.0711 9.99992L15 7.92884V4.99991H12.0711L10 2.92884L7.92896 4.99991H5.00003ZM10 13.3333C8.15908 13.3333 6.6667 11.8408 6.6667 9.99992C6.6667 8.15896 8.15908 6.66657 10 6.66657C11.841 6.66657 13.3334 8.15896 13.3334 9.99992C13.3334 11.8408 11.841 13.3333 10 13.3333ZM10 11.6666C10.9205 11.6666 11.6667 10.9204 11.6667 9.99992C11.6667 9.07942 10.9205 8.33326 10 8.33326C9.07955 8.33326 8.33338 9.07942 8.33338 9.99992C8.33338 10.9204 9.07955 11.6666 10 11.6666Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/hospital-receptionist-settings-dashboard"
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    />
                  </svg>
                </span>
                Settings
              </li>
            </div>
          </Link>

          <div
            className="px-4 my-4"
            //    onClick={handleLogout}
          >
            <li
              className={`group px-4 py-2  text-gray-700 hover:bg-[#0000FF] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`group-hover:fill-white 
                            fill-[#647284]`}
              >
                <path
                  d="M3.33329 12.4998H4.99996V16.6665H15V3.33317H4.99996V7.49984H3.33329V2.49984C3.33329 2.0396 3.70639 1.6665 4.16663 1.6665H15.8333C16.2935 1.6665 16.6666 2.0396 16.6666 2.49984V17.4998C16.6666 17.9601 16.2935 18.3332 15.8333 18.3332H4.16663C3.70639 18.3332 3.33329 17.9601 3.33329 17.4998V12.4998ZM8.33329 9.1665V6.6665L12.5 9.99984L8.33329 13.3332V10.8332H1.66663V9.1665H8.33329Z"
                  className={`group-hover:fill-white fill-[#647284]`}
                />
              </svg>
              Log-out
            </li>
          </div>
        </ul>
      </nav>
    </>
  )
}

export default Hospital_Receptionist_Sidebar




