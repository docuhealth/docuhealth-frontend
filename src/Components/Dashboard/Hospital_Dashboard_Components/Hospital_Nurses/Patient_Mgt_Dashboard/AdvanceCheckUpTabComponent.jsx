import React from "react";

const AdvanceCheckUpTabComponent = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div>
            {/* Mobile/Tablet Tabs (Grid Layout) */}
            <div className="grid grid-cols-2 gap-3 mb-8 lg:hidden">
                {tabs.map((t, index) => (
                    <button
                        key={`mobile-${index}`}
                        onClick={() => setActiveTab(t.status)}
                        className={`px-3 py-2.5 text-[13px] sm:text-sm font-medium rounded-lg transition-all ${
                            activeTab === t.status
                                ? "bg-docuhealth-primary text-white shadow-sm"
                                : "bg-white text-gray-500 border border-transparent hover:border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {t.title}
                    </button>
                ))}
            </div>

            {/* Desktop Tabs (Underline Layout) */}
            <div className="hidden lg:flex gap-6 border-b border-gray-200 mb-6">
                {tabs.map((t, index) => (
                    <button
                        key={`desktop-${index}`}
                        onClick={() => setActiveTab(t.status)}
                        className={`pb-3 text-sm font-medium transition-colors relative ${
                            activeTab === t.status
                                ? "text-docuhealth-primary"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {t.title}
                        {activeTab === t.status && (
                            <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-docuhealth-primary"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div>
                {tabs.find((t) => t.status === activeTab)?.content}
            </div>
        </div>
    );
};

export default AdvanceCheckUpTabComponent;
