import React, { useState, useEffect } from "react";
import dashb from "../../assets/img/dashb.png";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import { X, UploadCloud, FileText } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { useLocation, useNavigate } from "react-router-dom";

const Hospital_Verification_Request = () => {
    const [email, setEmail] = useState("");
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [inquiry, setInquiry] = useState(null);

    const location = useLocation();
    const navigate = useNavigate()

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const inquiryId = queryParams.get("inquiry_id");
        if (inquiryId){setInquiry(inquiryId)
        }else{
            toast.error("Invalid or missing verification parameters.");
            setTimeout(() => navigate("/"), 1500);
    };
    }, [location.search]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newFiles = files.map((file) => ({
            file,
            preview:
                file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        }));
        setDocuments((prevDocs) => [...prevDocs, ...newFiles]);
    };

    const removeDocument = (index) => {
        setDocuments((prevDocs) => {
            const updated = prevDocs.filter((_, i) => i !== index);
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || documents.length === 0) {
            toast.error("Please provide an email and at least one document.");
            return;
        }

        if (!inquiry) {
            toast.error("Missing inquiry ID in URL.");
            return;
        }

        setLoading(true);

        // console.log(inquiry)
        // console.log(documents) 
        // console.log (email)

        const formData = new FormData();
        formData.append("inquiry", inquiry);
        formData.append("official_email", email);
    
        // Append multiple documents
        documents.forEach((doc) => {
          formData.append("documents", doc.file);
        });

        for (let [key, value] of formData.entries()) {
            console.log(key, value);
          }
      


        try {
            // Send to API
            const res = await axiosInstance.post("api/hospitals/verification-request", formData)

            console.log("✅ Server Response:", res);
            toast.success("Verification request sent successfully!");
            setEmail("");
            setDocuments([]);
            setTimeout(()=> {
                navigate('/')
            },2000)
        } catch (error) {
            // toast.error("Something went wrong. Please try again.");
            // console.log
            toast.error(error.response.data.detail)
        } finally {
            setLoading(false);
            setEmail("");
            setDocuments([]);
        }
    };


    return (
        <>
            <div className="hidden h-screen sm:flex">
                <div className="w-full flex-1">
                    <div className="hidden sm:flex justify-center items-center py-10 h-screen">
                        <Link to="/">
                            <div className="fixed top-10 left-10 flex gap-1 items-center font-semibold text-[#3E4095]">
                                <img src={docuhealth_logo} alt="Logo" className="w-6" />
                                <h1 className="text-xl">DocuHealth</h1>
                            </div>
                        </Link>

                        <div className="w-full  px-10">
                            <h2 className="text-xl font-semibold pb-1">
                                Get Verified as a Provider!
                            </h2>
                            <p className="text-gray-600 mb-6 text-sm">
                                Input your official email and supporting documents.
                            </p>

                            <form onSubmit={handleSubmit} className="text-sm space-y-4">
                                {/* Email Input */}
                                <div>
                                    <p className="font-semibold pb-1">Email:</p>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-[#3E4095]"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Custom File Upload */}
                                <div>
                                    <p className="font-semibold pb-1">Upload Documents:</p>
                                    <label
                                        htmlFor="file-upload"
                                        className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-400 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition"
                                    >
                                        <UploadCloud className="w-5 h-5 text-[#3E4095]" />
                                        <span className="text-[#3E4095] font-medium">
                                            Click to upload
                                        </span>
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />

                                    {/* Preview Section */}
                                    {documents.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {documents.map((doc, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {doc.preview ? (
                                                            <img
                                                                src={doc.preview}
                                                                alt="Preview"
                                                                className="w-10 h-10 object-cover rounded-md border"
                                                            />
                                                        ) : (
                                                            <FileText className="w-8 h-8 text-gray-500" />
                                                        )}
                                                        <span className="truncate text-sm">
                                                            {doc.file.name}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDocument(index)}
                                                        className="text-gray-500 hover:text-red-600 transition"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full ${loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#3E4095] cursor-pointer"
                                        } text-white py-3 rounded-full transition-colors`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Sending Message...
                                        </div>
                                    ) : (
                                        "Send message"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div
                    className="flex-1 h-screen flex flex-col justify-center items-center p-4"
                    style={{
                        background: "linear-gradient(to bottom, #3E4095, #718FCC)",
                    }}
                >
                    <div className="">
                        <p className="text-white font-semibold text-xl pb-1 sm:text-2xl">
                            The simplest way to manage <br /> medical records
                        </p>
                        <p className="text-white font-light text-sm">
                            No better way to attend to, and keep records of medical records
                        </p>
                    </div>

                    <div className="max-h-[420px] flex justify-center items-center pt-2">
                        <img
                            src={dashb}
                            alt="Dashboard"
                            className="object-contain w-full h-full"
                        />
                    </div>
                </div>
            </div>

            <div className="h-screen flex flex-col justify-center items-center sm:hidden py-10">
                <div className=" fixed top-10 left-5  flex gap-1 items-center font-semibold text-[#3E4095]">
                    <img src={docuhealth_logo} alt="Logo" className="w-6" />
                    <h1 className="text-xl">DocuHealth</h1>
                </div>
                <div className="px-5 w-full">
                    <h2 className="text-xl font-semibold pb-1">
                        Get Verified as a Provider!
                    </h2>
                    <p className="text-gray-600 mb-6 text-sm">
                        Input your official email and supporting documents.
                    </p>
                    <form onSubmit={handleSubmit} className="text-sm space-y-4">
                        {/* Email Input */}
                        <div>
                            <p className="font-semibold pb-1">Email:</p>
                            <div className="relative">
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 border rounded-lg pl-10 outline-none focus:border-[#3E4095]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Custom File Upload */}
                        <div>
                            <p className="font-semibold pb-1">Upload Documents:</p>
                            <label
                                htmlFor="file-upload"
                                className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-400 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition"
                            >
                                <UploadCloud className="w-5 h-5 text-[#3E4095]" />
                                <span className="text-[#3E4095] font-medium">
                                    Click to upload
                                </span>
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {/* Preview Section */}
                            {documents.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {documents.map((doc, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg overflow-scroll"
                                        >
                                            <div className="flex items-center gap-3">
                                                {doc.preview ? (
                                                    <img
                                                        src={doc.preview}
                                                        alt="Preview"
                                                        className="w-10 h-10 object-cover rounded-md border"
                                                    />
                                                ) : (
                                                    <FileText className="w-8 h-8 text-gray-500" />
                                                )}
                                                <span
                                                    className="text-sm"
                                                    title={doc.file.name} // shows full name on hover
                                                >
                                                    {doc.file.name.length > 20
                                                        ? doc.file.name.substring(0, 20) + "..."
                                                        : doc.file.name}
                                                </span>

                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeDocument(index)}
                                                className="text-gray-500 hover:text-red-600 transition"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#3E4095] cursor-pointer"
                                } text-white py-3 rounded-full transition-colors`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Sending Message...
                                </div>
                            ) : (
                                "Send message"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );




};

export default Hospital_Verification_Request;
