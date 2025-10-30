import React from "react";

const AdminSmallTabs = ({totalUsers, totalUsersPercent, regHosp, regHospPercent, totalRegInd, totalRegIndPercent}) => {
  return (
    <div className="  my-5 grid grid-cols-1  lg:grid-cols-4 gap-2">
      <div className="col-span-2 sm:col-auto">
        <div className="bg-white py-4 px-2 border rounded-md">
          <div className="flex justify-start gap-3 items-center ">
            <div className="bg-[#3380FF] bg-opacity-10 p-2 rounded-xs">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 7H13V17H11V7ZM15 11H17V17H15V11ZM7 13H9V17H7V13ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"
                  fill="#3380FF"
                />
              </svg>
            </div>
            <span className="text-sm">Total Users</span>
          </div>
          <div>
            <p className="py-2 text-xl text-[#647284]">{totalUsers || "0"}</p>
          </div>
          <div className="text-sm flex justify-start items-center">
            <span>
              <svg
                width="14"
                height="15"
                viewBox="0 0 14 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.3357 5.99162L4.31519 11.0121L3.49023 10.1872L8.51075 5.16667H4.08571V4H10.5024V10.4167H9.3357V5.99162Z"
                  fill="#72E128"
                />
              </svg>
            </span>
            <p className="text-[12px]">
              <span className="text-[#72E128]">
                {Math.round(parseFloat(totalUsersPercent).toFixed(2)) || "0"}%{" "}
              </span>
              increase from last month
            </p>
          </div>
        </div>
      </div>
      <div className="col-span-2 sm:col-auto">
        <div className="bg-white py-4 px-2 border rounded-md">
          <div className="flex justify-start gap-3 items-center ">
            <div className="bg-[#9181DB] bg-opacity-10 p-2 rounded-xs">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 7H13V17H11V7ZM15 11H17V17H15V11ZM7 13H9V17H7V13ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"
                  fill="#9181DB"
                />
              </svg>
            </div>
            <span className="text-sm">Total revenue generated</span>
          </div>
          <div>
            <p className="py-2 text-xl text-[#647284]">{"0"}</p>
          </div>
          <div className="text-sm flex justify-start items-center">
            <span>
              <svg
                width="14"
                height="15"
                viewBox="0 0 14 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.3357 5.99162L4.31519 11.0121L3.49023 10.1872L8.51075 5.16667H4.08571V4H10.5024V10.4167H9.3357V5.99162Z"
                  fill="#72E128"
                />
              </svg>
            </span>
            <p className="text-[12px]">
              <span className="text-[#72E128]">{"0"}% </span>
              increase from last month
            </p>
          </div>
        </div>
      </div>
      <div className="col-span-2 sm:col-auto">
        <div className="bg-white py-4 px-2 border rounded-md">
          <div className="flex justify-start gap-3 items-center ">
            <div className="bg-[#FFB849] bg-opacity-10 p-2 rounded-xs">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 7H13V17H11V7ZM15 11H17V17H15V11ZM7 13H9V17H7V13ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"
                  fill="#FFB849"
                />
              </svg>
            </div>
            <span className="text-sm">Total Registered Hospital</span>
          </div>
          <div>
            <p className="py-2 text-xl text-[#647284]">{regHosp || "0"}</p>
          </div>
          <div className="text-sm flex justify-start items-center">
            <span>
              <svg
                width="14"
                height="15"
                viewBox="0 0 14 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.3357 5.99162L4.31519 11.0121L3.49023 10.1872L8.51075 5.16667H4.08571V4H10.5024V10.4167H9.3357V5.99162Z"
                  fill="#72E128"
                />
              </svg>
            </span>
            <p className="text-[12px]">
              <span className="text-[#72E128]">
                {" "}
                {Math.round(parseFloat(regHospPercent).toFixed(2)) || "0"}%{" "}
              </span>
              increase from last month
            </p>
          </div>
        </div>
      </div>
      <div className="col-span-2 sm:col-auto">
        <div className="bg-white py-4 px-2 border rounded-md">
          <div className="flex justify-start gap-3 items-center ">
            <div className="bg-[#F0A0A0] bg-opacity-10 p-2 rounded-xs">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 7H13V17H11V7ZM15 11H17V17H15V11ZM7 13H9V17H7V13ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"
                  fill="#F0A0A0"
                />
              </svg>
            </div>
            <span className="text-sm">Total registered individual</span>
          </div>
          <div>
            <p className="py-2 text-xl text-[#647284]">{totalRegInd || "0"}</p>
          </div>
          <div className="text-sm flex justify-start items-center">
            <span>
              <svg
                width="14"
                height="15"
                viewBox="0 0 14 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.3357 5.99162L4.31519 11.0121L3.49023 10.1872L8.51075 5.16667H4.08571V4H10.5024V10.4167H9.3357V5.99162Z"
                  fill="#72E128"
                />
              </svg>
            </span>
            <p className="text-[12px]">
              <span className="text-[#72E128]">
                {Math.round(parseFloat(totalRegIndPercent).toFixed(2)) || "0"}%{" "}
              </span>
              increase from last month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSmallTabs;
