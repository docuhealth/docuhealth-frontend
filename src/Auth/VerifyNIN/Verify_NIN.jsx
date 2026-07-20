import React, { useState, useEffect } from "react";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import dashb from "../../assets/img/dashb.png";
import AuthRightSide from "../AuthRightSide";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../../utils/authAPI";
import { FaKey } from "react-icons/fa";
import toast from "react-hot-toast";
import { setToken } from "../../services/authService";

const Verify_NIN = () => {

    const navigate = useNavigate()
    const location = useLocation();

    const { patient_hin } = location.state || {};

    const [user_nin, setUser_Nin] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isValidNIN, setIsValidNIN] = useState(false);

    // Example: Nigerian NIN is 11 digits, adjust if needed
    const ninRegex = /^\d{11}$/;

    useEffect(() => {
        setIsValidNIN(ninRegex.test(user_nin));
    }, [user_nin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidNIN) {
            toast.error("Please enter a valid NIN.");
            return;
        }

        setIsLoading(true);

        try {
            const payload = { patient: patient_hin, nin: user_nin };
            // console.log(payload)
            const response = await authAPI("POST", "api/auth/nin", payload);
            // console.log(response)

            setToken(response.data.access_token, response.data.role);

            toast.success(response.message || "NIN Verified Successfully!");
            setTimeout(() => {
                window.location.href = "/user-home-dashboard";
              }, 1000);
        } catch (error) {
            // console.log(error)
            console.error("Error during NIN verification:", error.message);
            toast.error(
                error.detail || "NIN Verification Failed, Try Again"
            );
        } finally {
            setIsLoading(false);
            setUser_Nin('')
        }
    };
    return (
        <>
            <div className="hidden h-screen sm:flex">
                {/* Left Side */}
                <div className="w-full flex-1">
                    <div className=" hidden sm:flex justify-center items-center py-10 h-screen ">
                        <Link to="/">
                            <div className=" fixed top-10 left-10  flex gap-1 items-center font-semibold text-docuhealth-primary">
                                <img src={docuhealth_logo} alt="Logo" className="w-6" />
                                <h1 className="text-xl">DocuHealth</h1>
                            </div>
                        </Link>
                        <div className="w-full">
                            <div className="px-10 w-full">
                                <h2 className="text-xl font-semibold pb-1">Verify NIN</h2>
                                <p className="text-gray-600 mb-6 text-sm">
                                    Please enter your NIN to
                                    proceed!
                                </p>

                                <form onSubmit={handleSubmit} className="text-sm">
                                    {/* Email Input */}
                                    <div className="relative pb-3">
                                        <p className="font-semibold pb-1">NIN :</p>
                                        <div className="relative">
                                            <input
                                                type="text" // <-- use text instead of number
                                                maxLength={11}
                                                className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-docuhealth-primary"
                                                value={user_nin}
                                                onChange={(e) => setUser_Nin(e.target.value)}
                                                required
                                            />
                                            <FaKey className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                        {!isValidNIN && user_nin.length > 0 && (
                                            <p className="text-red-500 text-xs mt-1">
                                                NIN must be 11 digits and contain only numbers.
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={!isValidNIN || isLoading}
                                        className={`w-full py-3 rounded-full ${!isValidNIN || isLoading
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-docuhealth-primary text-white"
                                            }`}
                                    > {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Verifying NIN
                                        </div>
                                    ) : (
                                        "Proceed"
                                    )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <AuthRightSide />
            </div>
            <div className="h-screen flex flex-col justify-center items-center sm:hidden py-10">
                <Link to="/">
                    <div className=" fixed top-10 left-5  flex gap-1 items-center font-semibold text-docuhealth-primary">
                        <img src={docuhealth_logo} alt="Logo" className="w-6" />
                        <h1 className="text-xl">DocuHealth</h1>
                    </div>
                </Link>
                <div className="w-full">
                            <div className="px-5 w-full">
                                <h2 className="text-xl font-semibold pb-1">Verify NIN</h2>
                                <p className="text-gray-600 mb-6 text-sm">
                                    Please enter your NIN to
                                    proceed!
                                </p>

                                <form onSubmit={handleSubmit} className="text-sm">
                                    {/* Email Input */}
                                    <div className="relative pb-3">
                                        <p className="font-semibold pb-1">NIN :</p>
                                        <div className="relative">
                                            <input
                                                type="text" // <-- use text instead of number
                                                maxLength={11}
                                                className="w-full px-4 py-3 border rounded-lg pl-10 outline-hidden focus:border-docuhealth-primary"
                                                value={user_nin}
                                                onChange={(e) => setUser_Nin(e.target.value)}
                                                required
                                            />
                                            <FaKey className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        </div>
                                        {!isValidNIN && user_nin.length > 0 && (
                                            <p className="text-red-500 text-xs mt-1">
                                                NIN must be 11 digits and contain only numbers.
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={!isValidNIN || isLoading}
                                        className={`w-full py-3 rounded-full ${!isValidNIN || isLoading
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-docuhealth-primary text-white"
                                            }`}
                                    > {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Verifying NIN
                                        </div>
                                    ) : (
                                        "Proceed"
                                    )}
                                    </button>
                                </form>
                            </div>
                        </div>
            </div>

        </>
    )
}

export default Verify_NIN