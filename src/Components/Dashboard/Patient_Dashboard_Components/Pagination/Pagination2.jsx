import React from "react";

const Pagination2 = ({
    count,
    currentPage,
    totalPages,
    setCurrentPage
}) => {

    if (totalPages <= 1) return null;

    // Logic to determine which page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const showMax = 3; 

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > showMax) pages.push("...");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - (showMax - 1)) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center my-6 px-2">
            {/* Entries Info */}
            <span className="text-gray-500 text-[12px] order-2 md:order-1">
                Showing page <span className="font-semibold text-gray-700">{currentPage}</span> of{" "}
                <span className="font-semibold text-gray-700">{totalPages}</span> ({count} total entries)
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 order-1 md:order-2">
                {/* Previous Button */}
                <button
                    className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
                        currentPage === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6"/>
                    </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                            {page === "..." ? (
                                <span className="px-2 text-gray-400">...</span>
                            ) : (
                                <button
                                    className={`h-8 min-w-[32px] px-2 rounded-md text-[12px] font-medium transition-all ${
                                        currentPage === page
                                            ? "bg-[#3E4095] text-white shadow-sm"
                                            : "text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                                    }`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
                        currentPage === totalPages
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Pagination2;