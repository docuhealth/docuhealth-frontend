import React, { useContext, useMemo } from "react";
import IDCardUI from "./IDCardUI";
import TIDF from "../../../../../../assets/img/templateIDCardFront.png";
import TIDB from "../../../../../../assets/img/templateIDCardBack.png";
import NL from "../../../../../../assets/img/NL.png";
import logo from "../../../../../../assets/img/logo.png";

const Id_Card = ({
  onboardIDCard,
  setOnboardIDCard,
  idCardData,
  handleChange,
  handleIDCardCreation,
  isIDCreatedSuccessfully,
  setIsIDCreatedSuccessfully,
  selectedProfile,
  isCreatingID
}) => {

  const fullName = useMemo(() => {
    if (!selectedProfile) return "";

    const p = selectedProfile.profile || selectedProfile; // normalize
    return [p.firstname, p.middlename, p.lastname]
      .filter(Boolean)
      .join(" ");
  }, [selectedProfile]);

  return (
    <>
      {onboardIDCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50  ">
          <div className="bg-white rounded-xs shadow-lg p-6 max-w-md w-full relative max-h-[80vh] overflow-y-auto mx-3">
            <div className="flex justify-between items-center gap-2 pb-2">
              <div className="flex justify-start items-center gap-2 ">
                <p>
                  <i className="bx bx-info-circle text-xl"></i>
                </p>
                <p className="font-semibold text-sm">Create Your ID Card</p>
              </div>
              <div>
                <i
                  class="bx bx-x text-xl cursor-pointer"
                  onClick={() => setOnboardIDCard(false)}
                ></i>
              </div>
            </div>
            <div>
              <div className="bg-white max-w-96 py-3 text-sm">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={[
                      selectedProfile?.firstname || selectedProfile?.profile?.firstname,
                      selectedProfile?.middlename || selectedProfile?.profile?.middlename,
                      selectedProfile?.lastname || selectedProfile?.profile?.lastname
                    ]
                      .filter(Boolean) // removes undefined / empty values
                      .join(" ")}

                    readOnly
                    className="w-full px-3 py-2 border rounded-md  text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#3E4095]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    Input first emergency number
                  </label>
                  <input
                    type="text"
                    name="firstEmergency"
                    value={idCardData.firstEmergency}
                    onChange={handleChange}
                    placeholder="Enter first emergency number"
                    className="w-full px-3 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#3E4095]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    Input second emergency number
                  </label>
                  <input
                    type="text"
                    name="secondEmergency"
                    value={idCardData.secondEmergency}
                    onChange={handleChange}
                    placeholder="Enter second emergency number"
                    className="w-full px-3 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#3E4095]"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">
                    Input an emergency address
                  </label>
                  <textarea
                    name="emergencyAddress"
                    value={idCardData.emergencyAddress}
                    onChange={handleChange}
                    placeholder="Enter emergency address"
                    className="w-full px-3 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#3E4095] h-24 resize-none"
                  ></textarea>
                </div>

                <button
                  disabled={isCreatingID}
                  className={`w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-full  transition-all duration-300 shadow-md 
    ${isCreatingID
                      ? "bg-gray-400 cursor-not-allowed opacity-70"
                      : "bg-[#3E4095] hover:bg-[#2e3075] hover:shadow-lg active:scale-[0.98] text-white cursor-pointer"
                    }`}
                  onClick={() => !isCreatingID && handleIDCardCreation(selectedProfile)}
                >
                  {isCreatingID ? (
                    <>
                      {/* Small Spinner */}
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Generate ID Card</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isIDCreatedSuccessfully && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center "
          onClick={() => setIsIDCreatedSuccessfully(false)} // Close modal on click
          id="id-card-container"
        >
          <div
            className="grid grid-cols-1 place-items-center gap-2 mx-2  sm:gap-6 relative py-10 items-stretch "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 z-50 flex justify-center items-center gap-2">
              <div style={{ cursor: "pointer" }}>
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="15"
                    cy="15"
                    r="14.25"
                    stroke="white"
                    stroke-width="1.5"
                  />
                  <path
                    d="M5.8335 17.0837C5.8335 15.1433 6.85374 13.4412 8.38705 12.4847C8.80407 9.20366 11.6059 6.66699 15.0002 6.66699C18.3944 6.66699 21.1962 9.20366 21.6132 12.4847C23.1466 13.4412 24.1668 15.1433 24.1668 17.0837C24.1668 19.935 21.9637 22.2717 19.1668 22.4846L10.8335 22.5003C8.03665 22.2717 5.8335 19.935 5.8335 17.0837ZM19.0404 20.8227C20.9849 20.6747 22.5002 19.0471 22.5002 17.0837C22.5002 15.7728 21.8238 14.5805 20.7311 13.8987L20.0597 13.4798L19.9599 12.6948C19.6447 10.2154 17.5242 8.33366 15.0002 8.33366C12.4761 8.33366 10.3556 10.2154 10.0404 12.6948L9.94063 13.4798L9.26923 13.8987C8.17646 14.5805 7.50016 15.7728 7.50016 17.0837C7.50016 19.0471 9.01544 20.6747 10.9599 20.8227L11.1043 20.8337H18.896L19.0404 20.8227ZM15.8335 15.8337V19.167H14.1668V15.8337H11.6668L15.0002 11.667L18.3335 15.8337H15.8335Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div
                onClick={() => setIsIDCreatedSuccessfully(false)}
                className="cursor-pointer"
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="15"
                    cy="15"
                    r="14.25"
                    fill="white"
                    stroke="white"
                    stroke-width="1.5"
                  />
                  <path
                    d="M13.8217 14.9998L7.32764 8.50566L8.50615 7.32715L15.0002 13.8212L21.4943 7.32715L22.6728 8.50566L16.1787 14.9998L22.6728 21.4938L21.4943 22.6724L15.0002 16.1783L8.50615 22.6724L7.32764 21.4938L13.8217 14.9998Z"
                    fill="#1B2B40"
                  />
                </svg>
              </div>
            </div>

            <IDCardUI selectedProfile={selectedProfile} idCardData={idCardData} />

          </div>
        </div>
      )}
    </>
  );
};

export default Id_Card;
