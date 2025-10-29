import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../context/Patient Context/AppContext";
import docuhealth_logo from "../../../assets/img/docuhealth_logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Patient_Dashboard_Sidebar = () => {
  const { profile, toggleEmergencyStatus, newEmergencyStatus } =
    useContext(AppContext);
  const [emergencyStatus, setEmergencyStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    if (profile) {
      setEmergencyStatus(profile?.emergency ?? false);
      setIsLoading(false);
    }
  }, [profile]);

  // ✅ React to context update
  useEffect(() => {
    if (newEmergencyStatus !== null) {
      setEmergencyStatus(newEmergencyStatus);
    }
  }, [newEmergencyStatus]);

  const handleToggle = async () => {
    if (isLoading) {
      toast.error("Please wait, loading your profile...");
      return;
    }

    try {
      // Optimistic UI update
      setEmergencyStatus((prev) => !prev);
      await toggleEmergencyStatus();
    } catch (err) {
      setEmergencyStatus(profile?.emergency ?? false); // revert if failed
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/user-login"); // 👈 redirect
  };





  return (
    <>
      <div className="pt-5 pl-5 pb-3 flex justify-between items-center  ">
        <div className="flex justify-start items-center gap-1 font-semibold text-[#3E4095]">
           <img src={docuhealth_logo} alt="Logo" className="w-6" />
                     <h1 className="text-xl">DocuHealth</h1>
        </div>
      </div>
      <nav className="mt-4 text-sm">
        <ul>
          <Link to="/user-home-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/user-home-dashboard"
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
                    className={`group-hover:fill-white ${
                      currentPath === "/user-home-dashboard" ? "fill-white" : ""
                    }`}
                  >
                    <path
                      d="M2.49999 5H17.5V15H2.49999V5ZM1.66666 3.33333C1.20643 3.33333 0.833328 3.70643 0.833328 4.16667V15.8333C0.833328 16.2936 1.20643 16.6667 1.66666 16.6667H18.3333C18.7936 16.6667 19.1667 16.2936 19.1667 15.8333V4.16667C19.1667 3.70643 18.7936 3.33333 18.3333 3.33333H1.66666ZM10.8333 6.66667H15.8333V8.33333H10.8333V6.66667ZM15 10H10.8333V11.6667H15V10ZM8.75 8.33333C8.75 9.48392 7.81725 10.4167 6.66666 10.4167C5.51607 10.4167 4.58333 9.48392 4.58333 8.33333C4.58333 7.18274 5.51607 6.25 6.66666 6.25C7.81725 6.25 8.75 7.18274 8.75 8.33333ZM6.66666 11.25C5.05583 11.25 3.74999 12.5558 3.74999 14.1667H9.58333C9.58333 12.5558 8.2775 11.25 6.66666 11.25Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/user-home-dashboard"
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
          <Link to="/user-appointments-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/user-appointments-dashboard"
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
                    className={`group-hover:fill-white ${
                      currentPath === "/user-appointments-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.83464 2.49992V0.833252H7.5013V2.49992H12.5013V0.833252H14.168V2.49992H17.5013C17.9616 2.49992 18.3346 2.87302 18.3346 3.33325V7.49992H16.668V4.16659H14.168V5.83325H12.5013V4.16659H7.5013V5.83325H5.83464V4.16659H3.33464V15.8333H8.33464V17.4999H2.5013C2.04107 17.4999 1.66797 17.1268 1.66797 16.6666V3.33325C1.66797 2.87302 2.04107 2.49992 2.5013 2.49992H5.83464ZM14.168 9.99992C12.3271 9.99992 10.8346 11.4923 10.8346 13.3333C10.8346 15.1742 12.3271 16.6666 14.168 16.6666C16.0089 16.6666 17.5013 15.1742 17.5013 13.3333C17.5013 11.4923 16.0089 9.99992 14.168 9.99992ZM9.16797 13.3333C9.16797 10.5718 11.4066 8.33325 14.168 8.33325C16.9294 8.33325 19.168 10.5718 19.168 13.3333C19.168 16.0947 16.9294 18.3333 14.168 18.3333C11.4066 18.3333 9.16797 16.0947 9.16797 13.3333ZM13.3346 10.8333V13.6784L15.2454 15.5892L16.4239 14.4107L15.0013 12.9881V10.8333H13.3346Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/user-appointments-dashboard"
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    />
                  </svg>
                </span>
                My appointments
              </li>
            </div>
          </Link>
          <Link to="/user-messages-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/user-messages-dashboard"
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
                    className={`group-hover:fill-white ${
                      currentPath === "/user-messages-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.66797 7.49478C1.66797 4.73624 3.89842 2.5 6.66852 2.5H13.3341C16.0958 2.5 18.3346 4.74565 18.3346 7.49478V17.5H6.66852C3.90679 17.5 1.66797 15.2543 1.66797 12.5052V7.49478ZM16.668 15.8333V7.49478C16.668 5.66283 15.1721 4.16667 13.3341 4.16667H6.66852C4.82179 4.16667 3.33464 5.65382 3.33464 7.49478V12.5052C3.33464 14.3372 4.83057 15.8333 6.66852 15.8333H16.668ZM11.668 9.16667H13.3346V10.8333H11.668V9.16667ZM6.66797 9.16667H8.33464V10.8333H6.66797V9.16667Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/user-messages-dashboard"
                          ? "fill-white"
                          : "fill-[#647284]"
                      }`}
                    />
                  </svg>
                </span>
                My messages
              </li>
            </div>
          </Link>
          <Link to="/user-subaccount-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/user-subaccount-dashboard"
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
                    className={`group-hover:fill-white ${
                      currentPath === "/user-subaccount-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M1.66675 18.3333C1.66675 14.6514 4.65151 11.6667 8.33341 11.6667C12.0153 11.6667 15.0001 14.6514 15.0001 18.3333H13.3334C13.3334 15.5719 11.0948 13.3333 8.33341 13.3333C5.57199 13.3333 3.33341 15.5719 3.33341 18.3333H1.66675ZM8.33341 10.8333C5.57091 10.8333 3.33341 8.59583 3.33341 5.83333C3.33341 3.07083 5.57091 0.833333 8.33341 0.833333C11.0959 0.833333 13.3334 3.07083 13.3334 5.83333C13.3334 8.59583 11.0959 10.8333 8.33341 10.8333ZM8.33341 9.16667C10.1751 9.16667 11.6667 7.675 11.6667 5.83333C11.6667 3.99167 10.1751 2.5 8.33341 2.5C6.49175 2.5 5.00008 3.99167 5.00008 5.83333C5.00008 7.675 6.49175 9.16667 8.33341 9.16667ZM15.2365 12.2523C17.5537 13.2967 19.1667 15.6267 19.1667 18.3333H17.5001C17.5001 16.3033 16.2903 14.5559 14.5524 13.7726L15.2365 12.2523ZM14.6636 2.84434C16.3287 3.53086 17.5001 5.16967 17.5001 7.08333C17.5001 9.47517 15.6702 11.4377 13.3334 11.648V9.9705C14.7473 9.7685 15.8334 8.55333 15.8334 7.08333C15.8334 5.93279 15.1681 4.93836 14.2009 4.46362L14.6636 2.84434Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/user-subaccount-dashboard"
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
          <Link to="/user-settings-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/user-settings-dashboard"
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
                    className={`group-hover:fill-white ${
                      currentPath === "/user-settings-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <g clip-path="url(#clip0_274_2617)">
                      <path
                        d="M7.2386 3.33324L9.4108 1.16107C9.73621 0.835632 10.2639 0.835632 10.5893 1.16107L12.7615 3.33324H15.8334C16.2936 3.33324 16.6667 3.70634 16.6667 4.16657V7.23848L18.8389 9.41067C19.1643 9.73609 19.1643 10.2638 18.8389 10.5892L16.6667 12.7613V15.8333C16.6667 16.2935 16.2936 16.6666 15.8334 16.6666H12.7615L10.5893 18.8388C10.2639 19.1642 9.73621 19.1642 9.4108 18.8388L7.2386 16.6666H4.1667C3.70646 16.6666 3.33336 16.2935 3.33336 15.8333V12.7613L1.1612 10.5892C0.835754 10.2638 0.835754 9.73609 1.1612 9.41067L3.33336 7.23848V4.16657C3.33336 3.70634 3.70646 3.33324 4.1667 3.33324H7.2386ZM5.00003 4.99991V7.92884L2.92896 9.99992L5.00003 12.071V14.9999H7.92896L10 17.071L12.0711 14.9999H15V12.071L17.0711 9.99992L15 7.92884V4.99991H12.0711L10 2.92884L7.92896 4.99991H5.00003ZM10 13.3333C8.15908 13.3333 6.6667 11.8408 6.6667 9.99992C6.6667 8.15896 8.15908 6.66657 10 6.66657C11.841 6.66657 13.3334 8.15896 13.3334 9.99992C13.3334 11.8408 11.841 13.3333 10 13.3333ZM10 11.6666C10.9205 11.6666 11.6667 10.9204 11.6667 9.99992C11.6667 9.07942 10.9205 8.33326 10 8.33326C9.07955 8.33326 8.33338 9.07942 8.33338 9.99992C8.33338 10.9204 9.07955 11.6666 10 11.6666Z"
                        className={`group-hover:fill-white ${
                          currentPath === "/user-settings-dashboard"
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
          <Link to="/user-subscriptions-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2   ${
                  currentPath === "/user-subscriptions-dashboard"
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
                    className={`group-hover:fill-white ${
                      currentPath === "/user-subscriptions-dashboard"
                        ? "fill-white"
                        : "fill-[#647284]"
                    }`}
                  >
                    <path
                      d="M2.50411 2.50244H17.5041C17.9644 2.50244 18.3375 2.87553 18.3375 3.33577V16.6691C18.3375 17.1293 17.9644 17.5024 17.5041 17.5024H2.50411C2.04388 17.5024 1.67078 17.1293 1.67078 16.6691V3.33577C1.67078 2.87553 2.04388 2.50244 2.50411 2.50244ZM3.33744 4.16911V15.8357H16.6708V4.16911H3.33744ZM7.08744 11.6691H11.6708C11.9009 11.6691 12.0875 11.4826 12.0875 11.2524C12.0875 11.0223 11.9009 10.8357 11.6708 10.8357H8.33746C7.18685 10.8357 6.25411 9.90307 6.25411 8.7524C6.25411 7.60184 7.18685 6.66911 8.33746 6.66911H9.17079V5.00244H10.8375V6.66911H12.9208V8.33573H8.33746C8.10733 8.33573 7.92078 8.52232 7.92078 8.7524C7.92078 8.98257 8.10733 9.16907 8.33746 9.16907H11.6708C12.8214 9.16907 13.7541 10.1018 13.7541 11.2524C13.7541 12.4031 12.8214 13.3357 11.6708 13.3357H10.8375V15.0024H9.17079V13.3357H7.08744V11.6691Z"
                      className={`group-hover:fill-white ${
                        currentPath === "/user-subscriptions-dashboard"
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

          <div className="px-4 my-4" onClick={handleLogout}>
            <li
              className={`group px-4 py-2  text-gray-700 hover:bg-[#3E4095] hover:text-white rounded-lg flex items-center gap-2 justify-start`}
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
      <hr />
      <div className="flex justify-center items-center py-3 gap-2 text-gray-700 cursor-pointer text-sm">
        <p>Emergency Mode</p>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`relative inline-flex h-5 w-11 items-center rounded-full transition-colors ${
              emergencyStatus ? "bg-black" : "bg-gray-200"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                emergencyStatus ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default Patient_Dashboard_Sidebar;
