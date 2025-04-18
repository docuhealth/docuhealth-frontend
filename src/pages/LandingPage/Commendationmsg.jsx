import React, { useEffect }  from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const Commendationmsg = () => {
  return (
    <div className="mx-5 lg:mx-28 my-10">
      <div className="flex flex-col justify-start items-start ">
        <div className="bg-[#F6FDFF] py-3 px-5 rounded-full" data-aos="fade-down" >
          <p className="text-sm">Additional info</p>
        </div>
        <div className="">
          <h2 className=" hidden sm:block sm:text-2xl font-semibold py-2" data-aos="fade-right" >Commendation of Nigerian health care professionals</h2>
          <h2 className="text-xl sm:hidden sm:text-2xl font-semibold py-2" data-aos="fade-up" >Commendation of Nigerian health care professionals</h2>
          <div className="hidden sm:block bg-white shadow py-10 px-5">
            <p className="text-[#7B7B93]  text-sm">
              We commend the Nigerian government and health care professionals
              for their ongoing efforts to improve digital services and patients
              data management. DocuHealth align with national health goals by
              providing a secure, accessible and efficient medical record
              system, ensuring that every Nigerian has control over their health
              history.
            </p>
          </div>
          <div class="relative p-4 bg-white shadow rounded-lg overflow-hidden sm:hidden">
  <div class="h-32 overflow-y-auto pr-2 text-[#7B7B93] ">
    <p class="font-medium text-[#7B7B93] ">
    We commend the Nigerian government and health care professionals for their ongoing efforts to improve digital services and patients data management. DocuHealth align with national health goals by providing a secure, accessible and efficient medical record system, ensuring that every Nigerian has control over their health history.
    </p>
  </div>
  <div class="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
</div>

        </div>
      </div>
    </div>
  );
};

export default Commendationmsg;
