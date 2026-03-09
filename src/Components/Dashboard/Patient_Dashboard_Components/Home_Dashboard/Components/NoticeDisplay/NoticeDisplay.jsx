import React, { useContext } from "react";
import toast from "react-hot-toast";
import { AppContext } from "../../../../../../context/PatientContext/AppContext";
import { fetchSubscriptionStatus } from "../../../../../../services/authService";

const NoticeDisplay = ({
  noticeDisplay,
  closeNoticeMessage,
  handleSelection,
}) => {
  const { profile } = useContext(AppContext);

  const noticeMessage = [
    {
      title: "Health Identification Number (HIN)",
      details:
        "We're excited to announce the latest innovation in digital health: Virtual Identity Card, now available on DocuHealth! This game-changing feature provides you with a printable, digital ID card that stores your essential personal information, including your HIN number incase of an emergency.",
      by: "DocuHealth (admin)",
    },
  ];

  return (
    <div>
      {noticeDisplay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 text-sm">
          <div className="bg-white rounded-xs shadow-lg p-6 max-w-md w-full relative max-h-[80vh] overflow-y-auto mx-3">
            {noticeMessage.map((message, index) => (
              <div key={index} className="">
                {" "}
                <div className="flex justify-between items-center gap-2 pb-2">
                  <div className="flex justify-start items-center gap-2 ">
                    <p>
                      <i className="bx bx-info-circle text-xl"></i>
                    </p>
                    <p className="font-semibold text-sm">
                      Health Identification <br /> Number (HIN)
                    </p>
                  </div>
                  <div>
                    <i
                      class="bx bx-x text-xl cursor-pointer"
                      onClick={closeNoticeMessage}
                    ></i>
                  </div>
                </div>
                <div>
                  <p className="text-[12px] text-gray-600 pb-4">
                    {message.details}
                  </p>
                </div>
                <div
                  className=" bg-[#3E4095]  text-center text-white rounded-full py-2 cursor-pointer"
                  onClick={() => {
                    if (profile) {
                      const is_subscribed = fetchSubscriptionStatus();
                      if (!is_subscribed) {
                        toast.error("Please subscribe to access feature");
                        closeNoticeMessage();
                        return;
                      }
                      closeNoticeMessage();
                      handleSelection(profile);
                    } else {
                      console.log("no profile");
                      toast.error("We couldn't find a profile. Try again");
                    }
                    //
                    //
                  }}
                >
                  <p className="text-sm">Get Identity Card</p>
                </div>
                <div className="text-right pt-4">
                  <p className="font-normal text-sm">{message.by}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeDisplay;
