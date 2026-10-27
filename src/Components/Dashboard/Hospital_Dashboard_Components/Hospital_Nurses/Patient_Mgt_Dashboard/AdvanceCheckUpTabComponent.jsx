import React from "react";

// Same look as the doctor's TabComponent2, but the active tab is controlled by the parent
const AdvanceCheckUpTabComponent = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div className="w-full py-3 mx-auto">
            {/* Scrolls sideways when the tabs don't fit, with the scrollbar hidden. */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 sm:overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b-0 sm:border-b border-gray-200 pb-4 sm:pb-0 sm:mb-5">
                {tabs.map((t) => (
                    <button
                        key={t.status}
                        type="button"
                        onClick={(e) => {
                            setActiveTab(t.status);
                            // Bring a half-hidden tab fully into view, since there is no scrollbar to drag.
                            e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
                        }}
                        className={`text-[13px] px-2 sm:px-6 py-2 sm:py-3 font-medium transition-colors duration-200 cursor-pointer text-center sm:whitespace-nowrap sm:shrink-0 rounded-lg sm:rounded-none ${
                            activeTab === t.status
                                ? "bg-docuhealth-primary text-white sm:bg-transparent sm:text-docuhealth-primary sm:border-b-2 sm:border-docuhealth-primary font-semibold"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 sm:hover:bg-transparent sm:border-b-2 sm:border-transparent"
                        }`}
                    >
                        <span className="inline-flex items-center justify-center gap-1.5">
                            {t.title}
                            {/* Unread-style count so nurses see waiting tasks without opening the tab */}
                            {t.badge > 0 && (
                                <span
                                    aria-label={`${t.badge} tasks`}
                                    className="min-w-[20px] h-5 px-1.5 rounded-full bg-green-500 text-white text-[11px] font-semibold leading-5 text-center shrink-0"
                                >
                                    {t.badge > 99 ? "99+" : t.badge}
                                </span>
                            )}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="py-4">
                {tabs.find((t) => t.status === activeTab)?.content}
            </div>
        </div>
    );
};

export default AdvanceCheckUpTabComponent;
