import React, { useContext, useState, useEffect } from "react";
import docuhealth_logo from "../../../assets/img/docuhealth_logo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Admin_Sidebar_Mobile = ({
  openMobileSidebar,
  setOpenMobileSidebar,
}) => {

  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const handleLogout = (event) => {
    event.preventDefault();
    setOpenMobileSidebar(false);
    sessionStorage.clear();   // removes ALL session-based auth data
    navigate("/dhadmin-login");       // redirect to login page
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300  ${
          openMobileSidebar
            ? "opacity-60 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } bg-black `}
        onClick={() => setOpenMobileSidebar(false)}
      />
      <div
        className={`w-64 min-h-screen absolute top-0 left-0 z-50 bg-white transform transition-transform duration-300 ease-in-out
              ${openMobileSidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 flex justify-between items-center    ">
          <div className="flex justify-start items-center gap-1 font-semibold text-[#3E4095]">
            <img src={docuhealth_logo} alt="Logo" className="w-6" />
            <h1 className="text-xl">DocuHealth</h1>
          </div>
          <div
            className=" lg:hidden "
            onClick={() => setOpenMobileSidebar(false)}
          >
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
        <nav className="mt-4 text-sm">
        <Link to="/dhadmin-home-dashboard"
        onClick={() => setOpenMobileSidebar(false)}
        >
          <div className="px-4 my-4">
            <li
              className={`group px-4 py-2   ${currentPath === "/dhadmin-home-dashboard"
                ? "bg-[#3E4095] text-white"
                : "text-gray-700"
                } text-gray-700 hover:bg-[#3E4095] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
            >
              <span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`group-hover:fill-white ${currentPath === "/dhadmin-home-dashboard"
                    ? "fill-white"
                    : ""
                    }`}
                >
                  <path
                    d="M2.5 10C2.5 10.4602 2.8731 10.8333 3.33333 10.8333H8.33333C8.79358 10.8333 9.16667 10.4602 9.16667 10V3.33333C9.16667 2.8731 8.79358 2.5 8.33333 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V10ZM2.5 16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H8.33333C8.79358 17.5 9.16667 17.1269 9.16667 16.6667V13.3333C9.16667 12.8731 8.79358 12.5 8.33333 12.5H3.33333C2.8731 12.5 2.5 12.8731 2.5 13.3333V16.6667ZM10.8333 16.6667C10.8333 17.1269 11.2064 17.5 11.6667 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V10C17.5 9.53975 17.1269 9.16667 16.6667 9.16667H11.6667C11.2064 9.16667 10.8333 9.53975 10.8333 10V16.6667ZM11.6667 2.5C11.2064 2.5 10.8333 2.8731 10.8333 3.33333V6.66667C10.8333 7.1269 11.2064 7.5 11.6667 7.5H16.6667C17.1269 7.5 17.5 7.1269 17.5 6.66667V3.33333C17.5 2.8731 17.1269 2.5 16.6667 2.5H11.6667Z"
                    className={`group-hover:fill-white ${currentPath === "/dhadmin-home-dashboard"
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

        <Link to="/dhadmin-users-dashboard"
        onClick={() => setOpenMobileSidebar(false)}
        >
          <div className="px-4 my-4">
            <li
              className={`group px-4 py-2   ${currentPath === "/dhadmin-users-dashboard"
                ? "bg-[#3E4095] text-white"
                : "text-gray-700"
                } text-gray-700 hover:bg-[#3E4095] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
            >

              <span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`group-hover:fill-white ${currentPath === "/dhadmin-users-dashboard"
                    ? "fill-white"
                    : "fill-[#647284]"
                    }`}
                >
                  <path d="M2.49998 4.99999H17.5V15H2.49998V4.99999ZM1.66665 3.33333C1.20641 3.33333 0.833313 3.70643 0.833313 4.16666V15.8333C0.833313 16.2936 1.20641 16.6667 1.66665 16.6667H18.3333C18.7936 16.6667 19.1666 16.2936 19.1666 15.8333V4.16666C19.1666 3.70643 18.7936 3.33333 18.3333 3.33333H1.66665ZM10.8333 6.66666H15.8333V8.33333H10.8333V6.66666ZM15 9.99999H10.8333V11.6667H15V9.99999ZM8.74998 8.33333C8.74998 9.48391 7.81724 10.4167 6.66665 10.4167C5.51606 10.4167 4.58331 9.48391 4.58331 8.33333C4.58331 7.18274 5.51606 6.24999 6.66665 6.24999C7.81724 6.24999 8.74998 7.18274 8.74998 8.33333ZM6.66665 11.25C5.05581 11.25 3.74998 12.5558 3.74998 14.1667H9.58331C9.58331 12.5558 8.27748 11.25 6.66665 11.25Z"
                    className={`group-hover:fill-white ${currentPath === "/dhadmin-users-dashboard"
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

        <Link to="/dhadmin-subscriptions-dashboard"
        onClick={() => setOpenMobileSidebar(false)}
        >
          <div className="px-4 my-4">
            <li
              className={`group px-4 py-2   ${currentPath === "/dhadmin-subscriptions-dashboard"
                ? "bg-[#3E4095] text-white"
                : "text-gray-700"
                } text-gray-700 hover:bg-[#3E4095] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
            >
              <span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`group-hover:fill-white ${currentPath === "/dhadmin-subscriptions-dashboard"
                    ? "fill-white"
                    : "fill-[#647284]"
                    }`}
                >
                  <path
                    d="M2.50411 2.50244H17.5041C17.9644 2.50244 18.3375 2.87553 18.3375 3.33577V16.6691C18.3375 17.1293 17.9644 17.5024 17.5041 17.5024H2.50411C2.04388 17.5024 1.67078 17.1293 1.67078 16.6691V3.33577C1.67078 2.87553 2.04388 2.50244 2.50411 2.50244ZM3.33744 4.16911V15.8357H16.6708V4.16911H3.33744ZM7.08744 11.6691H11.6708C11.9009 11.6691 12.0875 11.4826 12.0875 11.2524C12.0875 11.0223 11.9009 10.8357 11.6708 10.8357H8.33746C7.18685 10.8357 6.25411 9.90307 6.25411 8.7524C6.25411 7.60184 7.18685 6.66911 8.33746 6.66911H9.17079V5.00244H10.8375V6.66911H12.9208V8.33573H8.33746C8.10733 8.33573 7.92078 8.52232 7.92078 8.7524C7.92078 8.98257 8.10733 9.16907 8.33746 9.16907H11.6708C12.8214 9.16907 13.7541 10.1018 13.7541 11.2524C13.7541 12.4031 12.8214 13.3357 11.6708 13.3357H10.8375V15.0024H9.17079V13.3357H7.08744V11.6691Z"
                    className={`group-hover:fill-white ${currentPath === "/dhadmin-subscriptions-dashboard"
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

        <Link to="/dhadmin-settings-dashboard"
        onClick={() => setOpenMobileSidebar(false)}
        >
          <div className="px-4 my-4">
            <li
              className={`group px-4 py-2   ${currentPath === "/dhadmin-settings-dashboard"
                ? "bg-[#3E4095] text-white"
                : "text-gray-700"
                } text-gray-700 hover:bg-[#3E4095] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
            >
              <span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`group-hover:fill-white ${currentPath === "/dhadmin-settings-dashboard"
                    ? "fill-white"
                    : "fill-[#647284]"
                    }`}
                >
                  <path
                    d="M7.2386 3.33324L9.4108 1.16107C9.73621 0.835632 10.2639 0.835632 10.5893 1.16107L12.7615 3.33324H15.8334C16.2936 3.33324 16.6667 3.70634 16.6667 4.16657V7.23848L18.8389 9.41067C19.1643 9.73609 19.1643 10.2638 18.8389 10.5892L16.6667 12.7613V15.8333C16.6667 16.2935 16.2936 16.6666 15.8334 16.6666H12.7615L10.5893 18.8388C10.2639 19.1642 9.73621 19.1642 9.4108 18.8388L7.2386 16.6666H4.1667C3.70646 16.6666 3.33336 16.2935 3.33336 15.8333V12.7613L1.1612 10.5892C0.835754 10.2638 0.835754 9.73609 1.1612 9.41067L3.33336 7.23848V4.16657C3.33336 3.70634 3.70646 3.33324 4.1667 3.33324H7.2386ZM5.00003 4.99991V7.92884L2.92896 9.99992L5.00003 12.071V14.9999H7.92896L10 17.071L12.0711 14.9999H15V12.071L17.0711 9.99992L15 7.92884V4.99991H12.0711L10 2.92884L7.92896 4.99991H5.00003ZM10 13.3333C8.15908 13.3333 6.6667 11.8408 6.6667 9.99992C6.6667 8.15896 8.15908 6.66657 10 6.66657C11.841 6.66657 13.3334 8.15896 13.3334 9.99992C13.3334 11.8408 11.841 13.3333 10 13.3333ZM10 11.6666C10.9205 11.6666 11.6667 10.9204 11.6667 9.99992C11.6667 9.07942 10.9205 8.33326 10 8.33326C9.07955 8.33326 8.33338 9.07942 8.33338 9.99992C8.33338 10.9204 9.07955 11.6666 10 11.6666Z"
                    className={`group-hover:fill-white ${currentPath === "/dhadmin-settings-dashboard"
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
          onClick={handleLogout}
        >
          <li
            className={`group px-4 py-2 cursor-pointer text-gray-700 hover:bg-[#3E4095] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
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
        </nav>
      </div>
    </>
  )
}

export default Admin_Sidebar_Mobile