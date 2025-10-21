import React, { useState, useEffect, useContext } from "react";
import logo from "../../../../assets/img/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Hospital_Admin_Sidebar = () => {
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
          <Link to="/hospital-admin-home-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-admin-home-dashboard"
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
                      currentPath === "/hospital-admin-home-dashboard"
                        ? "fill-white"
                        : ""
                    }`}
                  >
                    <path
                      d="M2.5 10C2.5 10.4602 2.8731 10.8333 3.33333 10.8333H8.33333C8.79358 10.8333 9.16667 10.4602 9.16667 10V3.33333C9.16667 2.8731 8.79358 2.5 8.33333 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V10ZM2.5 16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H8.33333C8.79358 17.5 9.16667 17.1269 9.16667 16.6667V13.3333C9.16667 12.8731 8.79358 12.5 8.33333 12.5H3.33333C2.8731 12.5 2.5 12.8731 2.5 13.3333V16.6667ZM10.8333 16.6667C10.8333 17.1269 11.2064 17.5 11.6667 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V10C17.5 9.53975 17.1269 9.16667 16.6667 9.16667H11.6667C11.2064 9.16667 10.8333 9.53975 10.8333 10V16.6667ZM11.6667 2.5C11.2064 2.5 10.8333 2.8731 10.8333 3.33333V6.66667C10.8333 7.1269 11.2064 7.5 11.6667 7.5H16.6667C17.1269 7.5 17.5 7.1269 17.5 6.66667V3.33333C17.5 2.8731 17.1269 2.5 16.6667 2.5H11.6667Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/hospital-admin-home-dashboard"
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
          <Link to="/hospital-admin-staff-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-admin-staff-dashboard"
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
                      currentPath === "/hospital-admin-staff-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M7.08366 5.83333C7.08366 6.75381 6.33747 7.5 5.41699 7.5C4.49652 7.5 3.75033 6.75381 3.75033 5.83333C3.75033 4.91286 4.49652 4.16667 5.41699 4.16667C6.33747 4.16667 7.08366 4.91286 7.08366 5.83333ZM2.08366 5.83333C2.08366 7.67428 3.57604 9.16667 5.41699 9.16667C7.25794 9.16667 8.75033 7.67428 8.75033 5.83333C8.75033 3.99238 7.25794 2.5 5.41699 2.5C3.57604 2.5 2.08366 3.99238 2.08366 5.83333ZM7.50033 13.75C7.50033 12.5994 6.56758 11.6667 5.41699 11.6667C4.2664 11.6667 3.33366 12.5994 3.33366 13.75V15.8333H7.50033V13.75ZM9.16699 17.5H1.66699V13.75C1.66699 11.6789 3.34593 10 5.41699 10C7.48806 10 9.16699 11.6789 9.16699 13.75V17.5ZM16.2503 5.83333C16.2503 6.75381 15.5042 7.5 14.5837 7.5C13.6632 7.5 12.917 6.75381 12.917 5.83333C12.917 4.91286 13.6632 4.16667 14.5837 4.16667C15.5042 4.16667 16.2503 4.91286 16.2503 5.83333ZM11.2503 5.83333C11.2503 7.67428 12.7427 9.16667 14.5837 9.16667C16.4246 9.16667 17.917 7.67428 17.917 5.83333C17.917 3.99238 16.4246 2.5 14.5837 2.5C12.7427 2.5 11.2503 3.99238 11.2503 5.83333ZM16.667 13.75C16.667 12.5994 15.7342 11.6667 14.5837 11.6667C13.4331 11.6667 12.5003 12.5994 12.5003 13.75V15.8333H16.667V13.75ZM10.8337 15.8333V13.75C10.8337 11.6789 12.5126 10 14.5837 10C16.6547 10 18.3337 11.6789 18.3337 13.75V17.5H10.8337V15.8333Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/hospital-admin-staff-dashboard"
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    />
                  </svg>
                </span>
                Staff Mgt.
              </li>
            </div>
          </Link>
          <Link to="/hospital-admin-patients-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-admin-patients-dashboard"
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
                      currentPath === "/hospital-admin-patients-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M12.5 3.33268H4.16667V16.666H15.8333V6.66602H12.5V3.33268ZM2.5 2.49252C2.5 2.03606 2.87291 1.66602 3.33208 1.66602H13.3333L17.4998 5.83268L17.5 17.4931C17.5 17.9568 17.1292 18.3327 16.6722 18.3327H3.32783C2.87063 18.3327 2.5 17.9533 2.5 17.5062V2.49252ZM10 9.58268C8.84942 9.58268 7.91667 8.64993 7.91667 7.49935C7.91667 6.34876 8.84942 5.41602 10 5.41602C11.1506 5.41602 12.0833 6.34876 12.0833 7.49935C12.0833 8.64993 11.1506 9.58268 10 9.58268ZM6.27288 14.166C6.48016 12.291 8.06977 10.8327 10 10.8327C11.9303 10.8327 13.5198 12.291 13.7271 14.166H6.27288Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/hospital-admin-patients-dashboard"
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
          <Link to="/hospital-admin-messages-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-admin-messages-dashboard"
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
                      currentPath === "/hospital-admin-messages-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M1.66797 7.49478C1.66797 4.73624 3.89842 2.5 6.66852 2.5H13.3341C16.0958 2.5 18.3346 4.74565 18.3346 7.49478V17.5H6.66852C3.90679 17.5 1.66797 15.2543 1.66797 12.5052V7.49478ZM16.668 15.8333V7.49478C16.668 5.66283 15.1721 4.16667 13.3341 4.16667H6.66852C4.82179 4.16667 3.33464 5.65382 3.33464 7.49478V12.5052C3.33464 14.3372 4.83057 15.8333 6.66852 15.8333H16.668ZM11.668 9.16667H13.3346V10.8333H11.668V9.16667ZM6.66797 9.16667H8.33464V10.8333H6.66797V9.16667Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/hospital-admin-messages-dashboard"
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
          <Link to="/hospital-admin-appointments-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-admin-appointments-dashboard"
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
                      currentPath === "/hospital-admin-appointments-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M5.83464 2.49992V0.833252H7.5013V2.49992H12.5013V0.833252H14.168V2.49992H17.5013C17.9616 2.49992 18.3346 2.87302 18.3346 3.33325V7.49992H16.668V4.16659H14.168V5.83325H12.5013V4.16659H7.5013V5.83325H5.83464V4.16659H3.33464V15.8333H8.33464V17.4999H2.5013C2.04107 17.4999 1.66797 17.1268 1.66797 16.6666V3.33325C1.66797 2.87302 2.04107 2.49992 2.5013 2.49992H5.83464ZM14.168 9.99992C12.3271 9.99992 10.8346 11.4923 10.8346 13.3333C10.8346 15.1742 12.3271 16.6666 14.168 16.6666C16.0089 16.6666 17.5013 15.1742 17.5013 13.3333C17.5013 11.4923 16.0089 9.99992 14.168 9.99992ZM9.16797 13.3333C9.16797 10.5718 11.4066 8.33325 14.168 8.33325C16.9294 8.33325 19.168 10.5718 19.168 13.3333C19.168 16.0947 16.9294 18.3333 14.168 18.3333C11.4066 18.3333 9.16797 16.0947 9.16797 13.3333ZM13.3346 10.8333V13.6784L15.2454 15.5892L16.4239 14.4107L15.0013 12.9881V10.8333H13.3346Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/hospital-admin-appointments-dashboard"
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
          <Link to="/hospital-admin-wallet-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-admin-wallet-dashboard"
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
                      currentPath === "/hospital-admin-wallet-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M18.3376 5.83333H19.1709V14.1667H18.3376V16.6667C18.3376 17.1269 17.9645 17.5 17.5042 17.5H2.50423C2.044 17.5 1.6709 17.1269 1.6709 16.6667V3.33333C1.6709 2.87309 2.044 2.5 2.50423 2.5H17.5042C17.9645 2.5 18.3376 2.87309 18.3376 3.33333V5.83333ZM16.6709 14.1667H11.6709C9.36975 14.1667 7.50423 12.3012 7.50423 10C7.50423 7.69881 9.36975 5.83333 11.6709 5.83333H16.6709V4.16667H3.33757V15.8333H16.6709V14.1667ZM17.5042 12.5V7.5H11.6709C10.2902 7.5 9.17092 8.61926 9.17092 10C9.17092 11.3807 10.2902 12.5 11.6709 12.5H17.5042ZM11.6709 9.16667H14.1709V10.8333H11.6709V9.16667Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/hospital-admin-wallet-dashboard"
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    />
                  </svg>
                </span>
                Wallet
              </li>
            </div>
          </Link>
          <Link to="/hospital-admin-settings-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-admin-settings-dashboard"
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
                      currentPath === "/hospital-admin-settings-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M7.2386 3.33324L9.4108 1.16107C9.73621 0.835632 10.2639 0.835632 10.5893 1.16107L12.7615 3.33324H15.8334C16.2936 3.33324 16.6667 3.70634 16.6667 4.16657V7.23848L18.8389 9.41067C19.1643 9.73609 19.1643 10.2638 18.8389 10.5892L16.6667 12.7613V15.8333C16.6667 16.2935 16.2936 16.6666 15.8334 16.6666H12.7615L10.5893 18.8388C10.2639 19.1642 9.73621 19.1642 9.4108 18.8388L7.2386 16.6666H4.1667C3.70646 16.6666 3.33336 16.2935 3.33336 15.8333V12.7613L1.1612 10.5892C0.835754 10.2638 0.835754 9.73609 1.1612 9.41067L3.33336 7.23848V4.16657C3.33336 3.70634 3.70646 3.33324 4.1667 3.33324H7.2386ZM5.00003 4.99991V7.92884L2.92896 9.99992L5.00003 12.071V14.9999H7.92896L10 17.071L12.0711 14.9999H15V12.071L17.0711 9.99992L15 7.92884V4.99991H12.0711L10 2.92884L7.92896 4.99991H5.00003ZM10 13.3333C8.15908 13.3333 6.6667 11.8408 6.6667 9.99992C6.6667 8.15896 8.15908 6.66657 10 6.66657C11.841 6.66657 13.3334 8.15896 13.3334 9.99992C13.3334 11.8408 11.841 13.3333 10 13.3333ZM10 11.6666C10.9205 11.6666 11.6667 10.9204 11.6667 9.99992C11.6667 9.07942 10.9205 8.33326 10 8.33326C9.07955 8.33326 8.33338 9.07942 8.33338 9.99992C8.33338 10.9204 9.07955 11.6666 10 11.6666Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/hospital-admin-settings-dashboard"
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
          <Link to="/hospital-admin-subscriptions-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/hospital-admin-subscriptions-dashboard"
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
                      currentPath === "/hospital-admin-subscriptions-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M2.50411 2.50244H17.5041C17.9644 2.50244 18.3375 2.87553 18.3375 3.33577V16.6691C18.3375 17.1293 17.9644 17.5024 17.5041 17.5024H2.50411C2.04388 17.5024 1.67078 17.1293 1.67078 16.6691V3.33577C1.67078 2.87553 2.04388 2.50244 2.50411 2.50244ZM3.33744 4.16911V15.8357H16.6708V4.16911H3.33744ZM7.08744 11.6691H11.6708C11.9009 11.6691 12.0875 11.4826 12.0875 11.2524C12.0875 11.0223 11.9009 10.8357 11.6708 10.8357H8.33746C7.18685 10.8357 6.25411 9.90307 6.25411 8.7524C6.25411 7.60184 7.18685 6.66911 8.33746 6.66911H9.17079V5.00244H10.8375V6.66911H12.9208V8.33573H8.33746C8.10733 8.33573 7.92078 8.52232 7.92078 8.7524C7.92078 8.98257 8.10733 9.16907 8.33746 9.16907H11.6708C12.8214 9.16907 13.7541 10.1018 13.7541 11.2524C13.7541 12.4031 12.8214 13.3357 11.6708 13.3357H10.8375V15.0024H9.17079V13.3357H7.08744V11.6691Z"
                      className={`group-hover:fill-white ${
                        currentPath ===
                        "/hospital-admin-subscriptions-dashboard"
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

           <div className="px-4 my-4" 
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
  );
};

export default Hospital_Admin_Sidebar;
