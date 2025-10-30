import React, { useState, useEffect } from "react";
import TIDF from '../../assets/img/templateIDCardFront.png'
import TIDB from '../../assets/img/templateIDCardBack.png'
import logo from '../../assets/img/logo.png'
import NL from '../../assets/img/NL.png'

const IdCardForm = ({
  generateIDCard,
  generateIDCardForm,
  setGenerateIDCardForm,
  formData,
  handleChange,
  loading,
  handleIDCreation,
  setGenerateIDCard,
  setEmergencyModeEnabled,
  downloadIDCard
}) => {
  const [name, setName] = useState("fetching...");
  const [hin, setHin] = useState("fetching...");
  const [dob, setDob] = useState("fetching...");

  useEffect(() => {
    const fetchPatientDashboard = async (page = 1, size = 10) => {
      // Retrieve the JWT token from localStorage
      const jwtToken = localStorage.getItem("jwtToken"); // Replace "jwtToken" with your token key
      const role = "patient"; // Replace with the required role

      try {
        // Construct the URL with query parameters
        const url = `https://docuhealth-backend-h03u.onrender.com/api/patient/dashboard?page=${page}&size=${size}`;

        // Make the GET request
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`, // Add JWT token to the Authorization header
            Role: role, // Add role to the headers
          },
        });

        // Handle the response
        if (response.ok) {
          const data = await response.json();
          // console.log("Patient Dashboard Data:", data);
          setHin(data.HIN);
          setName(data.fullname);
          setDob(data.DOB);
          localStorage.setItem("toggleState", data.emergency);
          setEmergencyModeEnabled(data.emergency);
          // Display a success message or process the data as needed
          return data;
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch dashboard data:", errorData);

          // Handle errors with a message from the API
          throw new Error(
            errorData.message || "Failed to fetch dashboard data."
          );
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);

        // Handle unexpected errors
        throw error;
      }
    };

    // Example Usage
    fetchPatientDashboard(1, 10);
  }, []);

  return (
    <div>
      {generateIDCardForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50  ">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative max-h-[80vh] overflow-y-auto mx-5">
            <div className="flex justify-between items-center gap-2 pb-2">
              <div className="flex justify-start items-center gap-2 ">
                <p>
                  <i className="bx bx-info-circle text-3xl"></i>
                </p>
                <p className="font-semibold">Create Your ID Card</p>
              </div>
              <div>
                <i
                  class="bx bx-x text-2xl cursor-pointer"
                  onClick={() => setGenerateIDCardForm(false)}
                ></i>
              </div>
            </div>
            <div>
              <div className="bg-white max-w-96 py-3">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={name}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Input first emergency number
                  </label>
                  <input
                    type="text"
                    name="firstEmergency"
                    value={formData.firstEmergency}
                    onChange={handleChange}
                    placeholder="Enter first emergency number"
                    className="w-full px-3 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Input second emergency number
                  </label>
                  <input
                    type="text"
                    name="secondEmergency"
                    value={formData.secondEmergency}
                    onChange={handleChange}
                    placeholder="Enter second emergency number"
                    className="w-full px-3 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Input an emergency address
                  </label>
                  <textarea
                    name="emergencyAddress"
                    value={formData.emergencyAddress}
                    onChange={handleChange}
                    placeholder="Enter emergency address"
                    className="w-full px-3 py-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
            <div
              className=" bg-[#0000FF]  text-center text-white rounded-full py-2 cursor-pointer"
              onClick={handleIDCreation}
            >
              <p>{loading || "Generate ID Card"}</p>
            </div>
          </div>
        </div>
      )}
      {generateIDCard && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center "
          onClick={() => setGenerateIDCard(false)} // Close modal on click
          id="id-card-container"
        >
          <div
            className="grid grid-cols-1 md:grid-cols-2 place-items-center gap-2 mx-2  sm:gap-6 relative py-10 items-stretch "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 z-50 flex justify-center items-center gap-2">
              <div onClick={downloadIDCard} style={{ cursor: "pointer" }}>
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
                onClick={() => setGenerateIDCard(false)}
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
              className="bg-cover bg-center  w-full sm:w-[450px] rounded-md min-h-[320px] "
            >
              <div className="p-4 ">
                <div className="flex justify-between items-center">
                  <div>
                    <img src={logo} alt="" />
                  </div>
                  <div>
                    <img src={NL} alt="" className="w-10" />
                  </div>
                </div>
                <div className=" text-center">
                  <div className="w-16 h-16 mx-auto mb-2 border-2 border-[#1C1CFE] rounded-full flex items-center justify-center text-[#1C1CFE] text-lg font-bold">
                    {name
                      ? name
                          .split(" ")
                          .filter((word) => word.trim() !== "") // Remove empty entries
                          .map((word) => word[0].toUpperCase())
                          .join("")
                      : ""}
                  </div>

                  <h2 className="text-gray-700 font-bold text-lg">{hin}</h2>
                  <p className="text-gray-600">{name}</p>
                  <p className="text-gray-500 text-sm">
                    {dob.split("-").reverse().join("-")}
                  </p>

                  <div className="flex justify-between text-left text-[13px] mt-4 w-full ">
                    <div>
                      <h3 className="font-semibold text-[#313131]">
                        Emergency Numbers
                      </h3>
                      <p className="text-[#313131] text-[10px]">
                        {formData.firstEmergency || ""}
                      </p>
                      <p className="text-[#313131] text-[10px]">
                        {formData.secondEmergency || ""}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#313131]">
                        Emergency Address
                      </h3>
                      <p className="text-[#313131] max-w-28 wrap-break-word text-[10px]">
                        {formData.emergencyAddress || ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[#313131] text-[11px] text-center pt-12">
                    www.docuhealthservices.com
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{ backgroundImage: `url(${TIDB})` }}
              className="bg-cover bg-center   w-full sm:w-[450px]   rounded-md text-white text-[13px]  min-h-[320px] font-bold p-4 "
            >
              <div className="flex justify-between items-center ">
                <div>
                  <img src={NL} alt="" className="w-10" />
                </div>
                <div className=" opacity-0  ">
                  <img src={logo} alt="" />
                </div>
              </div>
              <div className="flex justify-center flex-col items-center">
                <div className="bg-[#F2F2F2] p-2 rounded-full">
                  <img src={logo} alt="" />
                </div>
                <div className="text-center pt-5 ">
                  <h3 className=" text-[#313131]  pb-1">Basic instruction</h3>
                  <p className="text-[#313131] text-[10px]">
                    This card is linked to your Health Identification Number
                    (HIN). Present it at any DocuHealth-enabled hospital to
                    access your medical summary. Keep it safe and secure.
                  </p>
                </div>
                <div className="text-center pt-5 ">
                  <h3 className=" text-[#313131]  pb-1">Warning!!!</h3>
                  <p className="text-[#313131] text-[10px]">
                    This card belongs to the registered patient. If found,
                    please return it to the nearest hospital or contact
                    support@docuhealthServices.com.
                  </p>
                  <p className="text-[#313131] text-[10px] py-2">
                    www.docuhealthservices.com
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[#313131] text-[11px] text-center pt-4 ">
                  Health is wealth, and a healthy Nigeria is a stronger Nigeria
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdCardForm;
