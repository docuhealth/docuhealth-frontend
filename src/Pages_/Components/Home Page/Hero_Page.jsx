import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import footerImgMobile from "../../../assets/img/footerImgMobile.png";
import AOS from "aos";
import "aos/dist/aos.css";

const HeroPG = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 }); // Initialize AOS with a default duration
  }, []);

  return (
    <>
      <div className=" hidden lg:block bg-cover bg-left relative px-5 lg:px-16 py-36 lg:py-20  ">
        <div className="flex flex-col lg:flex-row items-start sm:items-center lg:items-start gap-5 ">
          <div className="flex-1 w-full">
            <h1 className="text-3xl lg:text-5xl 2xl:text-6xl font-bold leading-[50px] lg:leading-[60px] pb-5 text-[#212121] text-center lg:text-left">
              Nigeria's First{" "}
              <span className="text-[#3E4095] block underline-double">
                Centralized
              </span>{" "}
              <span className="block">Healthcare Platform</span>
            </h1>
            <p className="font-normal pb-10 text-[#727272] text-sm  2xl:text-xl hidden lg:block ">
              Connecting Patients, Providers, and Payers through One <br />{" "}
              Secure Healthcare System.
            </p>
            <p className="font-normal pb-10 text-[#727272] text-sm text-center lg:hidden ">
              Connecting Patients, Providers, and Payers through One Secure
              Healthcare System.
            </p>
            <div className="text-sm flex flex-col lg:flex-row items-center gap-3">
              <button className="hidden  group w-full lg:w-auto justify-center border border-[#3E4095]  transition-all hover:bg-[#3E4095] hover:text-white rounded-full py-2 px-8 text-[#3E4095] lg:flex items-center gap-1 2xl:text-xl">
                Partner with Us as A Healthcare Provider
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.6688 6.27614L4.93109 12.0139L3.98828 11.0711L9.72601 5.33333H4.66883V4H12.0021V11.3333H10.6688V6.27614Z"
                    className="fill-[#3E4095] transition-all duration-300 group-hover:fill-white"
                  />
                </svg>
              </button>
              <button className="group w-full lg:w-auto justify-center border border-[#3E4095]  transition-all hover:bg-[#3E4095] hover:text-white rounded-full py-2 px-8 text-[#3E4095] hidden sm:flex   lg:hidden items-center gap-1">
                Partner with Us as A Healthcare Provider
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.6688 6.27614L4.93109 12.0139L3.98828 11.0711L9.72601 5.33333H4.66883V4H12.0021V11.3333H10.6688V6.27614Z"
                    className="fill-[#3E4095] transition-all duration-300 group-hover:fill-white"
                  />
                </svg>
              </button>
              <button className="group w-full lg:w-auto justify-center border border-[#3E4095]  transition-all hover:bg-[#3E4095] hover:text-white rounded-full py-2 px-8 text-[#3E4095] flex sm:hidden items-center gap-1 ">
                Partner with Us
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.6688 6.27614L4.93109 12.0139L3.98828 11.0711L9.72601 5.33333H4.66883V4H12.0021V11.3333H10.6688V6.27614Z"
                    className="fill-[#3E4095] transition-all duration-300 group-hover:fill-white"
                  />
                </svg>
              </button>
              <button className="border w-full lg:w-auto  rounded-full py-2 px-8  transition-all hover:bg-[#34345F] bg-[#3E4095] text-white flex items-center gap-1 justify-center 2xl:text-xl">
                Get your HIN
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.6688 6.27614L4.93109 12.0139L3.98828 11.0711L9.72601 5.33333H4.66883V4H12.0021V11.3333H10.6688V6.27614Z"
                    className="fill-white transition-all duration-300 "
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 z-10 ">
            <img
              src='https://res.cloudinary.com/drhfrgahv/image/upload/v1762777871/hero_img_rfihkx.png'
              alt="hero image"
              className="rounded-lg w-full object-contain"
            />
          </div>
        </div>
        <svg
          width="177"
          height="190"
          viewBox="0 0 177 232"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-0 top-0 -z-20"
        >
          <path
            opacity="0.05"
            d="M216.205 29.0381L208.102 52.6885L231.753 60.7913L215.547 108.092C206.597 134.215 178.164 148.138 152.04 139.188C125.917 130.238 111.995 101.804 120.945 75.681L137.151 28.38L160.801 36.4829L168.904 12.8324L133.428 0.678175C126.897 -1.55942 119.789 1.92115 117.552 8.45199L97.2946 67.5781C85.251 102.731 100.818 140.672 132.44 157.801L126.035 176.524C118.204 199.383 93.3251 211.564 70.4669 203.733C52.761 197.667 41.461 181.372 40.9068 163.71C55.1771 162.422 68.043 152.957 72.9861 138.53C79.6989 118.936 69.2579 97.6124 49.6647 90.8996C30.0715 84.1868 8.74754 94.6278 2.03476 114.221C-3.52013 130.435 2.67207 147.835 16.0765 157.157C13.7468 187.63 32.101 217.015 62.3641 227.383C98.2844 239.69 137.379 220.548 149.686 184.627L156.096 165.908C191.583 171.777 227.152 151.353 239.197 116.195L259.454 57.0689C261.692 50.5381 258.211 43.4298 251.681 41.1923L216.205 29.0381Z"
            fill="#252E87"
            className="opacity-5"
          />
        </svg>
        <svg
          width="90"
          height="173"
          viewBox="0 0 109 173"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-0 bottom-10 -z-10"
        >
          <path
            d="M87.9482 90.8621L66.2976 78.3621L78.7976 56.7114L35.4963 31.7114C11.5821 17.9045 -18.9978 26.098 -32.8049 50.0127C-46.6118 73.9269 -38.4179 104.507 -14.5037 118.314L28.7976 143.314L41.2976 121.663L62.9482 134.163L44.1982 166.639C40.7464 172.618 33.1015 174.666 27.1229 171.215L-27.0037 139.965C-59.1841 121.385 -72.3869 82.5582 -59.811 48.866L-76.9436 38.963C-97.8689 26.8818 -124.626 34.0513 -136.707 54.9766C-146.065 71.1854 -143.873 90.8931 -132.683 104.569C-121.081 96.1612 -105.164 94.839 -91.9556 102.465C-74.0191 112.82 -67.874 135.754 -78.2296 153.691C-88.5853 171.627 -111.519 177.772 -129.456 167.417C-144.298 158.847 -151.067 141.663 -147.091 125.827C-168.874 104.391 -174.353 70.1808 -158.358 42.4766C-139.373 9.59363 -97.3265 -1.67263 -64.4435 17.3124L-47.3093 27.2076C-24.4202 -0.537643 15.8116 -8.52109 47.9963 10.0608L102.123 41.3108C108.102 44.7625 110.15 52.4075 106.698 58.3861L87.9482 90.8621Z"
            fill="#252E87"
            className="opacity-5"
          />
        </svg>
      </div>
      <div
        className="lg:hidden bg-cover bg-center bg-no-repeat relative px-5 lg:px-16 py-36 lg:py-20  "
        style={{
          backgroundImage: `url(${footerImgMobile})`,
        }}
      >
        <div className="flex flex-col lg:flex-row items-start sm:items-center lg:items-start gap-5 ">
          <div className="flex-1 w-full z-40">
            <h1 className="text-4xl lg:text-5xl font-bold leading-10 lg:leading-[60px] pb-5 text-white text-center lg:text-left ">
              Nigeria's First{" "}
              <span className="text-[#B9BBFF] block sm:inline ">Centralized</span>{" "}
              <span className="block">Healthcare Platform</span>
            </h1>
            <div className="sm:max-w-sm mx-auto ">
   <p className="font-normal pb-5 text-[#DDDDDD] text-sm text-center lg:hidden ">
              Connecting Patients, Providers, and Payers through One Secure
              Healthcare System.
            </p>
            </div>
         
            <div className="text-sm flex flex-col lg:flex-row items-center gap-3">
              <button className="w-full lg:w-auto justify-center   transition-all bg-white rounded-full py-2 px-8 text-[#3E4095] flex sm:hidden items-center gap-1">
                Partner with Us
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.6688 6.27614L4.93109 12.0139L3.98828 11.0711L9.72601 5.33333H4.66883V4H12.0021V11.3333H10.6688V6.27614Z"
                    className="fill-[#3E4095] transition-all duration-300"
                  />
                </svg>
              </button>
                   <button className="w-full lg:w-auto justify-center   transition-all bg-white rounded-full py-2 px-8 text-[#3E4095] hidden sm:flex lg:hidden items-center gap-1">
                Partner with Us as A Healthcare Provider
                </button>
              <button className="border border-white w-full lg:w-auto  rounded-full py-2 px-8  transition-all  text-white flex items-center gap-1 justify-center ">
                Get your HIN
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.6688 6.27614L4.93109 12.0139L3.98828 11.0711L9.72601 5.33333H4.66883V4H12.0021V11.3333H10.6688V6.27614Z"
                    className="fill-white transition-all duration-300 "
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 z-10 ">
            <img
              src='https://res.cloudinary.com/drhfrgahv/image/upload/v1762777871/hero_img_rfihkx.png'
              alt="hero image"
              className="rounded-lg w-full object-contain"
            />
          </div>
        </div>
        <svg
          width="50"
          height="100"
          viewBox="0 0 22 87"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-0 top-14 z-20"
        >
          <path
            opacity="0.05"
            d="M7.86423 71.2758L16.0937 69.0707L18.2988 77.3003L34.7579 72.8901C43.8478 70.4544 49.2424 61.1109 46.8067 52.0208C44.3711 42.9309 35.0274 37.5364 25.9375 39.972L9.47847 44.3822L11.6836 52.6117L3.45404 54.8168L0.146405 42.4725C-0.462531 40.1999 0.88612 37.8641 3.15862 37.2552L23.7324 31.7425C35.9644 28.4649 48.5024 34.6398 53.5909 45.7893L60.1058 44.0472C68.0597 41.9159 72.7798 33.7404 70.6486 25.7866C68.9977 19.6256 63.7203 15.4048 57.7282 14.8057C56.9585 19.6276 53.4414 23.782 48.421 25.1272C41.6032 26.954 34.5959 22.9083 32.7691 16.0906C30.9422 9.2728 34.988 2.26545 41.8057 0.438638C47.4474 -1.07306 53.2195 1.43682 56.0776 6.21107C66.4923 6.12742 76.0565 13.051 78.8781 23.5815C82.2272 36.0805 74.8099 48.9276 62.3109 52.2767L55.7975 54.0211C56.9677 66.2228 49.1966 77.8416 36.963 81.1196L16.3892 86.6323C14.1167 87.2412 11.7808 85.8926 11.1719 83.6201L7.86423 71.2758Z"
            fill="#FFF"
          />
        </svg>

        <svg
          width="50"
          height="100"
          viewBox="0 0 109 173"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-0 bottom-0 z-20"
        >
          <path
            opacity="0.05"
            d="M87.9482 90.8621L66.2976 78.3621L78.7976 56.7114L35.4963 31.7114C11.5821 17.9045 -18.9978 26.098 -32.8049 50.0127C-46.6118 73.9269 -38.4179 104.507 -14.5037 118.314L28.7976 143.314L41.2976 121.663L62.9482 134.163L44.1982 166.639C40.7464 172.618 33.1015 174.666 27.1229 171.215L-27.0037 139.965C-59.1841 121.385 -72.3869 82.5582 -59.811 48.866L-76.9436 38.963C-97.8689 26.8818 -124.626 34.0513 -136.707 54.9766C-146.065 71.1854 -143.873 90.8931 -132.683 104.569C-121.081 96.1612 -105.164 94.839 -91.9556 102.465C-74.0191 112.82 -67.874 135.754 -78.2296 153.691C-88.5853 171.627 -111.519 177.772 -129.456 167.417C-144.298 158.847 -151.067 141.663 -147.091 125.827C-168.874 104.391 -174.353 70.1808 -158.358 42.4766C-139.373 9.59363 -97.3265 -1.67263 -64.4435 17.3124L-47.3093 27.2076C-24.4202 -0.537643 15.8116 -8.52109 47.9963 10.0608L102.123 41.3108C108.102 44.7625 110.15 52.4075 106.698 58.3861L87.9482 90.8621Z"
            fill="#FFF"
          />
        </svg>



        <svg width="353" height="314" viewBox="0 0 353 314" fill="none" xmlns="http://www.w3.org/2000/svg"    className="absolute   top-[14%] sm:top-[8%]  left-1/2 -translate-x-1/2 lg:hidden">
<path d="M180.271 53.7018C242.936 53.7018 293.677 99.982 293.677 157.001C293.676 214.019 242.935 260.299 180.271 260.299C117.606 260.298 66.8645 214.019 66.8643 157.001C66.8643 99.9821 117.606 53.702 180.271 53.7018Z" stroke="#B5B5B5" stroke-opacity="0.15" stroke-width="0.729452"/>
<path d="M180.271 41.6566C250.181 41.6566 306.796 93.328 306.796 156.998C306.796 220.669 250.181 272.34 180.271 272.34C110.36 272.34 53.7451 220.669 53.7451 156.998C53.7453 93.3281 110.36 41.6567 180.271 41.6566Z" stroke="#B5B5B5" stroke-opacity="0.15" stroke-width="0.729452"/>
<path d="M180.27 29.3987C257.663 29.3988 320.343 86.5589 320.344 156.999C320.344 227.44 257.663 284.6 180.27 284.6C102.876 284.6 40.1943 227.44 40.1943 156.999C40.1946 86.5588 102.876 29.3987 180.27 29.3987Z" stroke="#B5B5B5" stroke-opacity="0.15" stroke-width="0.729452"/>
<path d="M180.269 16.0649C265.739 16.0649 334.968 79.1955 334.968 157C334.968 234.805 265.739 297.935 180.269 297.935C94.7982 297.935 25.5695 234.805 25.5693 157C25.5693 79.1956 94.7981 16.0651 180.269 16.0649Z" stroke="#B5B5B5" stroke-opacity="0.15" stroke-width="0.729452"/>
<path d="M180.27 0.364258C275.243 0.364258 352.175 70.5239 352.175 157C352.175 243.476 275.243 313.636 180.27 313.636C85.2965 313.636 8.36426 243.476 8.36426 157C8.36426 70.524 85.2965 0.364423 180.27 0.364258Z" stroke="#B5B5B5" stroke-opacity="0.15" stroke-width="0.729452"/>
<circle cx="287.174" cy="140.941" r="0.775362" fill="white"/>
<circle cx="227.472" cy="111.477" r="0.775362" fill="white"/>
<circle cx="329.819" cy="182.811" r="0.775362" fill="white"/>
<circle cx="260.811" cy="163.427" r="0.775362" fill="white"/>
<circle cx="324.392" cy="235.536" r="0.775362" fill="white"/>
<circle cx="271.666" cy="207.623" r="0.775362" fill="white"/>
<circle cx="342.225" cy="126.21" r="0.775362" fill="white"/>
<circle cx="231.348" cy="125.434" r="0.775362" fill="white"/>
<circle cx="171.645" cy="95.9699" r="0.775362" fill="white"/>
<circle cx="273.993" cy="167.303" r="0.775362" fill="white"/>
<circle cx="204.985" cy="147.919" r="0.775362" fill="white"/>
<circle cx="268.565" cy="220.028" r="0.775362" fill="white"/>
<circle cx="215.841" cy="192.115" r="0.775362" fill="white"/>
<circle cx="286.398" cy="110.702" r="0.775362" fill="white"/>
<circle cx="262.362" cy="92.8686" r="0.775362" fill="white"/>
<circle cx="202.659" cy="63.4053" r="0.775362" fill="white" fill-opacity="0.5"/>
<circle cx="305.008" cy="134.738" r="0.775362" fill="white"/>
<circle cx="236" cy="115.354" r="0.775362" fill="white"/>
<circle cx="299.579" cy="187.463" r="0.775362" fill="white"/>
<circle cx="246.855" cy="159.55" r="0.775362" fill="white"/>
<circle cx="317.413" cy="78.137" r="0.775362" fill="white"/>
<circle cx="89.457" cy="81.2383" r="0.775362" fill="white" fill-opacity="0.5"/>
<circle cx="29.7539" cy="51.7749" r="0.775362" fill="white" fill-opacity="0.5"/>
<circle cx="132.102" cy="123.108" r="0.775362" fill="white"/>
<circle cx="63.0947" cy="103.724" r="0.775362" fill="white"/>
<circle cx="126.674" cy="175.833" r="0.775362" fill="white"/>
<circle cx="73.9492" cy="147.919" r="0.775362" fill="white"/>
<circle cx="144.508" cy="66.5066" r="0.775362" fill="white" fill-opacity="0.5"/>
<circle cx="82.4785" cy="200.644" r="0.775362" fill="white"/>
<circle cx="22.7754" cy="171.18" r="0.775362" fill="white"/>
<circle cx="125.123" cy="242.514" r="0.775362" fill="white"/>
<circle cx="56.1152" cy="223.13" r="0.775362" fill="white"/>
<circle cx="119.695" cy="295.238" r="0.775362" fill="white"/>
<circle cx="66.9716" cy="267.326" r="0.775362" fill="white"/>
<circle cx="137.529" cy="185.912" r="0.775362" fill="white"/>
<circle cx="171.645" cy="189.789" r="0.775362" fill="white"/>
<circle cx="111.941" cy="160.325" r="0.775362" fill="white"/>
<circle cx="214.29" cy="231.659" r="0.775362" fill="white"/>
<circle cx="145.283" cy="212.275" r="0.775362" fill="white"/>
<circle cx="208.862" cy="284.383" r="0.775362" fill="white"/>
<circle cx="156.138" cy="256.47" r="0.775362" fill="white"/>
<circle cx="226.695" cy="175.057" r="0.775362" fill="white"/>
<path d="M340 29C340.09 32.2755 342.724 34.9096 346 35C342.724 35.0904 340.09 37.7245 340 41C339.91 37.7245 337.276 35.0904 334 35C337.276 34.9096 339.91 32.2755 340 29Z" fill="white"/>
<path d="M6 192C6.09044 195.276 8.72449 197.91 12 198C8.72449 198.09 6.09044 200.724 6 204C5.90956 200.724 3.27551 198.09 0 198C3.27551 197.91 5.90956 195.276 6 192Z" fill="white"/>
</svg>

      </div>
    </>
  );
};

export default HeroPG;
