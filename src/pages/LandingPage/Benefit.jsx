import React, { useEffect }  from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import groupImg from '../../assets/img/group.png'

const Benefit = () => {
  return (
    <div>
        <div className="flex flex-col justify-center items-center p-2" id="OurBenefits">
          <div className="bg-[#F6FDFF] py-3 px-5 rounded-full" data-aos="fade-down">
            <p className="text-sm">Benefit of DocuHealth</p>
          </div>
          <div className="">
            <h2 className="hidden sm:block sm:text-2xl font-semibold py-2 text-center text-wrap" data-aos="fade-left">
              Exciting Benefits Of DocuHealth ?
            </h2>
            <h2 className="block sm:hidden text-xl sm:text-2xl font-semibold py-2 text-center text-wrap" data-aos="fade-up">
              Exciting Benefits Of <br /> DocuHealth ?
            </h2>
          <div className=" sm:hidden grid grid-cols-2 place-items-center gap-2 my-2 p-2 ">
            <div className="bg-white shadow  rounded-md h-32 p-2 " data-aos="zoom-in-up">
              <div className="py-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3333 8.66667C13.3333 10.1394 12.7364 11.4727 11.7712 12.4379L12.714 13.3807C13.9204 12.1743 14.6666 10.5076 14.6666 8.66667C14.6666 4.98477 11.6818 2 7.99998 2C4.31808 2 1.33331 4.98477 1.33331 8.66667C1.33331 10.5076 2.07951 12.1743 3.28593 13.3807L4.22875 12.4379C3.2636 11.4727 2.66665 10.1394 2.66665 8.66667C2.66665 5.72115 5.05446 3.33333 7.99998 3.33333C10.9455 3.33333 13.3333 5.72115 13.3333 8.66667ZM10.1953 5.52865L7.19531 8.52867L8.13811 9.47147L11.1381 6.47145L10.1953 5.52865Z"
                    fill="#0C87AB"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-[#0C87AB] text-sm">Instant Access</h3>
                <p className="text-[#7B7B93]  text-sm">
                  View your medical records when needed.
                </p>
              </div>
            </div>
            <div className="bg-white shadow p-2 rounded-md  h-32 " data-aos="zoom-in-up">
              <div className="py-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.5 0.666748L13.9779 1.88407C14.283 1.95185 14.5 2.22239 14.5 2.53486V9.19268C14.5 10.5301 13.8316 11.779 12.7188 12.5209L8.5 15.3334L4.2812 12.5209C3.16841 11.779 2.5 10.5301 2.5 9.19268V2.53486C2.5 2.22239 2.71702 1.95185 3.02205 1.88407L8.5 0.666748ZM8.5 2.03261L3.83333 3.06964V9.19268C3.83333 10.0843 4.27893 10.9169 5.0208 11.4115L8.5 13.7309L11.9792 11.4115C12.7211 10.9169 13.1667 10.0843 13.1667 9.19268V3.06964L8.5 2.03261ZM11.4683 5.4813L12.4111 6.42411L8.1684 10.6667L5.33999 7.83835L6.28281 6.89548L8.16793 8.78068L11.4683 5.4813Z"
                    fill="#B58630"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-[#B58630] text-sm">No Lost Records</h3>
                <p className="text-[#7B7B93] text-sm">
                  All records are 
                 securely stored.
                </p>
              </div>
            </div>
            <div className="bg-white shadow p-2 rounded-md  h-32 " data-aos="zoom-in-up">
              <div className="py-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.66665 2.50008V1.16675H5.99998V2.50008H9.99998V1.16675H11.3333V2.50008H14C14.3682 2.50008 14.6666 2.79856 14.6666 3.16675V6.50008H13.3333V3.83341H11.3333V5.16675H9.99998V3.83341H5.99998V5.16675H4.66665V3.83341H2.66665V13.1667H6.66665V14.5001H1.99998C1.63179 14.5001 1.33331 14.2016 1.33331 13.8334V3.16675C1.33331 2.79856 1.63179 2.50008 1.99998 2.50008H4.66665ZM11.3333 8.50008C9.86058 8.50008 8.66665 9.69401 8.66665 11.1667C8.66665 12.6395 9.86058 13.8334 11.3333 13.8334C12.806 13.8334 14 12.6395 14 11.1667C14 9.69401 12.806 8.50008 11.3333 8.50008ZM7.33331 11.1667C7.33331 8.95761 9.12418 7.16675 11.3333 7.16675C13.5424 7.16675 15.3333 8.95761 15.3333 11.1667C15.3333 13.3759 13.5424 15.1667 11.3333 15.1667C9.12418 15.1667 7.33331 13.3759 7.33331 11.1667ZM10.6666 9.16675V11.4429L12.1952 12.9715L13.138 12.0287L12 10.8906V9.16675H10.6666Z"
                    fill="#8B2A83"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-[#8B2A83] text-sm">Time & Cost Saving</h3>
                <p className="text-[#7B7B93] text-sm">
                  Avoid unnecessary repitition of test.
                </p>
              </div>
            </div>
            <div className="bg-white shadow  rounded-md  h-32 p-2" data-aos="zoom-in-up">
              <div className="py-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_2_157)">
                    <path
                      d="M5.99998 2.4998V3.83313H2.66665V13.1665H13.3333V7.16647H14.6666V13.8331C14.6666 14.2013 14.3682 14.4998 14 14.4998H1.99998C1.63179 14.4998 1.33331 14.2013 1.33331 13.8331V3.16647C1.33331 2.79828 1.63179 2.4998 1.99998 2.4998H5.99998ZM12.6331 3.83313L10.6666 1.86664L11.6094 0.923828L15.1692 4.48363C15.3254 4.63983 15.3254 4.8931 15.1692 5.04931C15.0942 5.12433 14.9925 5.16647 14.8864 5.16647H9.33331C8.59691 5.16647 7.99998 5.76342 7.99998 6.4998V10.4998H6.66665V6.4998C6.66665 5.02704 7.86058 3.83313 9.33331 3.83313H12.6331Z"
                      fill="#829421"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2_157">
                      <rect
                        width="16"
                        height="16"
                        fill="white"
                        transform="translate(0 0.5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div>
                <h3 className="text-[#829421] text-sm">Seamless Sharing</h3>
                <p className="text-[#7B7B93]  text-sm">
                  Share records with doctors easily.
                </p>
              </div>
            </div>
          </div>
        
          <div className="hidden sm:grid grid-cols-2 place-items-center gap-4 my-2 p-2 ">
            <div className="bg-white shadow p-3 sm:p-4 rounded-md sm:w-[230px] transition-transform duration-300 hover:-rotate-6">
              <div className="py-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3333 8.66667C13.3333 10.1394 12.7364 11.4727 11.7712 12.4379L12.714 13.3807C13.9204 12.1743 14.6666 10.5076 14.6666 8.66667C14.6666 4.98477 11.6818 2 7.99998 2C4.31808 2 1.33331 4.98477 1.33331 8.66667C1.33331 10.5076 2.07951 12.1743 3.28593 13.3807L4.22875 12.4379C3.2636 11.4727 2.66665 10.1394 2.66665 8.66667C2.66665 5.72115 5.05446 3.33333 7.99998 3.33333C10.9455 3.33333 13.3333 5.72115 13.3333 8.66667ZM10.1953 5.52865L7.19531 8.52867L8.13811 9.47147L11.1381 6.47145L10.1953 5.52865Z"
                    fill="#0C87AB"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-[#0C87AB] text-sm">Instant Access</h3>
                <p className="text-[#7B7B93]  text-sm">
                  View your medical records when needed.
                </p>
              </div>
            </div>
            <div className="bg-white shadow p-3 sm:p-4 rounded-md sm:w-[230px] transition-transform duration-300 hover:rotate-6">
              <div className="py-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.5 0.666748L13.9779 1.88407C14.283 1.95185 14.5 2.22239 14.5 2.53486V9.19268C14.5 10.5301 13.8316 11.779 12.7188 12.5209L8.5 15.3334L4.2812 12.5209C3.16841 11.779 2.5 10.5301 2.5 9.19268V2.53486C2.5 2.22239 2.71702 1.95185 3.02205 1.88407L8.5 0.666748ZM8.5 2.03261L3.83333 3.06964V9.19268C3.83333 10.0843 4.27893 10.9169 5.0208 11.4115L8.5 13.7309L11.9792 11.4115C12.7211 10.9169 13.1667 10.0843 13.1667 9.19268V3.06964L8.5 2.03261ZM11.4683 5.4813L12.4111 6.42411L8.1684 10.6667L5.33999 7.83835L6.28281 6.89548L8.16793 8.78068L11.4683 5.4813Z"
                    fill="#B58630"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-[#B58630] text-sm">No Lost Records</h3>
                <p className="text-[#7B7B93] text-sm">
                  All records are 
                 securely stored.
                </p>
              </div>
            </div>
            <div className="bg-white shadow p-3 sm:p-4 rounded-md sm:w-[230px] transition-transform duration-300 hover:-rotate-6">
              <div className="py-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.66665 2.50008V1.16675H5.99998V2.50008H9.99998V1.16675H11.3333V2.50008H14C14.3682 2.50008 14.6666 2.79856 14.6666 3.16675V6.50008H13.3333V3.83341H11.3333V5.16675H9.99998V3.83341H5.99998V5.16675H4.66665V3.83341H2.66665V13.1667H6.66665V14.5001H1.99998C1.63179 14.5001 1.33331 14.2016 1.33331 13.8334V3.16675C1.33331 2.79856 1.63179 2.50008 1.99998 2.50008H4.66665ZM11.3333 8.50008C9.86058 8.50008 8.66665 9.69401 8.66665 11.1667C8.66665 12.6395 9.86058 13.8334 11.3333 13.8334C12.806 13.8334 14 12.6395 14 11.1667C14 9.69401 12.806 8.50008 11.3333 8.50008ZM7.33331 11.1667C7.33331 8.95761 9.12418 7.16675 11.3333 7.16675C13.5424 7.16675 15.3333 8.95761 15.3333 11.1667C15.3333 13.3759 13.5424 15.1667 11.3333 15.1667C9.12418 15.1667 7.33331 13.3759 7.33331 11.1667ZM10.6666 9.16675V11.4429L12.1952 12.9715L13.138 12.0287L12 10.8906V9.16675H10.6666Z"
                    fill="#8B2A83"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-[#8B2A83] text-sm">Time & Cost Saving</h3>
                <p className="text-[#7B7B93]  text-sm">
                  Avoid unnecessary repitition of test.
                </p>
              </div>
            </div>
            <div className="bg-white shadow p-3  sm:p-4 rounded-md sm:w-[230px] transition-transform duration-300 hover:rotate-6">
              <div className="py-1">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_2_157)">
                    <path
                      d="M5.99998 2.4998V3.83313H2.66665V13.1665H13.3333V7.16647H14.6666V13.8331C14.6666 14.2013 14.3682 14.4998 14 14.4998H1.99998C1.63179 14.4998 1.33331 14.2013 1.33331 13.8331V3.16647C1.33331 2.79828 1.63179 2.4998 1.99998 2.4998H5.99998ZM12.6331 3.83313L10.6666 1.86664L11.6094 0.923828L15.1692 4.48363C15.3254 4.63983 15.3254 4.8931 15.1692 5.04931C15.0942 5.12433 14.9925 5.16647 14.8864 5.16647H9.33331C8.59691 5.16647 7.99998 5.76342 7.99998 6.4998V10.4998H6.66665V6.4998C6.66665 5.02704 7.86058 3.83313 9.33331 3.83313H12.6331Z"
                      fill="#829421"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2_157">
                      <rect
                        width="16"
                        height="16"
                        fill="white"
                        transform="translate(0 0.5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div>
                <h3 className="text-[#829421] text-sm">Seamless Sharing</h3>
                <p className="text-[#7B7B93]  text-sm">
                  Share records with doctors easily.
                </p>
              </div>
            </div>
          </div>
        
        </div>
        <div data-aos="zoom-in-up">
            <img src={groupImg} alt="group_Img" />
          </div>
      </div>
    </div>
  );
};

export default Benefit;
