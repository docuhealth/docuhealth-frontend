import React from "react";
import TIDF from "../../../../../../assets/img/templateIDCardFront.png";
import TIDB from "../../../../../../assets/img/templateIDCardBack.png";
import NL from "../../../../../../assets/img/NL.png";
import logo from "../../../../../../assets/img/logo.png";

interface IDCardUIProps {
    selectedProfile: any;
    idCardData: any;
}

const IDCardUI = ({ selectedProfile, idCardData }: IDCardUIProps) => {
    if (!selectedProfile) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 place-items-center gap-2 mx-2 sm:gap-6 relative py-2 sm:py-10 items-stretch">
            {/* First ID Card */}
            <div
                style={{ backgroundImage: `url(${TIDF})` }}
                className="bg-cover bg-center w-full sm:w-[450px] rounded-md h-[300px]"
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
                        <div
                            style={{
                                width: "56px",
                                height: "56px",
                                border: "2px solid #3E4095",
                                color: "var(--color-docuhealth-primary)",
                                borderRadius: "9999px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 8px auto",
                                fontWeight: "bold",
                                fontSize: "18px"
                            }}
                        >
                            {(selectedProfile?.firstname?.[0] || "").toUpperCase()}
                            {(selectedProfile?.lastname?.[0] || "").toUpperCase()}
                        </div>

                        <h2 style={{ color: "#374151" }} className="font-bold text-sm">
                            {selectedProfile?.hin}
                        </h2>
                        <p style={{ color: "#4B5563" }} className="text-sm">
                            {selectedProfile?.firstname +
                                " " +
                                selectedProfile?.middlename +
                                " " +
                                selectedProfile?.lastname}
                        </p>
                        <p style={{ color: "#6B7280" }} className="text-[12px]">
                            {selectedProfile?.dob?.split("-").reverse().join("-")}
                        </p>

                        <div className="flex justify-between text-left text-[13px] mt-4 w-full ">
                            <div>
                                <h3 style={{ color: "var(--color-docuhealth-gray-dark)" }} className="font-semibold">
                                    Emergency Numbers
                                </h3>
                                <p style={{ color: "var(--color-docuhealth-gray-dark)" }} className="text-[10px]">
                                    {idCardData.first_emergencey_number || idCardData.firstEmergency || ""}
                                </p>
                                <p style={{ color: "var(--color-docuhealth-gray-dark)" }} className="text-[10px]">
                                    {idCardData.second_emergencey_number || idCardData.secondEmergency || ""}
                                </p>
                            </div>
                            <div>
                                <h3 style={{ color: "var(--color-docuhealth-gray-dark)" }} className="font-semibold">
                                    Emergency Address
                                </h3>
                                <p style={{ color: "var(--color-docuhealth-gray-dark)" }} className="max-w-28 wrap-break-word text-[10px]">
                                    {idCardData.emergence_address || idCardData.emergencyAddress || ""}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p style={{ color: "var(--color-docuhealth-gray-dark)" }} className="text-[11px] text-center pt-8">
                            www.docuhealthservices.net
                        </p>
                    </div>
                </div>
            </div>

            <div
                style={{ backgroundImage: `url(${TIDB})`, color: "#ffffff" }}
                className="bg-cover bg-center w-full sm:w-[450px] rounded-md text-[13px] h-[300px] font-bold p-4"
            >
                <div className="flex justify-between items-center ">
                    <div>
                        <img src={NL} alt="" className="w-8" />
                    </div>
                    <div className=" opacity-0 ">
                        <img src={logo} alt="docuhealth logo" className="w-6" />
                    </div>
                </div>
                <div className="flex justify-center flex-col items-center">
                    <div style={{ backgroundColor: "var(--color-docuhealth-bg-gray)" }} className="p-2 rounded-full">
                        <img src={logo} alt="docuhealth logo" className="w-6" />
                    </div>
                    <div className="text-center pt-5 ">
                        <h3 style={{ color: "var(--color-docuhealth-gray-dark)" }} className="pb-1">Basic instruction</h3>
                        <p style={{ color: "var(--color-docuhealth-gray-dark)" }} className="text-[10px] font-medium">
                            This card is linked to your Health Identification Number
                            (HIN). Present it at any DocuHealth-enabled hospital to
                            access your medical summary. Keep it safe and secure.
                        </p>
                    </div>
                    <div className="text-center pt-3 ">
                        <h3 style={{ color: "var(--color-docuhealth-gray-dark)" }} className="pb-1">Warning !!!</h3>
                        <p style={{ color: "var(--color-docuhealth-gray-dark)" }} className="text-[10px] font-medium">
                            This card belongs to the registered patient. If found,
                            please return it to the nearest hospital or contact
                            support@docuhealthservices.net
                        </p>
                        <p style={{ color: "var(--color-docuhealth-gray-dark)" }} className="text-[11px] pb-2 pt-6">
                            www.docuhealthservices.net
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default IDCardUI;
