import React, { useContext } from "react";
import docuhealth_logo from "../../../../assets/img/docuhealth_logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PharmacistAppContext } from "../../../../context/HospitalContext/Pharmacist/PharmacistAppContext";

const Hospital_Pharmacist_Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const { hospitalLogo, hospitalName } = useContext(PharmacistAppContext);

  const handleLogout = () => {
    sessionStorage.clear();   // removes ALL session-based auth data
    navigate("/login");       // redirect to login page
  };

  return (
    <>
     <div className="flex flex-col h-screen">
       <div className="pt-5 pl-5 pb-3 flex justify-between items-center">
        <div className="flex justify-start items-center gap-1 font-semibold text-docuhealth-primary">
          <img src={hospitalLogo || docuhealth_logo} alt="Logo" className="w-6 h-6 aspect-square object-cover" />
          <h1 className="text-xl">{hospitalName || "DocuHealth"}</h1>
        </div>
      </div>
    <nav className="flex-1 text-sm overflow-y-auto">
        <ul>
          <Link to="/hospital-pharmacist-home-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2 ${
                  currentPath === "/hospital-pharmacist-home-dashboard"
                    ? "bg-docuhealth-primary text-white"
                    : "text-gray-700"
                } hover:bg-docuhealth-primary hover:text-white rounded-lg flex items-center gap-2 justify-start`}
              >
                <span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 10C2.5 10.4602 2.8731 10.8333 3.33333 10.8333H8.33333C8.79358 10.8333 9.16667 10.4602 9.16667 10V3.33333C9.16667 2.8731 8.79358 2.5 8.33333 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V10ZM2.5 16.6667C2.5 17.1269 2.8731 17.5 3.33333 17.5H8.33333C8.79358 17.5 9.16667 17.1269 9.16667 16.6667V13.3333C9.16667 12.8731 8.79358 12.5 8.33333 12.5H3.33333C2.8731 12.5 2.5 12.8731 2.5 13.3333V16.6667ZM10.8333 16.6667C10.8333 17.1269 11.2064 17.5 11.6667 17.5H16.6667C17.1269 17.5 17.5 17.1269 17.5 16.6667V10C17.5 9.53975 17.1269 9.16667 16.6667 9.16667H11.6667C11.2064 9.16667 10.8333 9.53975 10.8333 10V16.6667ZM11.6667 2.5C11.2064 2.5 10.8333 2.8731 10.8333 3.33333V6.66667C10.8333 7.1269 11.2064 7.5 11.6667 7.5H16.6667C17.1269 7.5 17.5 7.1269 17.5 6.66667V3.33333C17.5 2.8731 17.1269 2.5 16.6667 2.5H11.6667Z"
                      className={`group-hover:fill-white ${currentPath === "/hospital-pharmacist-home-dashboard" ? "fill-white" : "fill-docuhealth-secondary"}`} />
                  </svg>
                </span>
                Overview
              </li>
            </div>
          </Link>

          <Link to="/hospital-pharmacist-prescriptions-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2 ${
                  currentPath === "/hospital-pharmacist-prescriptions-dashboard"
                    ? "bg-docuhealth-primary text-white"
                    : "text-gray-700"
                } hover:bg-docuhealth-primary hover:text-white rounded-lg flex items-center gap-2 justify-start`}
              >
                <span>
                  {/* Icon for Prescriptions (using a pill/medical document style) */}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.834 1.66406V3.33073H14.1673V5.83073C15.5481 5.83073 16.6673 6.95002 16.6673 8.33073V17.4974C16.6673 17.9576 16.2942 18.3307 15.834 18.3307H4.16732C3.70708 18.3307 3.33398 17.9576 3.33398 17.4974V8.33073C3.33398 6.95002 4.45328 5.83073 5.83398 5.83073V3.33073H4.16732V1.66406H15.834ZM14.1673 7.4974H5.83398C5.37375 7.4974 5.00065 7.8705 5.00065 8.33073V16.6641H15.0007V8.33073C15.0007 7.8705 14.6276 7.4974 14.1673 7.4974ZM10.834 9.16406V10.8307H12.5007V12.4974H10.8332L10.834 14.1641H9.16732L9.16648 12.4974H7.50065V10.8307H9.16732V9.16406H10.834ZM12.5007 3.33073H7.50065V5.83073H12.5007V3.33073Z"
                      className={`group-hover:fill-white ${currentPath === "/hospital-pharmacist-prescriptions-dashboard" ? "fill-white" : "fill-docuhealth-secondary"}`} />
                  </svg>
                </span>
                Prescriptions
              </li>
            </div>
          </Link>

          <Link to="/hospital-pharmacist-appointments-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2 ${
                  currentPath === "/hospital-pharmacist-appointments-dashboard"
                    ? "bg-docuhealth-primary text-white"
                    : "text-gray-700"
                } hover:bg-docuhealth-primary hover:text-white rounded-lg flex items-center gap-2 justify-start`}
              >
                <span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.83464 2.49992V0.833252H7.5013V2.49992H12.5013V0.833252H14.168V2.49992H17.5013C17.9616 2.49992 18.3346 2.87302 18.3346 3.33325V7.49992H16.668V4.16659H14.168V5.83325H12.5013V4.16659H7.5013V5.83325H5.83464V4.16659H3.33464V15.8333H8.33464V17.4999H2.5013C2.04107 17.4999 1.66797 17.1268 1.66797 16.6666V3.33325C1.66797 2.87302 2.04107 2.49992 2.5013 2.49992H5.83464ZM14.168 9.99992C12.3271 9.99992 10.8346 11.4923 10.8346 13.3333C10.8346 15.1742 12.3271 16.6666 14.168 16.6666C16.0089 16.6666 17.5013 15.1742 17.5013 13.3333C17.5013 11.4923 16.0089 9.99992 14.168 9.99992ZM9.16797 13.3333C9.16797 10.5718 11.4066 8.33325 14.168 8.33325C16.9294 8.33325 19.168 10.5718 19.168 13.3333C19.168 16.0947 16.9294 18.3333 14.168 18.3333C11.4066 18.3333 9.16797 16.0947 9.16797 13.3333ZM13.3346 10.8333V13.6784L15.2454 15.5892L16.4239 14.4107L15.0013 12.9881V10.8333H13.3346Z"
                      className={`group-hover:fill-white ${currentPath === "/hospital-pharmacist-appointments-dashboard" ? "fill-white" : "fill-docuhealth-secondary"}`} />
                  </svg>
                </span>
                Appointments
              </li>
            </div>
          </Link>

          <div 
            className="px-4 my-4 cursor-pointer" 
            onClick={() => { toast.success('feature coming soon !') }}
          >
            <li
              className={`group px-4 py-2 ${
                currentPath === "/hospital-pharmacist-messages-dashboard"
                  ? "bg-docuhealth-primary text-white"
                  : "text-gray-700"
              } hover:bg-docuhealth-primary hover:text-white rounded-lg flex items-center gap-2 justify-start`}
            >
              <span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.66797 7.49478C1.66797 4.73624 3.89842 2.5 6.66852 2.5H13.3341C16.0958 2.5 18.3346 4.74565 18.3346 7.49478V17.5H6.66852C3.90679 17.5 1.66797 15.2543 1.66797 12.5052V7.49478ZM16.668 15.8333V7.49478C16.668 5.66283 15.1721 4.16667 13.3341 4.16667H6.66852C4.82179 4.16667 3.33464 5.65382 3.33464 7.49478V12.5052C3.33464 14.3372 4.83057 15.8333 6.66852 15.8333H16.668ZM11.668 9.16667H13.3346V10.8333H11.668V9.16667ZM6.66797 9.16667H8.33464V10.8333H6.66797V9.16667Z"
                    className={`group-hover:fill-white ${currentPath === "/hospital-pharmacist-messages-dashboard" ? "fill-white" : "fill-docuhealth-secondary"}`} />
                </svg>
              </span>
              Messages
            </li>
          </div>

          <Link to="/hospital-pharmacist-healthpersonnel-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2 ${
                  currentPath === "/hospital-pharmacist-healthpersonnel-dashboard"
                    ? "bg-docuhealth-primary text-white"
                    : "text-gray-700"
                } hover:bg-docuhealth-primary hover:text-white rounded-lg flex items-center gap-2 justify-start`}
              >
                <span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.99985 12.5013C13.3995 12.5013 16.2048 15.0461 16.6149 18.3346H3.38477C3.79483 15.0461 6.60017 12.5013 9.99985 12.5013ZM8.48893 14.4009C7.29424 14.7796 6.28799 15.5957 5.66769 16.668H9.99985L8.48893 14.4009ZM11.5111 14.4011L9.99985 16.668H14.332C13.7118 15.5959 12.7057 14.7798 11.5111 14.4011ZM14.9998 1.66797V6.66797C14.9998 9.42939 12.7613 11.668 9.99985 11.668C7.23843 11.668 4.99986 9.42939 4.99986 6.66797V1.66797H14.9998ZM6.66652 6.66797C6.66652 8.50889 8.15891 10.0013 9.99985 10.0013C11.8408 10.0013 13.3332 8.50889 13.3332 6.66797H6.66652ZM13.3332 3.33464H6.66652L6.66643 5.0013H13.3331L13.3332 3.33464Z" 
                      className={`group-hover:fill-white ${currentPath === "/hospital-pharmacist-healthpersonnel-dashboard" ? "fill-white" : "fill-docuhealth-secondary"}`} />
                  </svg>
                </span>
                Health Personnel
              </li>
            </div>
          </Link>
       
        </ul>
      </nav>
      <div className="text-sm border-t border-gray-100 pb-4 pt-2 shrink-0">
        <ul>
          <Link to="/hospital-pharmacist-settings-dashboard">
            <div className="px-4 my-4">
              <li
                className={`group px-4 py-2 ${
                  currentPath === "/hospital-pharmacist-settings-dashboard"
                    ? "bg-docuhealth-primary text-white"
                    : "text-gray-700"
                } hover:bg-docuhealth-primary hover:text-white rounded-lg flex items-center gap-2 justify-start`}
              >
                <span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.2386 3.33324L9.4108 1.16107C9.73621 0.835632 10.2639 0.835632 10.5893 1.16107L12.7615 3.33324H15.8334C16.2936 3.33324 16.6667 3.70634 16.6667 4.16657V7.23848L18.8389 9.41067C19.1643 9.73609 19.1643 10.2638 18.8389 10.5892L16.6667 12.7613V15.8333C16.6667 16.2935 16.2936 16.6666 15.8334 16.6666H12.7615L10.5893 18.8388C10.2639 19.1642 9.73621 19.1642 9.4108 18.8388L7.2386 16.6666H4.1667C3.70646 16.6666 3.33336 16.2935 3.33336 15.8333V12.7613L1.1612 10.5892C0.835754 10.2638 0.835754 9.73609 1.1612 9.41067L3.33336 7.23848V4.16657C3.33336 3.70634 3.70646 3.33324 4.1667 3.33324H7.2386ZM5.00003 4.99991V7.92884L2.92896 9.99992L5.00003 12.071V14.9999H7.92896L10 17.071L12.0711 14.9999H15V12.071L17.0711 9.99992L15 7.92884V4.99991H12.0711L10 2.92884L7.92896 4.99991H5.00003ZM10 13.3333C8.15908 13.3333 6.6667 11.8408 6.6667 9.99992C6.6667 8.15896 8.15908 6.66657 10 6.66657C11.841 6.66657 13.3334 8.15896 13.3334 9.99992C13.3334 11.8408 11.841 13.3333 10 13.3333ZM10 11.6666C10.9205 11.6666 11.6667 10.9204 11.6667 9.99992C11.6667 9.07942 10.9205 8.33326 10 8.33326C9.07955 8.33326 8.33338 9.07942 8.33338 9.99992C8.33338 10.9204 9.07955 11.6666 10 11.6666Z"
                      className={`group-hover:fill-white ${currentPath === "/hospital-pharmacist-settings-dashboard" ? "fill-white" : "fill-docuhealth-secondary"}`} />
                  </svg>
                </span>
                Settings
              </li>
            </div>
          </Link>

          <div className="px-4 my-2" onClick={handleLogout}>
            <li className="group px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg flex items-center gap-2 justify-start cursor-pointer transition-colors duration-150">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.33329 12.4998H4.99996V16.6665H15V3.33317H4.99996V7.49984H3.33329V2.49984C3.33329 2.0396 3.70639 1.6665 4.16663 1.6665H15.8333C16.2935 1.6665 16.6666 2.0396 16.6666 2.49984V17.4998C16.6666 17.9601 16.2935 18.3332 15.8333 18.3332H4.16663C3.70639 18.3332 3.33329 17.9601 3.33329 17.4998V12.4998ZM8.33329 9.1665V6.6665L12.5 9.99984L8.33329 13.3332V10.8332H1.66663V9.1665H8.33329Z"
                  className="fill-red-500 group-hover:fill-white" />
              </svg>
              Log-out
            </li>
          </div>
        </ul>
      </div>
    </div>
    </>
  );
};

export default Hospital_Pharmacist_Sidebar;
