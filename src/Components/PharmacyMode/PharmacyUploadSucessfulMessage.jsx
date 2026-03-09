import React from "react";
import { X } from "lucide-react";


const PharmacyUploadSuccessfulMessage = ({ setIsPharmacyUploadSuccessful }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 text-[#1B2B40]">
      <div className="bg-white  max-w-96 relative w-full p-5 mx-3">
        <div className="flex justify-end ">
          <button
            onClick={() => setIsPharmacyUploadSuccessful(false)}
            className=" text-gray-800 "
          >
            <X size={20} />
          </button>
        </div>

        <div className="text-sm flex flex-col items-center justify-center text-center">
          <div>
            <svg
              width="75"
              height="75"
              viewBox="0 0 75 75"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="pb-2"
            >
              <circle cx="37.5" cy="37.5" r="37.5" fill="#0B6011" />
              <path
                d="M33.4994 43.8418L51.8842 25.457L54.7126 28.2855L33.4994 49.4986L20.7715 36.7708L23.5999 33.9424L33.4994 43.8418Z"
                fill="white"
              />
            </svg>
          </div>
          <p>
            Drug purchase has been successfully uploaded to the customer’s
            health profile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PharmacyUploadSuccessfulMessage;
