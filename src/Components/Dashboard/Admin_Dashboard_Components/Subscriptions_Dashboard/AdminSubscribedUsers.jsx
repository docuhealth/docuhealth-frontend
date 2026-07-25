import React, { useContext, useState } from "react";
import { AdminSubscriptionsContext } from "../../../../context/AdminContext/AdminSubscriptionsContext";
import Pagination2 from "../../Patient_Dashboard_Components/Pagination/Pagination2";
import SearchBar from "../../../SearchBar/SearchBar";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const AdminSubscribedUsers = () => {
  const {
    subscribedUsers,
    subscribedUsersCount,
    subscribedUsersTotalPages,
    subscribedUsersPage,
    setSubscribedUsersPage,
    subscribedUsersSearch,
    setSubscribedUsersSearch,
    subscribedUsersLoading,
    subscribedUsersFetching,
  } = useContext(AdminSubscriptionsContext);

  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="bg-white my-5 border rounded-lg p-4 lg:p-6">
      {/* Section header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-semibold text-gray-900">Subscribed users</h2>
        <button
          id="toggle-subscribed-search"
          onClick={() => { setShowSearch((v) => !v); if (showSearch) setSubscribedUsersSearch(""); }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Search"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Search bar (toggleable) */}
      {showSearch && (
        <div className="mb-4">
          <SearchBar
            value={subscribedUsersSearch}
            onChange={setSubscribedUsersSearch}
            placeholder="Search by name or plan..."
          />
          {subscribedUsersFetching && (
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3E4095] rounded-full animate-spin" />
              Searching...
            </p>
          )}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block">
        {/* Table Header */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] text-left text-xs bg-gray-50 py-4 rounded-md px-4 gap-4 items-center">
          <div className="w-5">
            {/* checkbox placeholder col */}
          </div>
          <p className="font-medium text-gray-600">Name</p>
          <p className="font-medium text-gray-600">Current plan</p>
          <p className="font-medium text-gray-600">Status</p>
          <p className="font-medium text-gray-600">Start date</p>
          <p className="font-medium text-gray-600">Expiring date</p>
        </div>

        {/* Table Body */}
        {subscribedUsersLoading ? (
          <div className="py-16 text-center text-sm text-gray-400 animate-pulse">Loading subscribed users...</div>
        ) : subscribedUsers.length === 0 ? (
          <EmptyState search={subscribedUsersSearch} />
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {subscribedUsers.map((sub, idx) => (
              <SubscribedUserRow key={sub.sqid || sub.id || idx} sub={sub} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-3 mt-2">
        {subscribedUsersLoading ? (
          <div className="py-10 text-center text-sm text-gray-400 animate-pulse">Loading subscribed users...</div>
        ) : subscribedUsers.length === 0 ? (
          <EmptyState search={subscribedUsersSearch} />
        ) : (
          subscribedUsers.map((sub, idx) => (
            <SubscribedUserCard key={sub.sqid || sub.id || idx} sub={sub} />
          ))
        )}
      </div>

      {/* Pagination */}
      {!subscribedUsersLoading && subscribedUsersTotalPages > 1 && (
        <Pagination2
          count={subscribedUsersCount}
          currentPage={subscribedUsersPage}
          totalPages={subscribedUsersTotalPages}
          setCurrentPage={setSubscribedUsersPage}
        />
      )}
    </div>
  );
};

// Shared sub-components

const SubscribedUserRow = ({ sub }) => {
  const userName =
    sub.user_name || sub.name || sub.hospital_name || sub.full_name || "—";
  const avatar =
    sub.profile_image?.url || sub.avatar || null;

  return (
    <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_auto] gap-4 items-center py-4 px-4 hover:bg-gray-50 transition-colors text-sm text-gray-700">
      {/* Checkbox */}
      <div className="w-5">
        <input
          type="checkbox"
          className="w-4 h-4 accent-docuhealth-primary cursor-pointer"
          aria-label={`Select ${userName}`}
        />
      </div>

      {/* Name + Avatar */}
      <div className="flex items-center gap-2 min-w-0">
        <UserAvatar name={userName} src={avatar} />
        <span className="truncate text-[13px] font-medium text-gray-800">{userName}</span>
      </div>

      {/* Plan */}
      <p className="truncate text-[13px] text-gray-700">{sub.plan_name || sub.plan || "—"}</p>

      {/* Status */}
      <StatusBadge status={sub.status} />

      {/* Start date */}
      <p className="text-[13px] text-gray-600">{formatDate(sub.start_date)}</p>

      {/* Expiring date */}
      <p className="text-[13px] text-gray-600">{formatDate(sub.end_date || sub.expiry_date)}</p>
    </div>
  );
};

const SubscribedUserCard = ({ sub }) => {
  const userName =
    sub.user_name || sub.name || sub.hospital_name || sub.full_name || "—";
  const avatar = sub.profile_image?.url || sub.avatar || null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <UserAvatar name={userName} src={avatar} size="lg" />
        <div>
          <p className="font-semibold text-gray-800 text-sm">{userName}</p>
          <p className="text-xs text-gray-500">{sub.plan_name || sub.plan || "—"}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={sub.status} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div>
          <p className="text-gray-400">Start date</p>
          <p className="font-medium">{formatDate(sub.start_date)}</p>
        </div>
        <div>
          <p className="text-gray-400">Expiring date</p>
          <p className="font-medium">{formatDate(sub.end_date || sub.expiry_date)}</p>
        </div>
      </div>
    </div>
  );
};

const UserAvatar = ({ name, src, size = "sm" }) => {
  const dim = size === "lg" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";
  if (src) {
    return <img src={src} alt={name} className={`${dim} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${dim} rounded-full bg-docuhealth-primary/10 text-docuhealth-primary font-bold flex items-center justify-center shrink-0`}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const isActive = status === "active";
  return (
    <span
      className={`text-xs font-semibold capitalize ${isActive ? "text-green-600" : "text-gray-500"}`}
    >
      {status || "—"}
    </span>
  );
};

const EmptyState = ({ search }) => (
  <div className="py-16 flex flex-col items-center text-center gap-2">
    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
    </svg>
    <p className="text-sm text-gray-500">
      {search ? `No results found for "${search}".` : "No subscribed users found."}
    </p>
  </div>
);

export default AdminSubscribedUsers;
