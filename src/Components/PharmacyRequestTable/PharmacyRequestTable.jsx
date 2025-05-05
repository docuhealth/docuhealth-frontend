import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { toast } from "react-toastify";


const ITEMS_PER_PAGE = 7;

const PharmacyRequestTable = () => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openPopover, setOpenPopover] = useState(null);
  const [activePharmacy, setActivePharmacy] = useState(false);
  const [pharmacyData, setPharmacyData] = useState([]);
  const [isPharmacyList, setIsPharmacyList] = useState(false);
  const [loading, setLoading] = useState(false);


  
  const handleRowSelection = (id) => {
    setSelectedRows((prevSelected) => {
      const newSelection = new Set(prevSelected);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const togglePopover = (index) => {
    setOpenPopover(openPopover === index ? null : index);
  };

  const handleCopy = (phone) => {
    console.log(phone);
    navigator.clipboard.writeText(phone);
    alert("Phone number copied to clipboard!");
  };

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAllPharmacies = async () => {
      setLoading(true);
      // Retrieve the JWT token from localStorage
      const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your token key

      try {
        const url = new URL("https://docuhealth-backend-h03u.onrender.com/api/admin/pharmarcy/get_all");
        url.searchParams.append("page", currentPage);
        url.searchParams.append("size", itemsPerPage);
        
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        

        // Handle the response
        if (response.ok) {
          setLoading(false);
          const data = await response.json(); // Wait for the JSON to be parsed
          console.log(data); // Now this will log the actual JSON object
          setTotalPages(data.total_pages)
          if (data.pharmacies.length > 0) {
            setPharmacyData(data.pharmacies);
            setIsPharmacyList(true);
          } else {
            setIsPharmacyList(false);
          }
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch dashboard data:", errorData);
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);

        // Handle unexpected errors
        throw error;
      } finally {
        // console.log(datainfo);
        setLoading(false);
      }
    };

    fetchAllPharmacies();
  }, [currentPage]);

  const handleRequestApprove = async (pharma_code) => {
    toast.success("Pharmacy request is being approved");
    console.log(pharma_code);

    const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your token key

    const payload = {
      pharma_codes: [pharma_code], // If there's more than one pharma code, add them here
    };

    try {
      // Construct the URL with query parameters
      const url = `https://docuhealth-backend-h03u.onrender.com/api/admin/pharmarcy/approve_registration`;

      // Make the GET request
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`, // Add JWT token to the Authorization header
        },
        body: JSON.stringify(payload), // Convert the payload to a JSON string
      });

      // Handle the response
      if (response.ok) {
        setLoading(false);
        const data = await response.json(); // Wait for the JSON to be parsed
        console.log(data); // Now this will log the actual JSON object
        toast.success(data.message); // Assuming the API returns a pharmacy_name field
        toast.success("Kindly refresh to see changes");
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch dashboard data:", errorData);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);

      // Handle unexpected errors
      throw error;
    } finally {
    }
  };
  const handleRequestDecline = async (pharma_code) => {
    toast.success("Pharmacy request is being blocked");
    console.log(pharma_code);

    const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your token key

    const payload = {
      pharma_codes: [pharma_code], // If there's more than one pharma code, add them here
    };

    try {
      // Construct the URL with query parameters
      const url = `https://docuhealth-backend-h03u.onrender.com/api/admin/pharmarcy/block`;

      // Make the GET request
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`, // Add JWT token to the Authorization header
        },
        body: JSON.stringify(payload), // Convert the payload to a JSON string
      });

      // Handle the response
      if (response.ok) {
        setLoading(false);
        const data = await response.json(); // Wait for the JSON to be parsed
        console.log(data); // Now this will log the actual JSON object
        toast.success("Pharmacy request blocked successfully");
        toast.success("Kindly refresh to see changes");
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch dashboard data:", errorData);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);

      // Handle unexpected errors
      throw error;
    } finally {
    }
  };
  const handleDeclineAll = async () => {
    const selectedIds = Array.from(selectedRows);
    console.log("Declining requests for IDs:", selectedIds);

    toast.success("Pharmacy requests are being blocked");

    const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your token key

    const payload = {
      pharma_codes: selectedIds,
    };

    try {
      // Construct the URL with query parameters
      const url = `https://docuhealth-backend-h03u.onrender.com/api/admin/pharmarcy/block`;

      // Make the GET request
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`, // Add JWT token to the Authorization header
        },
        body: JSON.stringify(payload), // Convert the payload to a JSON string
      });

      // Handle the response
      if (response.ok) {
        setLoading(false);
        const data = await response.json(); // Wait for the JSON to be parsed
        console.log(data); // Now this will log the actual JSON object
        toast.success("Pharmacy requests blocked successfully");
        toast.success("Kindly refresh to see changes");
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch dashboard data:", errorData);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);

      // Handle unexpected errors
      throw error;
    } finally {
    }
    setSelectedRows(new Set());
  };
  const handleApproveAll = async () => {
    const selectedIds = Array.from(selectedRows);
    console.log("Approving requests for IDs:", selectedIds);

    toast.success("Pharmacy requests are being approved");

    const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your token key

    const payload = {
      pharma_codes: selectedIds, // If there's more than one pharma code, add them here
    };

    try {
      // Construct the URL with query parameters
      const url = `https://docuhealth-backend-h03u.onrender.com/api/admin/pharmarcy/approve_registration`;

      // Make the GET request
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`, // Add JWT token to the Authorization header
        },
        body: JSON.stringify(payload), // Convert the payload to a JSON string
      });

      // Handle the response
      if (response.ok) {
        setLoading(false);
        const data = await response.json(); // Wait for the JSON to be parsed
        console.log(data); // Now this will log the actual JSON object
        toast.success(data.message); // Assuming the API returns a pharmacy_name field
        toast.success("Kindly refresh to see changes");
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch dashboard data:", errorData);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);

      // Handle unexpected errors
      throw error;
    } finally {
    }
    setSelectedRows(new Set());
  };

  return (
    <div className="relative">
      <div className="bg-white  px-5 border-t rounded-t-2xl ">
        <div className="py-5 flex justify-between items-center flex-wrap gap-3">
          <h1 className="text-md font-medium text-gray-800">
            {activePharmacy ? "Active Pharmacies" : "Pharm-code request"}
          </h1>
          <div className="flex gap-3 items-center">
            {selectedRows.size > 0 && (
              <div className=" flex justify-end gap-3">
                <button
                  className="px-4 py-1.5 border border-red-400  text-red-400 rounded-full text-sm font-medium  transition-colors"
                  onClick={handleDeclineAll}
                >
                  {activePharmacy
                    ? "Block selected pharmacies"
                    : "Decline all selected"}
                </button>
                <button
                  className={` ${
                    activePharmacy ? "hidden" : ""
                  } px-4 py-1.5 border border-[#0000FF]  text-[#0000FF]   rounded-full text-sm font-medium  transition-colors`}
                  onClick={handleApproveAll}
                >
                  Approve all selected
                </button>
              </div>
            )}
            <button
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#0000FF] border border-[#0000FF] rounded-full"
            >
              <Eye size={16} />
              <span onClick={() => setActivePharmacy(!activePharmacy)}>
                {activePharmacy
                  ? "View Pharm-Code Request"
                  : "View approved pharmacies"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {activePharmacy ? (
        <div className="overflow-x-auto ">
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
                <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!pharmacyData || pharmacyData.length === 0 ? (
                <p>No pharmacy data available.</p>
              ) : pharmacyData.filter((pharmacy) => pharmacy.status === 'approved')
                  .length === 0 ? (
                <p>No approved pharmacies found.</p>
              ) :
               (
                pharmacyData
                  .filter((pharmacy) => pharmacy.status === 'approved')
                  .map((request,index) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-30 rounded"
                            checked={selectedRows.has(request.pharma_code)}
                            onChange={() =>
                              handleRowSelection(request.pharma_code)
                            }
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.name}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {request.email}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {request.phone_num}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="text-sm text-gray-500 max-w-xs">
                          {request.address}
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div
                          className={`text-sm font-medium max-w-xs ${
                            request.status === "approved"
                              ? "text-green-600"
                              : request.status === "blocked"
                              ? "text-red-600"
                              : "text-yellow-500" // for 'pending' or anything else
                          }`}
                        >
                          {request.status}
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
                                className={` ${
                                  activePharmacy ? "hidden" : ""
                                } text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer`}
                                onClick={() => {
                                  console.log(
                                    "Approve request clicked",
                                    request.id
                                  );
                                }}
                              >
                                {activePharmacy ? "" : "Approve Request"}
                              </p>{" "}
                              <p
                                className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer"
                                onClick={() => handleRequestDecline(request.pharma_code)}
                              
                              >
                                {activePharmacy ? "Block this pharmacy" : ""}
                              </p>{" "}
                              <p
                                className={` ${
                                  activePharmacy ? "hidden" : ""
                                } text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer`}
                              >
                                {activePharmacy ? "" : "Decline Request"}
                              </p>
                              <p
                                className={` ${
                                  activePharmacy ? "hidden" : ""
                                } text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer`}
                                onClick={() => handleCopy(request.phone)}
                              >
                                {activePharmacy ? "" : "Copy Phone Number"}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto ">
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
                <th className="px-3 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* {displayData.map((request, index) => (
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
                              console.log(
                                "Approve request clicked",
                                request.id
                              );
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
              ))} */}

              {isPharmacyList &&
                pharmacyData.length > 0 &&
                pharmacyData.map((request, index) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-30 rounded"
                          checked={selectedRows.has(request.pharma_code)}
                          onChange={() =>
                            handleRowSelection(request.pharma_code)
                          }
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.name}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {request.email}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {request.phone_num}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="text-sm text-gray-500 max-w-xs">
                        {request.address}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <div
                        className={`text-sm font-medium max-w-xs ${
                          request.status === "approved"
                            ? "text-green-600"
                            : request.status === "blocked"
                            ? "text-red-600"
                            : "text-yellow-500" // for 'pending' or anything else
                        }`}
                      >
                        {request.status}
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
                              onClick={() =>
                                handleRequestApprove(request.pharma_code)
                              }
                            >
                              Approve Request
                            </p>{" "}
                            <p
                              className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer"
                              onClick={() =>
                                handleRequestDecline(request.pharma_code)
                              }
                            >
                              Decline Request
                            </p>
                            <p
                              className="text-sm text-gray-700 hover:bg-gray-200 p-2 rounded cursor-pointer"
                              onClick={() => handleCopy(request.phone_num)}
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
          {loading ? (
            <p className="text-center bg-white py-5 text-sm">
              Pharmacy requests loading
            </p>
          ) : isPharmacyList ? (
            <p className="text-center bg-white py-5 hidden"></p>
          ) : (
            <p className="text-center bg-white py-5 text-sm">
              No pharmacy requests are available
            </p>
          )}
        </div>
      )}


{totalPages > 1 && (
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center my-4">
            {/* Pagination Info */}
            <span className="text-gray-500 text-sm">
              Showing page {currentPage} of {totalPages} entries
            </span>

            {/* Pagination Buttons */}
            <div className="flex items-center">
              {/* Previous Button */}
              <button
                className={`px-3 py-1 mx-1 rounded-full ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-3 py-1 mx-1 rounded-full ${
                    currentPage === i + 1
                      ? "bg-[#0000FF] text-white"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              {/* Next Button */}
              <button
                className={`px-3 py-1 mx-1 rounded-full ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      
    </div>
  );
};

export default PharmacyRequestTable;
