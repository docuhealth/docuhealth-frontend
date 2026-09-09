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
    // `fixed` + `top-0 inset-x-0` pins this shell to the viewport and takes it out of
    // normal document flow, so its height can never add to <body>'s scroll height.
    // Height comes from `h-dvh` (dynamic viewport height) rather than `bottom-0`:
    // mobile browsers resize the visible viewport as their address bar/toolbar
    // show or hide, and `dvh` tracks that live, whereas a `fixed` box pinned via
    // `bottom-0` can end up measured against a stale/larger viewport and get its
    // bottom edge tucked behind the browser chrome.
    <div className="fixed inset-x-0 top-0 h-dvh flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 shadow-sm border z-20 h-full hidden lg:block">
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
      {/* min-h-0/min-w-0: flex items default to a content-based minimum size, which
          lets this column grow taller than its allotted space instead of being
          capped there. Without it, `main` below never actually gets bounded, so
          its own overflow-y-auto has nothing to scroll — the excess is just
          silently clipped by the shell's overflow-hidden, unreachable. */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
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
        <main className="flex-1 min-h-0 p-4 lg:p-6 pb-34 lg:pb-6 overflow-y-auto bg-docuhealth-gray-lightest">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
