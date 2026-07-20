import React, { useState, useEffect,  } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import Pagination from "../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination";

const ApproveHospitals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openOptions, setOpenOptions] = useState(null);
    const [approving, setApproving] = useState(null);
    const pageSize = 6; // Example page size

    const navigate = useNavigate()

    const fetchRequests = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(
                `api/hospitals/verification-request?page=${page}&size=${pageSize}`
            );
            console.log(res)
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

    const approveHospital = async (requestId) => {
        setApproving(requestId);
        try {
            await axiosInstance.post(
                "api/hospitals/approve-verification",
                {
                    verification_request: requestId,
                    redirect_url: "https://docuhealthservices.net/hospital-onboarding",
                }
            );
            toast.success("Hospital approved successfully!");
            fetchRequests(currentPage); // refresh the list
        } catch (err) {
            console.error(err);
            toast.error("Failed to approve hospital");
        } finally {
            setApproving(null);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();   // removes ALL session-based auth data
        navigate("/");       // redirect to login page
    };

    useEffect(() => {
        fetchRequests(currentPage);
    }, [currentPage]);


    if (loading) {
        return (
            <>
                <div className="flex flex-col justify-center items-center text-center h-screen">
                    <p className="font-medium pb-1">No verification requests!</p>
                    <p className="text-gray-500 text-[12px]">
                        Currently there are no hospitals pending verification.
                    </p>
                </div>
                <div className="flex justify-center items-center h-screen text-sm">
                    Loading...
                </div>
            </>

        );
    }

    if (requests.length === 0) {
        return (
            <>
                <div className="flex justify-end items-end mr-10 mt-10 ">
                    <p className="rounded-full py-2 px-8 text-sm bg-docuhealth-primary text-white cursor-pointer"
                        onClick={handleLogout}
                    >Log Out</p>
                </div>
                <div className="flex flex-col justify-center items-center text-center h-screen">
                    <p className="font-medium pb-1">No verification requests!</p>
                    <p className="text-gray-500 text-[12px]">
                        Currently there are no hospitals pending verification.
                    </p>
                </div>
            </>

        );
    }

    return (
        <>
            <div className="flex justify-end items-end mr-10 mt-10 ">
                <p className="rounded-full py-2 px-8 text-sm bg-docuhealth-primary text-white cursor-pointer"
                    onClick={handleLogout}
                >Log Out</p>
            </div>
            <div className="flex flex-col mx-10 mt-10">
                {/* Table Header */}
                <div className="grid grid-cols-6 text-left text-sm bg-gray-100 py-5 rounded-md">
                    <p className="pl-5">Hospital ID</p>
                    <p>Email</p>
                    <p>Doc</p>
                    <p>Requested At</p>
                    <p>Status</p>
                    <p>Options</p>
                </div>

                {/* Table Rows */}
                {requests.map((req, index) => (
                    <div
                        key={req.id}
                        className="grid grid-cols-6 items-center text-[12px] text-gray-700 border-b border-gray-200 relative"
                    >
                        <p className="py-4 pl-5">{req.id}</p>
                        <p className="py-4 truncate">{req.official_email}</p>
                        <div className="py-4 flex gap-2">
                            {req.documents.map((doc, i) => (
                                <a
                                    key={i}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline text-[12px]"
                                >
                                    {doc.name || doc.filename}
                                </a>
                            ))}
                        </div>
                        <p className="py-4">
                            {new Date(req.created_at).toLocaleDateString()}{" "}
                            {new Date(req.created_at).toLocaleTimeString()}
                        </p>
                        <p
                            className={`py-4 capitalize ${req.status === "approved" ? "text-green-600" : "text-gray-700"
                                }`}
                        >
                            {req.status}
                        </p>

                        <div className="relative py-4">
                            <button
                                className="px-2 py-1 bg-gray-200 rounded"
                                onClick={() =>
                                    setOpenOptions(openOptions === index ? null : index)
                                }
                            >
                                Options
                            </button>

                            {openOptions === index && (
                                <div className="absolute top-10 right-0 bg-white border shadow-sm rounded p-2 w-40 z-30">
                                    <p
                                        className={`text-[12px] text-gray-700 hover:bg-gray-100 p-2 rounded cursor-pointer ${approving === req.id ? "opacity-50 pointer-events-none" : ""
                                            }`}
                                        onClick={() => approveHospital(req.id)}
                                    >
                                        {approving === req.id ? "Approving..." : "Approve Hospital"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Pagination */}
                <Pagination
                    count={count}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    fetchData={fetchRequests}
                    loading={loading}
                />
            </div>
        </>
    );
};

export default ApproveHospitals;
