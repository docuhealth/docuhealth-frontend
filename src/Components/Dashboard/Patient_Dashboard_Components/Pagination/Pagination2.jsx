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
        const showMax = 3; // Number of pages to show before/after current

        if (totalPages <= 7) {
            // If total pages is small, show all
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > showMax + 1) pages.push("...");

            // Range around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - showMax) pages.push("...");

            // Always show last page
            pages.push(totalPages);
        }
        return pages;
    };


    return (
        <>
            <div>
                {totalPages > 1 && (
                    <div className="flex flex-col md:flex-row gap-3 justify-between items-center my-5">
                        <span className="text-gray-500 text-[12px]">
                            Showing page {currentPage} of {totalPages} ({count} total entries)
                        </span>

                        <div className="flex items-center text-[12px]">

                            <button
                                className={`h-8 w-8 mx-1 rounded-full ${currentPage === 1
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>

                            {getPageNumbers().map((page, index) => (
                                <button
                                    key={index}
                                    disabled={page === "..."}
                                    className={`h-8 w-8 mx-1 rounded-full transition-colors ${currentPage === page
                                            ? "bg-[#3E4095] text-white"
                                            : page === "..."
                                                ? "cursor-default text-gray-400"
                                                : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                                        }`}
                                    onClick={() => page !== "..." && setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                className={`h-8 w-8 mx-1 rounded-full ${currentPage === totalPages
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Pagination2