import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { pharmacyRequests } from "./PharmacyData/PharmacyRequests";
import PharmacyTablePagination from "./PharmacyTablePagination/PharmacyTablePagination";

const ITEMS_PER_PAGE = 7;

const PharmacyRequestTable = () => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [displayData, setDisplayData] = useState([]);
  const [openPopover, setOpenPopover] = useState(null);
  const [activePharmacy, setActivePharmacy] = useState(false);

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

  const togglePopover = (index) => {
    setOpenPopover(openPopover === index ? null : index);
  };

  const handleCopy = (phone) => {
    console.log(phone);
    navigator.clipboard.writeText(phone);
    alert("Phone number copied to clipboard!");
  };

  return (
    <div className="relative">
      <div className="bg-white  px-5 border-t rounded-t-2xl ">
        <div className="py-5 flex justify-between items-center flex-wrap gap-3">
          <h1 className="text-md font-medium text-gray-800">
            
            {activePharmacy ? 'Active Pharmacies' : 'Pharm-code request'}
          </h1>
          <div className="flex gap-3 items-center">
            {selectedRows.size > 0 && (
              <div className=" flex justify-end gap-3">
                <button
                  className="px-4 py-1.5 border border-red-400  text-red-400 rounded-full text-sm font-medium  transition-colors"
                  // onClick={handleDeclineAll}
                >
                  {activePharmacy ? 'Block selected pharmacies' : 'Decline all selected'}
                </button>
                <button
                  className={` ${activePharmacy ? 'hidden' : ''} px-4 py-1.5 border border-[#0000FF]  text-[#0000FF]   rounded-full text-sm font-medium  transition-colors`}
                  // onClick={handleDeclineAll}
                >
                  Approve all selected
                </button>
              </div>
            )}
            <button
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#0000FF] border border-[#0000FF] rounded-full"
              onClick={() => console.log("View approved pharmacies clicked")}
            >
              <Eye size={16} />
              <span onClick={() => setActivePharmacy(!activePharmacy)}>{activePharmacy ? 'View Pharm-Code Request' : 'View approved pharmacies'}</span>
            </button>
          </div>
        </div>
      </div>

      {activePharmacy ? (  <div className="overflow-x-auto ">
        <table className="w-full bg-gray-200  ">
          <thead className=" border-none  ">
            <tr className="">
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
            {displayData.map((request, index) => (
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
                  <div className="text-sm font-medium text-gray-900">
                    {request.name}
                  </div>
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{request.email}</div>
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{request.phone}</div>
                </td>
                <td className="px-3 py-3.5">
                  <div className="text-sm text-gray-500 max-w-xs">
                    {request.address}
                  </div>
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap  text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      onClick={() => togglePopover(index)}
                      // className={` ${
                      //           openPopover === index
                      //             ? "bg-gray-100 p-2 rounded-full"
                      //             : ""
                      //         }`}
                    >
                      <path
                        d="M12 6C11.45 6 11 6.45 11 7C11 7.55 11.45 8 12 8C12.55 8 13 7.55 13 7C13 6.45 12.55 6 12 6ZM12 16C11.45 16 11 16.45 11 17C11 17.55 11.45 18 12 18C12.55 18 13 17.55 13 17C13 16.45 12.55 16 12 16ZM12 11C11.45 11 11 11.45 11 12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12C13 11.45 12.55 11 12 11Z"
                        fill="#717473"
                      />
                    </svg>

                    {openPopover === index && (
                      <div className="absolute right-0 mt-8 bg-white border shadow-md rounded-lg p-2 w-52  z-30">
                        <p
                          className={` ${activePharmacy ? 'hidden' : ''} text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer`}
                          onClick={() => {
                            console.log("Approve request clicked", request.id);
                          }}
                        >
                           {activePharmacy ? '' : 'Approve Request'}
                        </p>{" "}
                        <p
                          className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer"
                          onClick={() => {
                            console.log("blocked", request.id);
                          }}
                        >
                           {activePharmacy ? 'Block this pharmacy' : ''}
                        </p>{" "}
                        <p className={` ${activePharmacy ? 'hidden' : ''} text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer`}>
                        {activePharmacy ? '' : 'Decline Request'}
                        </p>
                        <p
                          className={` ${activePharmacy ? 'hidden' : ''} text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer`}
                          onClick={() => handleCopy(request.phone)}
                        >
                             {activePharmacy ? '' : 'Copy Phone Number'} 
                        </p>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>) :   <div className="overflow-x-auto ">
        <table className="w-full bg-gray-200  ">
          <thead className=" border-none  ">
            <tr className="">
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
            {displayData.map((request, index) => (
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
                  <div className="text-sm font-medium text-gray-900">
                    {request.name}
                  </div>
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{request.email}</div>
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{request.phone}</div>
                </td>
                <td className="px-3 py-3.5">
                  <div className="text-sm text-gray-500 max-w-xs">
                    {request.address}
                  </div>
                </td>
                <td className="px-3 py-3.5 whitespace-nowrap  text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      onClick={() => togglePopover(index)}
                      // className={` ${
                      //           openPopover === index
                      //             ? "bg-gray-100 p-2 rounded-full"
                      //             : ""
                      //         }`}
                    >
                      <path
                        d="M12 6C11.45 6 11 6.45 11 7C11 7.55 11.45 8 12 8C12.55 8 13 7.55 13 7C13 6.45 12.55 6 12 6ZM12 16C11.45 16 11 16.45 11 17C11 17.55 11.45 18 12 18C12.55 18 13 17.55 13 17C13 16.45 12.55 16 12 16ZM12 11C11.45 11 11 11.45 11 12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12C13 11.45 12.55 11 12 11Z"
                        fill="#717473"
                      />
                    </svg>

                    {openPopover === index && (
                      <div className="absolute right-0 mt-8 bg-white border shadow-md rounded-lg p-2 w-52  z-30">
                        <p
                          className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer"
                          onClick={() => {
                            console.log("Approve request clicked", request.id);
                          }}
                        >
                          Approve Request
                        </p>{" "}
                        <p className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer">
                          Decline Request
                        </p>
                        <p
                          className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer"
                          onClick={() => handleCopy(request.phone)}
                        >
                          Copy Phone Number
                        </p>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    

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
