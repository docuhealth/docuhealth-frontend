import React from "react";

const Pagination = ({
  count,
  currentPage,
  totalPages,
  fetchData,
}) => {
  return (
    <>
      <div>
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center my-5">
            <span className="text-gray-500 text-[12px]">
              Showing page {currentPage} of {totalPages} ({count} total entries)
            </span>

            <div className="flex items-center text-[12px]">
              {/* Previous */}
              <button
                className={`h-8 w-8 mx-1 rounded-full ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => fetchData(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`h-8 w-8 mx-1 rounded-full ${
                    currentPage === i + 1
                      ? "bg-[#0000FF] text-white"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  onClick={() => fetchData(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              {/* Next */}
              <button
                className={`h-8 w-8 mx-1 rounded-full ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => fetchData(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Pagination;
