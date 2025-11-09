import React, { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter a valid email address.");
      return;
    }
    console.log("Subscribed:", email);
    setEmail("");
  };

  return (
    <div className=" py-14 rounded-xs">
      <div className="flex flex-col justify-center items-center text-center px-4">
        {/* Icon */}
        <div className="mb-2">
          <svg
            width="53"
            height="52"
            viewBox="0 0 53 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_1676_13283)">
              <path
                d="M46 6.5C47.1967 6.5 48.1667 7.47006 48.1667 8.66667V43.3476C48.1667 44.5363 47.1802 45.5 46.0178 45.5H6.98223C5.79544 45.5 4.83333 44.536 4.83333 43.3476V41.1667H43.8333V15.8167L26.5 31.4167L4.83333 11.9167V8.66667C4.83333 7.47006 5.80339 6.5 7 6.5H46ZM17.8333 32.5V36.8333H0.5V32.5H17.8333ZM11.3333 21.6667V26H0.5V21.6667H11.3333ZM42.8928 10.8333H10.1073L26.5 25.5868L42.8928 10.8333Z"
                fill="#FFF"
              />
            </g>
            <defs>
              <clipPath id="clip0_1676_13283">
                <rect width="52" height="52" fill="white" transform="translate(0.5)" />
              </clipPath>
            </defs>
          </svg>
        </div>

        {/* Text */}
        <div className="mb-5 text-white">
          <h2 className="text-xl sm:text-2xl font-semibold mb-1">Subscribe to our Newsletter</h2>
          <p className="text-sm max-w-2xl">
            Subscribe to our Newsletter to always be the first to receive docuhealth
            important updates right in your email, we promise not to ever spam you
          </p>
        </div>

        {/* Form */}
        <div className="text-sm w-full max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-5 grid-rows-2 sm:grid-rows-1 w-full gap-3 sm:gap-0"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter an email address"
              className="w-full outline-hidden focus:outline-hidden pl-5 
                        rounded-l-full rounded-r-full sm:rounded-r-none
                         py-3 border border-gray-300 sm:col-span-3"
              required
            />
            <button
              type="submit"
              className="w-full  bg-[#212121] lg:bg-[#3E4095] py-3  
                        
                 rounded-full sm:rounded-l-none       text-white sm:col-span-2 "
            >
              Subscribe now
            </button>
          </form>
        </div>
     

      </div>
    </div>
  );
}

export default Newsletter
