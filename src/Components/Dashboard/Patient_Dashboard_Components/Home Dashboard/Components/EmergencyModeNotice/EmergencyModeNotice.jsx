import React from 'react'

const EmergencyModeNotice = ({emergencyStatusModal, setEmergencyStatusModal, handleEmergencyStatusModal}) => {

      const emergencyNoticeMessage = [
    {
      title: "Emergency Mode Toggle",
      details:
        "Toggling on emergency mode would enable DocuHealth's health providers access your medical records using your Health Identification Number (HIN) through the guest mode. Always keep your HIN safe.",
      by: "DocuHealth (admin)",
    },
  ];

  return (
    <div>{
        emergencyStatusModal && (
             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100 text-sm">
          <div className="bg-white rounded-xs shadow-lg p-6 max-w-md w-full relative max-h-[80vh] overflow-y-auto mx-3">
            {emergencyNoticeMessage.map((message, index) => (
              <div key={index} className="">
                {" "}
                <div className="flex justify-between items-center gap-2 pb-2">
                  <div className="flex items-center gap-2 ">
                    <p>
                      <i className="bx bx-info-circle text-xl"></i>
                    </p>
                    <p className="font-semibold text-sm">
                      Emergency Mode <br /> Toggle
                    </p>
                  </div>
                  <div>
                    <i
                      class="bx bx-x text-xl cursor-pointer"
                      onClick={() => {
                        setEmergencyStatusModal(false)
                      }}
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
                        setEmergencyStatusModal(false)
                        handleEmergencyStatusModal()
                  }}
                >
                  <p className="text-sm">Toggle Emergency Status</p>
                </div>
                <div className="text-right pt-4">
                  <p className="font-normal text-sm">{message.by}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        )
    }</div>
  )
}

export default EmergencyModeNotice