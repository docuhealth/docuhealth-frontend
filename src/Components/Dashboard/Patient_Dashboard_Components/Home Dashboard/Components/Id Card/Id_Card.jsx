import React, { useContext } from "react";
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
}) => {
  // console.log(selectedProfile);

  // console.log(profile)

  return (
    <>
      {onboardIDCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50  ">
          <div className="bg-white rounded-xs shadow-lg p-6 max-w-md w-full relative max-h-[80vh] overflow-y-auto mx-5">
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
                    value={
                      selectedProfile?.firstname +
                      " " +
                      selectedProfile?.middlename +
                      " " +
                      selectedProfile?.lastname
                    }
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

                <div
                  className=" bg-[#3E4095]  text-center text-white rounded-full py-2 cursor-pointer"
                  onClick={() => handleIDCardCreation(selectedProfile)}
                >
                  <p>Generate ID Card</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isIDCreatedSuccessfully && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center "
          onClick={() => setIsIDCreatedSuccessfully(false)} // Close modal on click
          id="id-card-container"
        >
          <div
            className="grid grid-cols-1 md:grid-cols-2 place-items-center gap-2 mx-2  sm:gap-6 relative py-10 items-stretch "
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
            {/* First ID Card */}
            <div
              style={{ backgroundImage: `url(${TIDF})` }}
              className="bg-cover bg-center  w-full sm:w-[450px] rounded-md h-[300px] "
            >
              <div className="p-4 ">
                <div className="flex justify-between items-center">
                  <div>
                    <img src={logo} alt="docuhealth logo" className="w-6" />
                  </div>
                  <div>
                    <img src={NL} alt="nigeria logo" className="w-8" />
                  </div>
                </div>
                <div className=" text-center">
                  <div className="w-14 h-14 mx-auto mb-2 border-2 border-[#3E4095] rounded-full flex items-center justify-center text-[#3E4095] text-lg font-bold">
                    {(selectedProfile?.firstname?.[0] || "").toUpperCase()}
                    {(selectedProfile?.lastname?.[0] || "").toUpperCase()}
                  </div>

                  <h2 className="text-gray-700 font-bold text-sm">
                    {selectedProfile?.hin}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {selectedProfile?.firstname +
                      " " +
                      selectedProfile?.middlename +
                      " " +
                      selectedProfile?.lastname}
                  </p>
                  <p className="text-gray-500 text-[12px]">
                    {selectedProfile?.dob.split("-").reverse().join("-")}
                  </p>

                  <div className="flex justify-between text-left text-[13px] mt-4 w-full ">
                    <div>
                      <h3 className="font-semibold text-[#313131]">
                        Emergency Numbers
                      </h3>
                      <p className="text-[#313131] text-[10px]">
                        {idCardData.firstEmergency || ""}
                      </p>
                      <p className="text-[#313131] text-[10px]">
                        {idCardData.secondEmergency || ""}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#313131]">
                        Emergency Address
                      </h3>
                      <p className="text-[#313131] max-w-28 wrap-break-word text-[10px]">
                        {idCardData.emergencyAddress || ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[#313131] text-[11px] text-center pt-8">
                    www.docuhealthservices.com
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{ backgroundImage: `url(${TIDB})` }}
              className="bg-cover bg-center   w-full sm:w-[450px]   rounded-md text-white text-[13px]  h-[300px] font-bold p-4 "
            >
              <div className="flex justify-between items-center ">
                <div>
                  <img src={NL} alt="" className="w-8" />
                </div>
                <div className=" opacity-0  ">
                  <img src={logo} alt="docuhealth logo" className="w-6" />
                </div>
              </div>
              <div className="flex justify-center flex-col items-center">
                <div className="bg-[#F2F2F2] p-2 rounded-full">
                  <img src={logo} alt="docuhealth logo" className="w-6" />
                </div>
                <div className="text-center pt-5 ">
                  <h3 className=" text-[#313131]  pb-1">Basic instruction</h3>
                  <p className="text-[#313131] text-[10px] font-medium">
                    This card is linked to your Health Identification Number
                    (HIN). Present it at any DocuHealth-enabled hospital to
                    access your medical summary. Keep it safe and secure.
                  </p>
                </div>
                <div className="text-center pt-3 ">
                  <h3 className=" text-[#313131]  pb-1">Warning !!!</h3>
                  <p className="text-[#313131] text-[10px] font-medium">
                    This card belongs to the registered patient. If found,
                    please return it to the nearest hospital or contact
                    support@docuhealthServices.com.
                  </p>
                  <p className="text-[#313131] text-[11px] pb-2 pt-6">
                    www.docuhealthservices.com
                  </p>
                </div>
              </div>
              {/* <div>
                <p className="text-[#313131] text-[11px] text-center pt-4 font-medium">
                  Health is wealth, and a healthy Nigeria is a stronger Nigeria
                </p>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Id_Card;
