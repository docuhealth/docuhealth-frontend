import React from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

/**
 * @typedef {Object} NavItem
 * @property {string} name
 * @property {string} path
 * @property {function(boolean): React.ReactNode} icon
 * @property {function(): void} [onClick]
 * @property {string[]} [activePaths]
 */

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {any} [props.profile]
 * @param {string} [props.hospitalLogo]
 * @param {string} [props.hospitalName]
 * @param {string} [props.roleLabel]
 * @param {NavItem[]} [props.navItems]
 * @param {NavItem[]} [props.bottomNavItems]
 * @param {function(): void} [props.handleLogout]
 * @param {React.ReactNode} [props.customBottomContent]
 */
const DashboardLayout = ({
  children,
  profile,
  hospitalLogo,
  hospitalName,
  roleLabel,
  navItems = [],
  bottomNavItems = [],
  handleLogout,
  customBottomContent,
}) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 shadow-sm border z-20 min-h-screen hidden lg:block">
        <DashboardSidebar
          hospitalLogo={hospitalLogo}
          hospitalName={hospitalName}
          navItems={navItems}
          bottomNavItems={bottomNavItems}
          handleLogout={handleLogout}
          customBottomContent={customBottomContent}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header (Desktop + Mobile + Mobile Sidebar) */}
        <header>
          <DashboardHeader
            profile={profile}
            hospitalLogo={hospitalLogo}
            hospitalName={hospitalName}
            roleLabel={roleLabel}
            navItems={navItems}
            bottomNavItems={bottomNavItems}
            handleLogout={handleLogout}
            customBottomContent={customBottomContent}
          />
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto bg-docuhealth-gray-lightest">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
