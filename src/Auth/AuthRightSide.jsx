import React from "react";
import dashb from "../assets/img/dashb.png";

const AuthRightSide = () => {
  return (

         <div
          className="flex-1 h-screen flex flex-col justify-center items-center p-4"
          style={{
            background: "linear-gradient(to bottom, #3E4095, #718FCC)",
          }}
        >
          <div className="">
            <p className="text-white font-semibold text-xl pb-1 sm:text-2xl">
              The simplest way to manage medical <br />
              records
            </p>
            <p className="text-white font-light text-sm">
No better way to manage and keep medical records.
            </p>
          </div>

          <div className="max-h-[430px] flex justify-center items-center pt-2">
            <img
              src={dashb}
              alt="Dashboard"
              className="object-contain w-full h-full"
            />
          </div>
        </div>


  );
};

export default AuthRightSide;
