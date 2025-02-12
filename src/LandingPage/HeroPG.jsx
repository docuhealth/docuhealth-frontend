import React, { useEffect }  from "react";
import overviewPG from "../assets/overview.png";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const HeroPG = () => {

  useEffect(() => {
    AOS.init({ duration: 1000 }); // Initialize AOS with a default duration
  }, []);

  return (
    <div className="min-h-screen lg:min-h-screen flex flex-col justify-center items-center py-28 sm:py-10 px-5">
      <div className="relative sm:p-10  flex flex-col justify-center items-center">
        <div className="hidden sm:block absolute left-0 top-10">
          <svg
            width="35"
            height="35"
            viewBox="0 0 35 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M28.7487 11.8535L28.3891 12.6784C28.126 13.2824 27.2907 13.2824 27.0274 12.6784L26.668 11.8535C26.027 10.3826 24.8726 9.21143 23.4321 8.57074L22.3242 8.07803C21.7252 7.8116 21.7252 6.93993 22.3242 6.6735L23.3701 6.20833C24.8477 5.55116 26.0228 4.33669 26.6527 2.81579L27.0219 1.92431C27.2793 1.303 28.1374 1.303 28.3946 1.92431L28.7639 2.81579C29.3939 4.33669 30.569 5.55116 32.0466 6.20833L33.0924 6.6735C33.6914 6.93993 33.6914 7.8116 33.0924 8.07803L31.9846 8.57074C30.5441 9.21143 29.3897 10.3826 28.7487 11.8535ZM21.875 31.4105L13.125 10.9938L9.71163 18.9583H1.45834V16.0417H7.78838L13.125 3.58958L21.875 24.0062L25.2884 16.0417H33.5417V18.9583H27.2116L21.875 31.4105Z"
              fill="#0E0E31"
            />
          </svg>
        </div>
        <div className="hidden sm:block absolute right-32 bottom-16">
          <svg
            width="35"
            height="35"
            viewBox="0 0 35 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M28.7487 11.8535L28.3891 12.6784C28.126 13.2824 27.2907 13.2824 27.0274 12.6784L26.668 11.8535C26.027 10.3826 24.8726 9.21143 23.4321 8.57074L22.3242 8.07803C21.7252 7.8116 21.7252 6.93993 22.3242 6.6735L23.3701 6.20833C24.8477 5.55116 26.0228 4.33669 26.6527 2.81579L27.0219 1.92431C27.2793 1.303 28.1374 1.303 28.3946 1.92431L28.7639 2.81579C29.3939 4.33669 30.569 5.55116 32.0466 6.20833L33.0924 6.6735C33.6914 6.93993 33.6914 7.8116 33.0924 8.07803L31.9846 8.57074C30.5441 9.21143 29.3897 10.3826 28.7487 11.8535ZM21.875 31.4105L13.125 10.9938L9.71163 18.9583H1.45834V16.0417H7.78838L13.125 3.58958L21.875 24.0062L25.2884 16.0417H33.5417V18.9583H27.2116L21.875 31.4105Z"
              fill="#0E0E31"
            />
          </svg>
        </div>
        <div className="absolute left-0 top-10 sm:hidden">
          <svg
            width="15"
            height="15"
            viewBox="0 0 35 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M28.7487 11.8535L28.3891 12.6784C28.126 13.2824 27.2907 13.2824 27.0274 12.6784L26.668 11.8535C26.027 10.3826 24.8726 9.21143 23.4321 8.57074L22.3242 8.07803C21.7252 7.8116 21.7252 6.93993 22.3242 6.6735L23.3701 6.20833C24.8477 5.55116 26.0228 4.33669 26.6527 2.81579L27.0219 1.92431C27.2793 1.303 28.1374 1.303 28.3946 1.92431L28.7639 2.81579C29.3939 4.33669 30.569 5.55116 32.0466 6.20833L33.0924 6.6735C33.6914 6.93993 33.6914 7.8116 33.0924 8.07803L31.9846 8.57074C30.5441 9.21143 29.3897 10.3826 28.7487 11.8535ZM21.875 31.4105L13.125 10.9938L9.71163 18.9583H1.45834V16.0417H7.78838L13.125 3.58958L21.875 24.0062L25.2884 16.0417H33.5417V18.9583H27.2116L21.875 31.4105Z"
              fill="#0E0E31"
            />
          </svg>
        </div>
        <div className="absolute right-0 top-28 sm:hidden">
          <svg
            width="15"
            height="15"
            viewBox="0 0 35 35"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M28.7487 11.8535L28.3891 12.6784C28.126 13.2824 27.2907 13.2824 27.0274 12.6784L26.668 11.8535C26.027 10.3826 24.8726 9.21143 23.4321 8.57074L22.3242 8.07803C21.7252 7.8116 21.7252 6.93993 22.3242 6.6735L23.3701 6.20833C24.8477 5.55116 26.0228 4.33669 26.6527 2.81579L27.0219 1.92431C27.2793 1.303 28.1374 1.303 28.3946 1.92431L28.7639 2.81579C29.3939 4.33669 30.569 5.55116 32.0466 6.20833L33.0924 6.6735C33.6914 6.93993 33.6914 7.8116 33.0924 8.07803L31.9846 8.57074C30.5441 9.21143 29.3897 10.3826 28.7487 11.8535ZM21.875 31.4105L13.125 10.9938L9.71163 18.9583H1.45834V16.0417H7.78838L13.125 3.58958L21.875 24.0062L25.2884 16.0417H33.5417V18.9583H27.2116L21.875 31.4105Z"
              fill="#0E0E31"
            />
          </svg>
        </div>
        <div className="bg-[#F6FDFF]  flex justify-center items-center gap-1 py-2 px-3 sm:px-5 rounded-full mb-3 text-center "  data-aos="zoom-in-up">
          <div>
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.49998 1.16667V2.50001H10.5V1.16667H11.8333V2.50001H14.5C14.8682 2.50001 15.1666 2.79849 15.1666 3.16667V13.8333C15.1666 14.2015 14.8682 14.5 14.5 14.5H2.49998C2.13179 14.5 1.83331 14.2015 1.83331 13.8333V3.16667C1.83331 2.79849 2.13179 2.50001 2.49998 2.50001H5.16665V1.16667H6.49998ZM13.8333 7.83334H3.16665V13.1667H13.8333V7.83334ZM5.83331 9.16667V10.5H4.49998V9.16667H5.83331ZM9.16665 9.16667V10.5H7.83331V9.16667H9.16665ZM12.5 9.16667V10.5H11.1666V9.16667H12.5ZM5.16665 3.83334H3.16665V6.5H13.8333V3.83334H11.8333V5.16667H10.5V3.83334H6.49998V5.16667H5.16665V3.83334Z"
                fill="#8E8EA9"
              />
            </svg>
          </div>
          <div className="text-[#8E8EA9] text-sm md:text-md" >
            Keep track of every health information
          </div>
        </div>
        <div >
          <div className=" text-2xl md:text-5xl text-center font-bold text-[#8E8EA9]"  data-aos="zoom-in-up" >
            <h1 className="hidden lg:block">
              DocuHealth - Your Health, Your <br />{" "}
              <span className="text-[#0E0E31]">Records</span>, One Secure Place
            </h1>
            <h1 className="block lg:hidden">
              DocuHealth - Your Health, Your{" "}
              <span className="text-[#0E0E31]">Records</span>, One Secure Place
            </h1>
          </div>
          <div>
            <p className="text-[#8E8EA9] text-sm sm:text-base text-center py-4" data-aos="fade-up"
 >
              DocuHealth is your all-in-one digital health companion, making it
              easy to store,
              <br /> access, and manage your medical history—all in one secure
              platform
            </p>
          </div>
          <div>
            <div className="flex justify-center items-center gap-3" data-aos="fade-right">
              <div class="flex -space-x-4 rtl:space-x-reverse">
                <img
                  class="w-10 h-10 border-2 border-white rounded-full object-cover"
                  src="https://img.freepik.com/free-photo/close-up-portrait-young-african-man-with-stubble_171337-1296.jpg?ga=GA1.1.384133121.1729851340&semt=ais_incoming"
                  alt=""
                />
                <img
                  class="w-10 h-10 border-2 border-white rounded-full object-cover"
                  src="https://img.freepik.com/free-photo/guy-orange-sweatshirt-looking-into-camera-blue-wall_197531-23585.jpg?ga=GA1.1.384133121.1729851340&semt=ais_incoming"
                  alt=""
                />
                <img
                  class="w-10 h-10 border-2 border-white rounded-full object-cover"
                  src="https://img.freepik.com/free-photo/black-man-posing_23-2148171684.jpg?ga=GA1.1.384133121.1729851340&semt=ais_incoming"
                  alt=""
                />
                <img
                  class="w-10 h-10 border-2 border-white rounded-full object-cover"
                  src="https://img.freepik.com/free-photo/african-american-guy-wearing-red-shirt-trendy-hat_273609-21706.jpg?ga=GA1.1.384133121.1729851340&semt=ais_incoming"
                  alt=""
                />
                <img
                  class="w-10 h-10 border-2 border-white rounded-full  object-cover"
                  src="https://img.freepik.com/premium-photo/friendly-positive-africanamerican-guy-wearing-shirt-tshirt-looks-camera_1339901-8575.jpg?ga=GA1.1.384133121.1729851340&semt=ais_incoming"
                  alt=""
                />
              </div>
              <div className="flex flex-col justify-start gap-1">
                <div className="flex justify-start items-center gap-1 ">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.99985 11.3333L4.08129 13.7268L5.14669 9.26039L1.65948 6.27321L6.23651 5.90627L7.99985 1.66666L9.76325 5.90627L14.3402 6.27321L10.853 9.26039L11.9184 13.7268L7.99985 11.3333Z"
                      fill="#FFCA28"
                    />
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.99985 11.3333L4.08129 13.7268L5.14669 9.26039L1.65948 6.27321L6.23651 5.90627L7.99985 1.66666L9.76325 5.90627L14.3402 6.27321L10.853 9.26039L11.9184 13.7268L7.99985 11.3333Z"
                      fill="#FFCA28"
                    />
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.99985 11.3333L4.08129 13.7268L5.14669 9.26039L1.65948 6.27321L6.23651 5.90627L7.99985 1.66666L9.76325 5.90627L14.3402 6.27321L10.853 9.26039L11.9184 13.7268L7.99985 11.3333Z"
                      fill="#FFCA28"
                    />
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.99985 11.3333L4.08129 13.7268L5.14669 9.26039L1.65948 6.27321L6.23651 5.90627L7.99985 1.66666L9.76325 5.90627L14.3402 6.27321L10.853 9.26039L11.9184 13.7268L7.99985 11.3333Z"
                      fill="#FFCA28"
                    />
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.99985 11.3333L4.08129 13.7268L5.14669 9.26039L1.65948 6.27321L6.23651 5.90627L7.99985 1.66666L9.76325 5.90627L14.3402 6.27321L10.853 9.26039L11.9184 13.7268L7.99985 11.3333Z"
                      fill="#FFCA28"
                    />
                  </svg>
                </div>
                <div className="text-[#8E8EA9] text-sm sm:text-base">
                  <p>Trusted by hospitals</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center py-5 w-full" data-aos="fade-right">
  <div className="bg-[#3535FE] py-2 px-5 rounded-full w-full sm:w-auto">
    <Link to='/welcome' className="w-full">
      <button className="text-white w-full  flex justify-center items-center gap-1">Get started for free  <svg
      width="14"
      height="15"
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.33551 5.99162L4.31501 11.0121L3.49005 10.1872L8.51056 5.16667H4.08553V4H10.5022V10.4167H9.33551V5.99162Z"
        fill="white"
      />
    </svg></button>
    </Link>
   
  </div>
</div>

        </div>
      </div>
      <div className="bg-gradient-to-b from-[#CAD1FF] to-[#869799] p-2 sm:p-5 rounded-lg lg:rounded-3xl my-3" data-aos="zoom-in">
        <img src={overviewPG} alt="overview_Img" className="w-[1080px]" />
      </div>
    </div>
  );
};

export default HeroPG;