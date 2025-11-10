import React from "react";


const About_Us_Section = () => {
  return (
    <>
      <div className="relative py-20 px-5 lg:px-16 bg-[#F6FCFE]" id="about-us">
        <div className="flex flex-col-reverse lg:flex-row items-start gap-7 ">
          <div className="flex-1 z-10">
            <img src='https://res.cloudinary.com/drhfrgahv/image/upload/v1762777850/about_img_jc2jvs.png' alt="about us image" className="object-contain" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold pb-4 text-2xl lg:text-3xl text-[#3E4095] 2xl:text-4xl">
              About DocuHealth
            </h2>
            <div className="text-sm 2xl:text-xl space-y-4 text-[#464646] leading-6">
              <p>
                DocuHealth Services unifies Nigeria’s healthcare ecosystem
                through a trusted, data-driven network that gives every patient
                lifelong, portable, and privacy-protected access to their
                medical records.
              </p>
              <p>
                Powered by the Health Identification Number (HIN)—securely
                linked to the National Identification Number (NIN)—our system
                allows real-time sharing of verified medical records,
                prescriptions, and billing data, with full patient consent. We
                are bridging the gap between providers, payers, and patients in
                one intelligent, interoperable platform.
              </p>
            </div>
          </div>
        </div>
        <svg
          width="89"
          height="103"
          viewBox="0 0 89 103"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-0 top-0 "
        >
          <path
            d="M106.25 -22.5C109.702 -22.5 112.5 -19.7018 112.5 -16.25V96.25C112.5 99.7019 109.702 102.5 106.25 102.5H18.75C15.2983 102.5 12.5 99.7019 12.5 96.25V83.75H0V71.25H12.5V58.75H0V46.25H12.5V33.75H0V21.25H12.5V8.75H0V-3.75H12.5V-16.25C12.5 -19.7018 15.2983 -22.5 18.75 -22.5H106.25ZM100 -10H25V90H100V-10ZM68.75 15V33.75H87.5V46.25H68.7437L68.75 65H56.25L56.2437 46.25H37.5V33.75H56.25V15H68.75Z"
            fill="#252E87"
            className="opacity-5"
          />
        </svg>
        <svg
          width="78"
          height="125"
          viewBox="0 0 78 125"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-0 bottom-0 "
        >
          <path
            d="M71 0C74.4519 0 77.25 2.79825 77.25 6.25V118.75C77.25 122.202 74.4519 125 71 125H-16.5C-19.9517 125 -22.75 122.202 -22.75 118.75V106.25H-35.25V93.75H-22.75V81.25H-35.25V68.75H-22.75V56.25H-35.25V43.75H-22.75V31.25H-35.25V18.75H-22.75V6.25C-22.75 2.79825 -19.9517 0 -16.5 0H71ZM64.75 12.5H-10.25V112.5H64.75V12.5ZM33.5 37.5V56.25H52.25V68.75H33.4937L33.5 87.5H21L20.9937 68.75H2.25V56.25H21V37.5H33.5Z"
            fill="#252E87"
            className="opacity-5"
          />
        </svg>
      </div>
    </>
  );
};

export default About_Us_Section;
