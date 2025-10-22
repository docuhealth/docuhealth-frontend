import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import hero_img from "../../../assets/img/hero_img.png";
import AOS from "aos";
import "aos/dist/aos.css";

const HeroPG = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 }); // Initialize AOS with a default duration
  }, []);

  return (
    <>
      <div className=" bg-cover bg-left relative px-16 py-20 ">
        <div className="flex items-start gap-5 ">
          <div className="flex-1 ">
            <h1 className="text-5xl font-bold leading-[60px] pb-5 text-[#212121] ">
              Nigeria's First{" "}
              <span className="text-[#3E4095] block underline-double">
                Centralized
              </span>{" "}
              <span className="block">Healthcare Platform</span>
            </h1>
            <p className="font-normal pb-10 text-[#727272] text-sm">
              Connecting Patients, Providers, and Payers through One <br /> Secure
              Healthcare System.
            </p>
            <div className="text-sm flex items-center gap-3">
              <button className="group border border-[#3E4095]  transition-all hover:bg-[#3E4095] hover:text-white rounded-full py-2 px-8 text-[#3E4095] flex items-center gap-1">
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
              <button className="border rounded-full py-2 px-8  transition-all hover:bg-[#34345F] bg-[#3E4095] text-white flex items-center gap-1">
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
          <div className="flex-1 z-10">
            <img src={hero_img} alt="hero image" className="rounded-lg w-full object-contain" />
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
    </>
  );
};

export default HeroPG;
