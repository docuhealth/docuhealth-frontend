import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaSignOutAlt,
  FaSyncAlt,
  FaLock,
} from "react-icons/fa";
import docuhealth_logo from "../../assets/img/docuhealth_logo.png";
import axiosInstance from "../../utils/axiosInstance";
import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { getToken } from "../../services/authService";
import toast from "react-hot-toast";

const Partner_Home_Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal state
  const [rotatedData, setRotatedData] = useState(null);

  const navigate = useNavigate();

  const isPartnerLoggedIn = !!getToken();

  // Mock data - replace with actual state/props
  const clientID = "DEMO-DOCU-PART-9920";

  const fetchPartnerProfile = async () => {
    const res = await axiosInstance.get("api/partners/info");
    // console.log(res)
    return res.data;
  };

  const { data, isFetching, isPending, isError, error } = useQuery({
    queryKey: ["partner-profile"],
    queryFn: fetchPartnerProfile,
    enabled: isPartnerLoggedIn,
    placeholderData: keepPreviousData,
  });

  const rotateKeysMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post("api/partners/rotate-key", payload);
    //   console.log(res);
      return res.data;
    },
    onSuccess: (response) => {
      toast.success("API Keys rotated successfully!");
      setRotatedData(response.data); // Save the new secret from response
      setIsModalOpen(false);
      setShowSuccessModal(true); // Open the success display
      setPassword("");
    },
    onError: (error) => {
     console.log(error)
     if(error.response.data.detail){
        toast.error(error.response.data.detail);
     }
    },
  });

  const handleRotateKeys = (e) => {
    e.preventDefault();
    rotateKeysMutation.mutate({ password }); // Pass password as payload
  };

  const handleLogout = () => {
    // // Logic to clear session
    // console.log("Logging out...");
    sessionStorage.clear(); // removes ALL session-based auth data
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
          <h2 className="text-2xl font-semibold text-gray-800">
            API Credentials
          </h2>
          <p className="text-gray-500 text-sm">
            Use these keys to integrate DocuHealth services into your platform.
          </p>
        </header>

        <div className="bg-white rounded-md border border-gray-200 p-5 sm:p-8">
          <div className="space-y-6">
            {/* Client Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client ID
              </label>
              {isPending ? (
                /* Skeleton Loading State */
                <div className="h-11 w-full bg-gray-200 animate-pulse rounded-lg"></div>
              ) : isError ? (
                <div className="text-red-500 text-sm font-medium">
                  Error loading credentials. Please refresh.
                </div>
              ) : (
                <div className="flex items-center bg-gray-50 border rounded-lg px-4 py-2">
                  <code className="flex-1 text-[#3E4095] font-mono font-medium">
                    {data?.client_id}
                  </code>
                </div>
              )}
            </div>

            <hr className="my-4 border-gray-100" />

            {/* Actions */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <p className="text-xs text-red-500 flex items-center gap-1">
                <FaLock className="text-[10px]" /> Never share your secret key
                in public repositories.
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
              <p className="text-xs text-gray-600">
                Our technical team is here to help you with your integration.
              </p>
            </div>
          </div>
          <a
            href="mailto:admin@docuhealthservices.net"
            className="bg-white border border-[#3E4095] text-[#3E4095] px-6 py-2 rounded-full font-semibold hover:bg-[#3E4095] hover:text-white transition-all duration-300 text-sm text-center w-full md:w-auto"
          >
            admin@docuhealthservices.net
          </a>
        </div>
      </main>

      {/* Password Modal for Rotating Keys */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Confirm Key Rotation
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Rotating your keys will invalidate your current Client Secret
              immediately and you'll get another Client Secret. Please enter
              your password to confirm.
            </p>

            <form onSubmit={handleRotateKeys}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Password
                </label>
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
                  disabled={rotateKeysMutation.isPending}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-full text-gray-600 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm cursor-pointer"
                >
                  {rotateKeysMutation.isPending ? (
                    <><FaSyncAlt className="animate-spin text-xs" /> Processing...</>
                  ) : (
                    "Confirm Rotation"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLock className="text-2xl" />
              </div>
              <h3 className="text-2xl font-medium text-gray-800">Rotation Complete!</h3>
              <p className="text-gray-500 text-xs mt-2">
                Please save your new Secret Key securely. You will not be able to see it again.
              </p>
            </div>

            <div className="space-y-4">
              {/* Only Client Secret Display as requested */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Client Secret</label>
                <div className="mt-1 bg-gray-50 border border-amber-200 rounded-sm p-3">
                  <code className="text-sm block break-all text-gray-700 font-mono mb-2">
                    {rotatedData?.new_client_secret}
                  </code>
                  <button
                    onClick={() => {
                      const secret = rotatedData?.new_client_secret;
                      navigator.clipboard.writeText(secret);
                      toast.success("Secret copied to clipboard!");
                    }}
                    className="w-full py-2 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Copy Secret Key
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full mt-8 bg-[#3E4095] text-white py-2.5 rounded-full transition-all text-sm cursor-pointer"
            >
              I've saved my key, Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partner_Home_Dashboard;
