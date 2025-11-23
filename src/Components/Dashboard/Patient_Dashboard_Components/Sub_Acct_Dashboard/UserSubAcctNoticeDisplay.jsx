import React from "react";
import toast from 'react-hot-toast';

const UserSubAcctNoticeDisplay = ({ noticeDisplay, noticeMessage, paymentStatus, closeNoticeMessage, closeNoticeMessageToCreateAcct }) => {
  return (
    <div className="">
      {noticeDisplay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-sm">
          <div className="bg-white rounded-xs shadow-lg p-6 max-w-lg w-full relative max-h-[80vh] overflow-y-auto mx-5 hide-scrollbar">
            {noticeMessage.map((message, index) => (
              <div key={index} className="">
                <div className="flex justify-start items-center gap-2 pb-1">
                  <p>
                    <i className="bx bx-info-circle text-xl"></i>
                  </p>
                  <p className="font-semibold">{message.benefitTitle}</p>
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium">
                    {message.instruction}
                  </p>
                </div>
                <div className="text-[12px] text-gray-600 pb-4">
                  <p className="pb-1">{message.benefitTitle}</p>
                  <p className="pb-1">- {message.benefit1}</p>
                  <p className="pb-1">- {message.benefit2}</p>
                  <p className="pb-1">- {message.benefit3}</p>
                </div>
                <div className="text-[12px] text-gray-600 pb-4">
                  <p className="pb-1">{message.workTitle}</p>
                  <p className="pb-1">1 {message.work1}</p>
                  <p className="pb-1">2 {message.work2}</p>
                  <p className="pb-1">3 {message.work3}</p>
                </div>
                <p className="pb-4">
                  <p className="text-[12px] text-gray-600">
                    {message.lastMessage}
                  </p>
                </p>
                <div className="text-sm grid grid-cols-1 sm:grid-cols-2 w-full gap-2 sm:gap-4">
                  <button
                    className="bg-[#3E4095] text-white py-2 px-3 rounded-full"
                    onClick={
                      // () => {
                      // if (paymentStatus) {
                        closeNoticeMessageToCreateAcct
                      //   return;
                      // } else {
                      //   toast.success(
                      //     "Kindly subscribe to a plan to access this feature"
                      //   );
                    //   }
                    // }
                  }
                  >
                    Create a sub account
                  </button>
                  <button
                    className="border border-[#3E4095] text-[#3E4095] py-2 px-3 rounded-full"
                    onClick={closeNoticeMessage}
                  >
                    Close
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSubAcctNoticeDisplay;