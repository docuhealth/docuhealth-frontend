import React, { useState, useEffect } from 'react';
import { Check, X, Phone } from 'lucide-react';
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

  const handleDeclineAll = () => {
    console.log("Declining all selected requests:", Array.from(selectedRows));
    setSelectedRows(new Set());
  };

  const handleApprove = (request) => {
    console.log("Approving request:", request);
  };

  const handleDeny = (request) => {
    console.log("Denying request:", request);
  };

  const handleCopyPhone = (phone) => {
    console.log("Copying phone number:", phone);
    // navigator.clipboard.writeText(phone); // Uncomment in real implementation
  };

  return (
    <div className="relative">
      {selectedRows.size > 0 && (
        <div className="sticky top-0 z-10 w-full p-3 bg-red-50 border-b border-red-200 flex justify-end">
          <button 
            className="px-4 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            onClick={handleDeclineAll}
          >
            Decline all selected
          </button>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border-none">
          <thead className=" border-none">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Name of pharmacy
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Email address
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Phone number
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Pharmacy address
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
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
                    {request.status === 'approved' ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">
                        Approved
                      </span>
                    ) : request.status === 'denied' ? (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-md">
                        Denied
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(request)}
                          className="text-green-500 hover:text-green-700"
                          title="Approve request"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleDeny(request)}
                          className="text-red-500 hover:text-red-700"
                          title="Deny request"
                        >
                          <X size={18} />
                        </button>
                        <button
                          onClick={() => handleCopyPhone(request.phone)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Copy phone number"
                        >
                          <Phone size={18} />
                        </button>
                      </>
                    )}
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
