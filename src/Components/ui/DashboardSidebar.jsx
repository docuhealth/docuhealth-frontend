import React from "react";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import { Link, useLocation } from "react-router-dom";

const DashboardSidebar = ({ 
  hospitalLogo, 
  hospitalName, 
  navItems = [], 
  bottomNavItems = [], 
  handleLogout,
  customBottomContent
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex flex-col h-full">
      <div className="pt-5 pl-5 pb-3 flex justify-between items-center shrink-0">
        <div className="flex justify-start items-center gap-1 font-semibold text-docuhealth-primary">
          <img src={hospitalLogo || docuhealth_logo} alt="Logo" className="w-6 h-6 aspect-square object-cover" />
          <h1 className="text-xl">{hospitalName || "DocuHealth"}</h1>
        </div>
      </div>
      
      {/* nav + bottom block share one scroll container instead of nav scrolling
          internally while the bottom block is pinned below it via flex-grow math
          — see DashboardMobileSidebar for why that pinning isn't reliable. */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
      <nav className="text-sm">
        <ul>
          {navItems.map((item, index) => {
            const isActive = currentPath === item.path || (item.activePaths && item.activePaths.includes(currentPath));
            
            const liContent = (
              <li
                className={`group px-4 py-2 ${
                  isActive ? "bg-docuhealth-primary text-white" : "text-gray-700"
                } hover:bg-docuhealth-primary hover:text-white rounded-lg flex items-center gap-2 justify-start transition-colors duration-150`}
              >
                <span>
                  {item.icon(isActive)}
                </span>
                {item.name}
              </li>
            );

            if (item.onClick) {
              return (
                <div key={index} className="px-4 my-4 cursor-pointer" onClick={item.onClick}>
                  {liContent}
                </div>
              );
            }

            return (
              <Link to={item.path} key={index}>
                <div className="px-4 my-4">
                  {liContent}
                </div>
              </Link>
            );
          })}
        </ul>
      </nav>

      <div className="text-sm border-t border-gray-100 pb-4 pt-2 mt-auto shrink-0">
        <ul>
          {bottomNavItems.map((item, index) => {
            const isActive = currentPath === item.path || (item.activePaths && item.activePaths.includes(currentPath));

            const liContent = (
              <li
                className={`group px-4 py-2 ${
                  isActive ? "bg-docuhealth-primary text-white" : "text-gray-700"
                } hover:bg-docuhealth-primary hover:text-white rounded-lg flex items-center gap-2 justify-start transition-colors duration-150`}
              >
                <span>
                  {item.icon(isActive)}
                </span>
                {item.name}
              </li>
            );

            if (item.onClick) {
              return (
                <div key={index} className="px-4 my-2 cursor-pointer" onClick={item.onClick}>
                  {liContent}
                </div>
              );
            }

            return (
              <Link to={item.path} key={index}>
                <div className="px-4 my-2">
                  {liContent}
                </div>
              </Link>
            );
          })}

          <div className="px-4 my-2" onClick={handleLogout}>
            <li className="group px-4 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg flex items-center gap-2 justify-start cursor-pointer transition-colors duration-150">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.33329 12.4998H4.99996V16.6665H15V3.33317H4.99996V7.49984H3.33329V2.49984C3.33329 2.0396 3.70639 1.6665 4.16663 1.6665H15.8333C16.2935 1.6665 16.6666 2.0396 16.6666 2.49984V17.4998C16.6666 17.9601 16.2935 18.3332 15.8333 18.3332H4.16663C3.70639 18.3332 3.33329 17.9601 3.33329 17.4998V12.4998ZM8.33329 9.1665V6.6665L12.5 9.99984L8.33329 13.3332V10.8332H1.66663V9.1665H8.33329Z"
                  className="fill-red-500 group-hover:fill-white"
                />
              </svg>
              Log-out
            </li>
          </div>
        </ul>
        {customBottomContent}
      </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
