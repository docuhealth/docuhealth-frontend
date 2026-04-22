import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import Pagination2 from "../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";
import SearchBar from "../../Components/SearchBar/SearchBar";
import DynamicDate from "../../Components/DynamicDate/DynamicDate";
import HospitalRequestDetail from "./HospitalRequestDetail";

const Admin_Hospital_Requests_Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    
    // For detail view
    const [viewDetailRequest, setViewDetailRequest] = useState(null);

    // For options popup (Approve button)
    const [activeMenu, setActiveMenu] = useState(null);
    const [approving, setApproving] = useState(null);

    const pageSize = 10; 

    const fetchRequests = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`api/admin/hospitals/verification-requests?page=${page}&size=${pageSize}`);
            setRequests(res.data.results || []);
            setCount(res.data.count || 0);
            setCurrentPage(page);
            setTotalPages(Math.ceil((res.data.count || 0) / pageSize));
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch hospital verification requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(currentPage);
    }, [currentPage]);

    const approveHospital = async (requestId) => {
        setApproving(requestId);
        try {
            await axiosInstance.post(
                "api/admin/hospitals/approve-verification",
                {
                    verification_request: requestId,
                    redirect_url: "https://docuhealthservices.net/hospital-onboarding",
                }
            );
            toast.success("Hospital approved successfully!");
            setActiveMenu(null);
            if (viewDetailRequest && viewDetailRequest.id === requestId) {
              setViewDetailRequest({...viewDetailRequest, status: "approved"})
            }
            fetchRequests(currentPage);
        } catch (err) {
            console.error(err);
            toast.error("Failed to approve hospital");
        } finally {
            setApproving(null);
        }
    };

    // Filter frontend side for search query (email, status or id)
    const displayedRequests = useMemo(() => {
        if (!searchQuery) return requests;
        const searchStr = searchQuery.toLowerCase();
        return requests.filter(req => {
            return req.official_email?.toLowerCase().includes(searchStr) || 
                   req.status?.toLowerCase().includes(searchStr) ||
                   req.id?.toString().includes(searchStr);
        });
    }, [requests, searchQuery]);

    return (
        <div className="flex flex-col">
            <div className="py-2 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <DynamicDate />
            </div>
            
            <div className="bg-white my-5 rounded-lg flex-1">
                <div className="border rounded-lg p-4 lg:p-6 h-full flex flex-col">
                  {viewDetailRequest ? (
                      <HospitalRequestDetail 
                        selectedRequest={viewDetailRequest} 
                        setViewDetailRequest={setViewDetailRequest}
                        approveHospital={approveHospital}
                        approving={approving} 
                      />
                  ) : (
                    <>
                      <h2 className="mb-4 pb-2 border-b font-medium">
                          Hospital Requests
                      </h2>
                    
                    <div className="mb-4 w-full">
                      <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search by email, ID or status..."
                      />
                    </div>
                    
                    <div className="hidden lg:flex lg:flex-col">
                      <div className="grid grid-cols-5 text-left text-sm bg-gray-100 py-5 rounded-md">
                        <p className="pl-5">Hospital ID</p>
                        <p>Email</p>
                        <p>Requested At</p>
                        <p>Status</p>
                        <p className="text-center">Options</p>
                      </div>

                      {loading ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
                      ) : displayedRequests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No verification requests found.</div>
                      ) : (
                        <div className="flex flex-col">
                          {displayedRequests.map((req, index) => (
                              <div key={req.id || `req-${index}`} className="grid grid-cols-5 items-center py-4 border-b border-b-gray-200 text-[12px] text-gray-700 text-left w-full hover:bg-gray-50">
                                <p className="pl-5 font-semibold text-gray-800">#{req.id || index}</p>
                                <div className="pr-4">
                                  <p className="truncate font-medium">{req.official_email}</p>
                                </div>
                                <p className="truncate pr-4">
                                  {new Date(req.created_at).toLocaleDateString()} {new Date(req.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                                <p className={`capitalize font-medium ${req.status === "approved" ? "text-green-600" : req.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                                  {req.status}
                                </p>

                                <div className="relative flex justify-center">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenu(activeMenu === index ? null : index);
                                    }} 
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                  >
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" /></svg>
                                  </button>
                                  {activeMenu === index && (
                                    <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 rounded-md shadow z-50 p-2">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setViewDetailRequest(req); setActiveMenu(null); }} 
                                        className="w-full text-left p-2 rounded font-medium transition-colors hover:bg-blue-50 text-[#3E4095]"
                                      >
                                        View more info
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveMenu(null); approveHospital(req.id); }} 
                                        disabled={approving === req.id || req.status === "approved"}
                                        className={`w-full text-left p-2 rounded-md font-medium transition-colors ${
                                            req.status === "approved" ? "text-gray-400 cursor-not-allowed" : "hover:bg-green-50 text-green-600"
                                        }`}
                                      >
                                        {approving === req.id ? "Approving..." : req.status === "approved" ? "Already Approved" : "Approve Hospital"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* MOBILE LIST VIEW */}
                    <div className="block lg:hidden space-y-4 my-4">
                      {loading ? (
                        <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
                      ) : displayedRequests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No verification requests found.</div>
                      ) : (
                        displayedRequests.map((req) => (
                          <div
                            key={req.id}
                            className="bg-white border border-gray-200 rounded-md p-4 transition-transform"
                          >
                            {/* Header: ID and Status */}
                            <div className="flex items-center gap-3 pb-3 border-b border-gray-50 mb-3">
                              <div className="bg-blue-50 p-2 rounded-full">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 19V6.2C4 5.0799 4 4.51984 4.21799 4.09202C4.40973 3.71569 4.71569 3.40973 5.09202 3.21799C5.51984 3 6.0799 3 7.2 3H16.8C17.9201 3 18.4802 3 18.908 3.21799C19.2843 3.40973 19.5903 3.71569 19.782 4.09202C20 4.51984 20 5.0799 20 6.2V19M4 19H20M4 19H2C2 19 2 21 4 21H20C22 21 22 19 20 19M12 7V11M10 9H14" stroke="#3E4095" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                  Hospital ID: #{req.id}
                                </p>
                                <p className={`text-sm font-semibold capitalize ${req.status === "approved" ? "text-green-600" : req.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                                  {req.status}
                                </p>
                              </div>
                            </div>
              
                            {/* Body: Email and Requested At */}
                            <div className="space-y-3 mb-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-600 shrink-0">
                                    {req.official_email?.[0]?.toUpperCase() || "H"}
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] text-gray-400">Email Address</p>
                                    <p className="text-[13px] font-medium text-gray-700 truncate w-[130px] sm:w-[200px]">
                                      {req.official_email}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-[10px] text-gray-400">Requested At</p>
                                  <p className="text-[11px] font-medium text-gray-500">
                                    {new Date(req.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
              
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              <button
                                className="bg-white border border-[#3E4095] text-[#3E4095] rounded-full py-2 text-[12px] font-semibold flex items-center justify-center flex-1 hover:bg-blue-50 transition-colors"
                                onClick={() => setViewDetailRequest(req)}
                              >
                                View Details
                              </button>
                              {req.status !== "approved" && (
                                <button
                                  className="bg-[#3E4095] border border-[#3E4095] text-white rounded-full py-2 text-[12px] font-semibold flex items-center justify-center flex-1 hover:bg-[#2e3070] transition-colors"
                                  onClick={() => approveHospital(req.id)}
                                  disabled={approving === req.id}
                                >
                                  {approving === req.id ? "Approving..." : "Approve"}
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {!loading && totalPages > 1 && (
                      <div className="mt-4">
                         <Pagination2 count={count} currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
                      </div>
                    )}
                    </>
                  )}
                </div>
            </div>
        </div>
    );
};

export default Admin_Hospital_Requests_Dashboard;
