import React from "react";
import BackgroundTemplate from "../ui/BackgroundTemplate";
import { Check } from "lucide-react";

const Data_Privacy_Section = () => {

    const securityData = [
  {
    text: "End-to-end encryption",
    color: "bg-[#E7E4FD]",
  },
  {
    text: "Role-based data access",
    color: "bg-[#FDF4E4]",
  },
  {
    text: "Secure authentication",
    color: "bg-[#FDE4E4]",
  },
  {
    text: "Patient-permission-based access",
    color: "bg-[#E4ECFD]",
  },
  {
    text: "NDPR compliant under the National Data Protection Commission (NDPC)",
    color: "bg-[#ECE4FD]",
  },
];

  return (
    <>
      <BackgroundTemplate>
        <section className="py-24 px-5 lg:px-16 text-sm text-[#464646] bg-white lg:bg-[#F6FCFE] ">
          <div className="w-full flex flex-col-reverse lg:flex-row items-start justify-between gap-10 ">
            <div className="hidden md:flex w-full lg:w-1/2 items-center justify-center">
              <img
                src='https://res.cloudinary.com/drhfrgahv/image/upload/v1762777827/data_privacy_img_bg5a9y.png'
                alt="Data Privacy Illustration"
                className="object-contain"
              />
            </div>
            <div className="w-full lg:w-1/2">
          <h2 className="text-2xl lg:text-3xl 2xl:text-4xl font-semibold text-[#3E4095] mb-4">
          Data Privacy & Security
        </h2>
          <p className="mb-6 2xl:text-xl">
          At DocuHealth we follow global healthcare security standards:
        </p>
        <div className="space-y-4">
          {securityData.map((item, index) => (
            <div
              key={index}
               className={`flex  items-center gap-2 justify-start rounded-md lg:rounded-full ${item.color} py-3 px-5 shadow-xs transition-all duration-300
                ${index % 2 === 0 ? "lg:mr-10" : "lg:ml-10"}
              `}
            >
                 <div className="bg-[#1f1f75] p-0.5 rounded-sm">
                <Check className="text-white w-3 h-3" />
              </div>
              <span className="text-[#1f1f75] text-sm  font-medium 2xl:text-lg">
                {item.text}
              </span>
           
            </div>
          ))}
        </div>
            </div>
          </div>
        </section>
      </BackgroundTemplate>
    </>
  );
};
export default Data_Privacy_Section;
