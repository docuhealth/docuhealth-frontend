const HealthPersonnelMobileCard = ({ staff, displayName }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5 active:bg-gray-50 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-docuhealth-primary font-bold text-sm shadow-inner">
          {staff.firstname?.[0]}{staff.lastname?.[0]}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 text-[15px] truncate">
            {displayName(staff)}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-docuhealth-primary text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {staff.role || "—"}
            </span>
            <span className="text-[10px] text-gray-400">
              {staff.staff_id || staff.staffId || "—"}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 px-2 py-1 rounded-lg">
        <p className="text-[10px] text-gray-500 font-bold uppercase">
          {staff.gender || staff.sex || "—"}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-2 bg-gray-50 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 text-gray-600">
        <div className="bg-white p-1.5 rounded-md shadow-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-docuhealth-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </div>
        <p className="text-[12px] font-medium">{staff.phone_num || "—"}</p>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <div className="bg-white p-1.5 rounded-md shadow-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-docuhealth-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        <p className="text-[12px] font-medium truncate">{staff.email || "—"}</p>
      </div>
    </div>

    <button className="flex-1 w-full bg-docuhealth-primary py-2.5 rounded-full flex items-center justify-center gap-2 text-[12px] font-bold text-white hover:bg-docuhealth-dark-primary transition-colors">
      Message
    </button>
  </div>
);

export default HealthPersonnelMobileCard;
