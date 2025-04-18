import React from 'react'

const EmergencyNotice = ({emergencyNotice, setEmergencyNotice, handleToggleEmergencyMode}) => {

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
       {emergencyNotice && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative max-h-[80vh] overflow-y-auto mx-5">
                  {noticeMessage.map((message, index) => (
                    <div key={index} className="">
                      {" "}
                      <div className="flex justify-between items-center gap-2 pb-2">
                        <div className="flex justify-start items-center gap-2 ">
                          <p>
                            <i className="bx bx-info-circle text-3xl"></i>
                          </p>
                          <p className="font-semibold">Emergency mode toggle</p>
                        </div>
                        <div>
                          <i
                            class="bx bx-x text-2xl cursor-pointer"
                            onClick={() => setEmergencyNotice(false)}
                          ></i>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 pb-4">
                          Toggling on emergency mode would enable others access
                          your medical summary using your Health Identification
                          Number (HIN) through the guest mode. Always keep your
                          HIN safe.
                        </p>
                      </div>
                      <div
                        className=" bg-[#0000FF]  text-center text-white rounded-full py-2 cursor-pointer"
                        onClick={handleToggleEmergencyMode}
                      >
                        Proceed
                      </div>
                      <div className="text-right pt-4">
                        <p className="font-normal">{message.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
    </div>
  )
}

export default EmergencyNotice
