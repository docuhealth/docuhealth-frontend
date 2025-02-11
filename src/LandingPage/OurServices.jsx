import React from "react";

const OurServices = () => {
  return (
    <div>
      <div className="flex flex-col justify-center items-center p-3" id="OurServices">
        <div className="bg-[#F6FDFF] py-2 px-5 rounded-full">
          <p className="text-sm">Our Services</p>
        </div>
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold py-2">
            Why Choose DocuHealth ?
          </h2>
          <p className="text-[#8E8EA9] text-sm sm:text-base">
            At DocuHealth, we go beyond just storing medical records—we empower{" "}
            you with smart, secure, and seamless healthcare management
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-5 mx-5 lg:mx-28 my-5">
        <div className="bg-[#FFF8EB] rounded-xl px-4 py-5">
          {/* Number Circle */}
          <div className="bg-white w-7 h-7 my-2 flex justify-center items-center font-semibold rounded-full">
            01
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="font-semibold">Centralized Medical Records</h3>
            <p className="text-[#8E8EA9] py-2 text-sm">
              Store and organize all your health documents, including
              prescriptions, lab results, X-rays, and doctor’s notes, in one
              secure place.
            </p>
          </div>

          {/* Rotated Tag */}
          <div className="hidden lg:block relative my-20">
            <div className="bg-white text-center py-3 w-60 transform rotate-45 shadow-md rounded-md mx-auto">
              <p className="text-[#FCA400] font-semibold text-sm">Stay up-to date</p>
            </div>
          </div>
        </div>
        <div className="bg-[#FAFCEF]  rounded-xl px-4 py-5">
          {/* Number Circle */}
          <div className="bg-white w-7 h-7 my-2 flex justify-center items-center font-semibold rounded-full">
            02
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="font-semibold">Quick & Easy Access</h3>
            <p className="text-[#8E8EA9] py-2 text-sm">
            Access your medical history anytime, anywhere—whether at home, on the go, or at a doctor’s office.
            </p>
          </div>

          {/* Rotated Tag */}
          <div className="relative my-20 hidden lg:block">
            <div className="bg-white text-center py-3 w-60 transform rotate-45 shadow-md rounded-md mx-auto">
              <p className="text-[#AECD00] font-semibold text-sm">Quick & easy medical access</p>
            </div>
          </div>
        </div>
        <div className="bg-[#F7F5FF] rounded-xl px-4 py-5">
          {/* Number Circle */}
          <div className="bg-white w-7 h-7 my-2 flex justify-center items-center font-semibold rounded-full">
            03
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="font-semibold">Seamless Doctor Collaboration</h3>
            <p className="text-[#8E8EA9] py-2 text-sm">
            Securely share records with healthcare providers for better diagnosis and treatment without delays.
            </p>
          </div>

          {/* Rotated Tag */}
          <div className="relative my-20 hidden lg:block">
            <div className="bg-white text-center py-3 w-60 transform rotate-45 shadow-md rounded-md mx-auto">
              <p className="text-[#3300FF] font-semibold text-sm">Easy collaboration</p>
            </div>
          </div>
        </div>
        <div className="bg-[#F2FCFF] rounded-xl px-4 py-5">
          {/* Number Circle */}
          <div className="bg-white w-7 h-7 my-2 flex justify-center items-center font-semibold rounded-full">
            04
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="font-semibold">Bank-Level Security & Privacy</h3>
            <p className="text-[#8E8EA9] py-2 text-sm">
            Your data is encrypted, ensuring top-tier security and privacy compliance. You control who can access your records.
            </p>
          </div>

          {/* Rotated Tag */}
          <div className="relative my-20 hidden lg:block">
            <div className="bg-white text-center py-3 w-60 transform rotate-45 shadow-md rounded-md mx-auto">
              <p className="text-[#00C4FF] font-semibold text-sm">Highly encrypted data</p>
            </div>
          </div>
        </div>
        <div className="bg-[#FFF4FE] rounded-xl px-4 py-5">
          {/* Number Circle */}
          <div className="bg-white w-7 h-7 my-2 flex justify-center items-center font-semibold rounded-full">
            05
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="font-semibold">Multi-Device Syncing</h3>
            <p className="text-[#8E8EA9] py-2 text-sm">
            Access your records across all your devices—smartphones, tablets, and desktops—for a seamless experience.
            </p>
          </div>

          {/* Rotated Tag */}
          <div className="relative my-20 hidden lg:block">
            <div className="bg-white text-center py-3 w-60 transform rotate-45 shadow-md rounded-md mx-auto">
              <p className="text-[#CE03BC] font-semibold text-sm">Responsiveness</p>
            </div>
          </div>
        </div>
        <div className="bg-[#F9FDF3] rounded-xl px-4 py-5">
          {/* Number Circle */}
          <div className="bg-white w-7 h-7 my-2 flex justify-center items-center font-semibold rounded-full">
            06
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="font-semibold">Sub-account creation</h3>
            <p className="text-[#8E8EA9] py-2 text-sm">
            Easily create a sub-account for your children in order to easily keep track of their medical record.
            </p>
          </div>

          {/* Rotated Tag */}
          <div className="relative my-20 hidden lg:block">
            <div className="bg-white text-center py-3 w-60 transform rotate-45 shadow-md rounded-md mx-auto">
              <p className=" font-semibold text-sm">Keep track of everyone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurServices;
