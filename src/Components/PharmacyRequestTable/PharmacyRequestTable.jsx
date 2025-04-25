import React, { useState, useEffect } from 'react';
import { pharmacyRequests } from './PharmacyData/PharmacyRequests';
import PharmacyTablePagination from './PharmacyTablePagination/PharmacyTablePagination';


const ITEMS_PER_PAGE = 7;

const PharmacyRequestTable = () => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [displayData, setDisplayData] = useState([]);
  const totalPages = Math.ceil(pharmacyRequests.length / ITEMS_PER_PAGE);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayData(pharmacyRequests.slice(startIndex, endIndex));
  }, [currentPage]);

  const handleRowSelection = (id) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };


  return (
    <div className="relative">
      {/* {selectedRows.size > 0 && (
        <div className="sticky top-0 z-10 w-full p-3 bg-red-50 border-b border-red-200 flex justify-end">
          <button 
            className="px-4 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            onClick={handleDeclineAll}
          >
            Decline all selected
          </button>
        </div>
      )} */}
      
      <div className="overflow-x-auto ">
        <table className="w-full bg-gray-200  ">
          <thead className=" border-none  ">
            <tr className=''>
              <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Name of pharmacy
              </th>
              <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Email address
              </th>
              <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Phone number
              </th>
              <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Pharmacy address
              </th>
              <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-30 rounded"
                      checked={selectedRows.has(request.id)}
                      onChange={() => handleRowSelection(request.id)}
                    />
                  </div>
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{request.name}</div>
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{request.email}</div>
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{request.phone}</div>
                </td>
                <td className="px-3 py-3.5">
                  <div className="text-sm text-gray-500 max-w-xs">{request.address}</div>
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 6C11.45 6 11 6.45 11 7C11 7.55 11.45 8 12 8C12.55 8 13 7.55 13 7C13 6.45 12.55 6 12 6ZM12 16C11.45 16 11 16.45 11 17C11 17.55 11.45 18 12 18C12.55 18 13 17.55 13 17C13 16.45 12.55 16 12 16ZM12 11C11.45 11 11 11.45 11 12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12C13 11.45 12.55 11 12 11Z" fill="#717473"/>
</svg>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-4 py-3 flex items-center justify-between  sm:px-6 ">
        <div className="text-sm text-gray-500">
          Showing page {currentPage} of {totalPages} entries
        </div>
        <PharmacyTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default PharmacyRequestTable;
