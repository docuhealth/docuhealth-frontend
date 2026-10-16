import React from "react";
import {
  formatFullDateTime,
  getAge,
} from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import formatRecordDate from "../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";

const CaseNoteDetail = ({ caseNoteDetail, setCaseNoteDetail }) => {
  console.log("caseNoteDetail", caseNoteDetail);
  return (
    <div className="bg-white my-5 border rounded-lg pt-5 lg:pt-8 px-4 lg:px-6 text-sm ">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap sm:gap-0  border-b pb-4 w-full">
        <div
          className="flex justify-start items-center gap-1 cursor-pointer"
          onClick={() => setCaseNoteDetail(null)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.56528 6.41685H11.6654V7.58352H4.56528L7.69426 10.7125L6.86932 11.5374L2.33203 7.00019L6.86932 2.46289L7.69426 3.28785L4.56528 6.41685Z"
              fill="var(--color-docuhealth-dark)"
            />
          </svg>

          <h2 className=" text-sm">Detailed Case Note Overview</h2>
        </div>

      </div>
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <p className="text-[12px] mb-4">
          {" "}
          Patient's name :{" "}
          <span className="font-medium text-sm">
            {" "}
            {caseNoteDetail?.patient_info.firstname}{" "}
            {caseNoteDetail?.patient_info.lastname}
          </span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="">
            <p className="text-[12px]">
              {" "}
              Patient's HIN :{" "}
              <span className="font-medium ">
                {" "}
                {(caseNoteDetail?.patient_info?.hin || caseNoteDetail?.patient?.hin) ||
                  caseNoteDetail?.subaccount}
              </span>
            </p>
            <p className="text-[12px]">
              {" "}
              Patient's Age :{" "}
              <span className="font-medium ">
                {" "}
                {getAge(caseNoteDetail?.patient_info?.dob) || "30 years old"}
              </span>
            </p>
            <p className="text-[12px]">
              {" "}
              Patient's Gender :{" "}
              <span className="font-medium ">
                {" "}
                {caseNoteDetail?.patient_info?.gender || "Male"}
              </span>
            </p>
          </div>
          <div className="">
            <p className="text-[12px]">
              {" "}
              Patient's Doctor :{" "}
              <span className="font-medium ">
                {" "}
                {caseNoteDetail.staff_info.firstname}{" "}
                {caseNoteDetail.staff_info.lastname}
              </span>
            </p>
            <p className="text-[12px]">
              {" "}
              Specialisation :{" "}
              <span className="font-medium">
                {" "}
                {caseNoteDetail?.staff_info?.specialization || "surgeon"}
              </span>
            </p>
          </div>
          <div className="">
            <p className="text-[12px]">
              {" "}
              Hospital :{" "}
              <span className="font-medium ">
                {" "}
                {caseNoteDetail?.hospital_info?.name || "Test Clinic"}
              </span>
            </p>
            <p className="text-[12px]">
              {" "}
              Hospital's Email :{" "}
              <span className="font-medium ">
                {" "}
                {caseNoteDetail?.hospital_info?.email || "TestClinic@gmail.com"}
              </span>
            </p>
          </div>
          <div className="">
            <p className="text-[12px]">
              {" "}
              Status :{" "}
              <span className="font-medium ">
                {" "}
                {formatRecordDate(caseNoteDetail.created_at)}
              </span>
            </p>
            <p className="text-[12px]">
              {" "}
              Date / Time Uploaded :{" "}
              <span className="font-medium ">
                {" "}
                {formatFullDateTime(caseNoteDetail.created_at)}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <div className="text-[12px] pb-3">
          <h4 className="text-gray-400 font-normal mb-1">Patient's condition/observation:</h4>
          <ul className="list-disc list-outside pl-5 font-medium ">
            {caseNoteDetail?.observation?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="text-[12px] pb-3">
          <h4 className="text-gray-400 font-normal mb-1">Nursing care given:</h4>
          <ul className="list-disc list-outside pl-5 font-medium ">
            {caseNoteDetail?.care?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="text-[12px] pb-3">
          <h4 className="text-gray-400 font-normal mb-1">Patient's response to care:</h4>
          <ul className="list-disc list-outside pl-5 font-medium ">
            {caseNoteDetail?.response?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="text-[12px] pb-3">
          <h4 className="text-gray-400 font-normal mb-1">Abnormalities/Concerns:</h4>
          <ul className="list-disc list-outside pl-5 font-medium ">
            {caseNoteDetail?.abnormalities?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
            {(!caseNoteDetail?.abnormalities || caseNoteDetail.abnormalities.length === 0) && <li>None</li>}
          </ul>
        </div>

        <div className="text-[12px] ">
          <h4 className="text-gray-400 font-normal mb-1">Plan/Follow-up actions:</h4>
          <ul className="list-disc list-outside pl-5 font-medium ">
            {caseNoteDetail?.follow_up?.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CaseNoteDetail;
