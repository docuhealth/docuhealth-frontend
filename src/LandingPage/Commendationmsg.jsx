import React from "react";

const Commendationmsg = () => {
  return (
    <div className="mx-5 lg:mx-28 my-10">
      <div className="flex flex-col justify-start items-start ">
        <div className="bg-[#F6FDFF] py-3 px-5 rounded-full">
          <p className="text-sm">Additional info</p>
        </div>
        <div className="">
          <h2 className="text-2xl font-semibold py-2">Commendation</h2>
          <div className="hidden sm:block bg-white shadow-md py-10 px-5">
            <p className="text-[#8E8EA9] text-sm">
              We commend the Nigerian government and health care professionals
              for their ongoing efforts to improve digital services and patients
              data management. DocuHealth align with national health goals by
              providing a secure, accessible and efficient medical record
              system, ensuring that every Nigerian has control over their health
              history.
            </p>
          </div>
          <div class="relative p-4 bg-white shadow-lg rounded-lg overflow-hidden sm:hidden">
  <div class="h-32 overflow-y-auto pr-2 text-gray-600">
    <p class="font-medium text-gray-700">
      We commend the Nigerian government and health care professionals for their ongoing efforts to improve digital services and patients' data management. DocuHealth aligns with national health goals by providing a secure and efficient system.
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
