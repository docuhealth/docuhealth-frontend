import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PharmacyTablePagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];

    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis1');
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis2');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="inline-flex  rounded-md shadow-sm" aria-label="Pagination">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${
          currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50'
        }`}
      >
        <span className="sr-only">Previous</span>
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      {pageNumbers.map((page, index) => {
        if (page === 'ellipsis1' || page === 'ellipsis2') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium   ${
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${
          currentPage === totalPages ? 'cursor-not-allowed' : 'hover:bg-gray-50'
        }`}
      >
        <span className="sr-only">Next</span>
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </nav>
  );
};

export default PharmacyTablePagination;
