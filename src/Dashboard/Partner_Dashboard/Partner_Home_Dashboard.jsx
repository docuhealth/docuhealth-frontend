import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaEye, FaEyeSlash, FaSignOutAlt, FaSyncAlt, FaLock } from 'react-icons/fa';
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";

const Partner_Home_Dashboard = () => {
    const [showSecret, setShowSecret] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [password, setPassword] = useState("");

    const navigate = useNavigate()

    // Mock data - replace with actual state/props
    const clientCode = "DEMO-DOCU-PART-9920";
    const clientSecret = "demo_sk_live_51Npxxxxxxxxxxxxxxxx";


    const handleRotateKeys = (e) => {
        e.preventDefault();
        // Logic to verify password and rotate keys
        console.log("Rotating keys with password:", password);
        setIsModalOpen(false);
        setPassword("");
    };

    const handleLogout = () => {
        // // Logic to clear session
        // console.log("Logging out...");
        sessionStorage.clear();   // removes ALL session-based auth data
        navigate("/partner-login"); 
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">

                <div className="   flex gap-1 items-center font-semibold  text-[#3E4095]">
                    <img src={docuhealth_logo} alt="Logo" className="w-6" />
                    <h1 className="text-xl">DocuHealth</h1>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-medium cursor-pointer"
                >
                    <FaSignOutAlt /> Logout
                </button>
            </nav>

            <main className="max-w-4xl mx-auto p-6 mt-10">
                <header className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800">API Credentials</h2>
                    <p className="text-gray-500 text-sm">Use these keys to integrate DocuHealth services into your platform.</p>
                </header>

                <div className="bg-white rounded-md border border-gray-200 p-5 sm:p-8">
                    <div className="space-y-6">

                        {/* Client Code */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Client Code</label>
                            <div className="flex items-center bg-gray-50 border rounded-lg px-4 py-2">
                                <code className="flex-1 text-[#3E4095] font-mono font-medium">{clientCode}</code>
                            </div>
                        </div>

                        {/* Client Secret */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Client Secret Key</label>
                            <div className="flex items-center bg-gray-50 border rounded-lg px-4 py-2 relative">
                                <input
                                    type={showSecret ? "text" : "password"}
                                    readOnly
                                    value={clientSecret}
                                    className="bg-transparent flex-1 font-mono text-gray-600 outline-none"
                                />
                                <button
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="text-gray-400 hover:text-[#3E4095] cursor-pointer"
                                >
                                    {showSecret ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <hr className="my-4 border-gray-100" />

                        {/* Actions */}
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <FaLock className="text-[10px]" /> Never share your secret key in public repositories.
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex justify-center items-center gap-2 bg-[#3E4095] text-white px-6 py-2.5 rounded-full transition-all text-sm font-semibold w-full lg:w-auto cursor-pointer "
                            >
                                <FaSyncAlt className="text-xs" /> Rotate Credentials
                            </button>
                        </div>

                    </div>
                </div>

                {/* Support Section */}
                <div className="my-10 p-6 bg-[#3E4095]/5 border border-[#3E4095]/10 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start md:items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <FaEnvelope className="text-[#3E4095] text-xl" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800">Got an issue?</h4>
                            <p className="text-xs text-gray-600">Our technical team is here to help you with your integration.</p>
                        </div>
                    </div>
                    <a
                        href="mailto:support@docuhealthservices.com"
                        className="bg-white border border-[#3E4095] text-[#3E4095] px-6 py-2 rounded-full font-semibold hover:bg-[#3E4095] hover:text-white transition-all duration-300 text-sm text-center w-full md:w-auto"
                    >
                        support@docuhealthservices.com
                    </a>
                </div>
            </main>

            {/* Password Modal for Rotating Keys */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Confirm Key Rotation</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Rotating your keys will invalidate your current Client Secret immediately and you'll get another Client Secret. Please enter your password to confirm.
                        </p>

                        <form onSubmit={handleRotateKeys}>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg outline-none focus:border-[#3E4095]"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm cursor-pointer"
                                >
                                    Confirm Rotation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Partner_Home_Dashboard;