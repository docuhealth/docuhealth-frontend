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
        {/* <div className=" flex flex-col sm:flex-row justify-end items-center gap-3 w-full sm:w-auto">
          <div className="flex justify-center items-center gap-1 border border-docuhealth-primary py-1.5 px-4 rounded-full w-full sm:w-auto text-docuhealth-primary">
            <svg
              width="14"
              height="14"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.5 1C8.77615 1 9 1.22386 9 1.5V3.5H10.5C10.7761 3.5 11 3.72386 11 4V9C11 9.27615 10.7761 9.5 10.5 9.5H9V10.5C9 10.7761 8.77615 11 8.5 11H3.5C3.22386 11 3 10.7761 3 10.5V9.5H1.5C1.22386 9.5 1 9.27615 1 9V4C1 3.72386 1.22386 3.5 1.5 3.5H3V1.5C3 1.22386 3.22386 1 3.5 1H8.5ZM8 8.5H4V10H8V8.5ZM10 4.5H2V8.5H3V8C3 7.72385 3.22386 7.5 3.5 7.5H8.5C8.77615 7.5 9 7.72385 9 8V8.5H10V4.5ZM4 5V6H2.5V5H4ZM8 2H4V3.5H8V2Z"
                fill="var(--color-docuhealth-primary)"
              />
            </svg>

            <p>Print summary</p>
          </div>
          <div className="flex justify-center items-center gap-1 border border-docuhealth-primary py-1.5 px-4 rounded-full text-white bg-docuhealth-primary w-full sm:w-auto">
            <svg
              width="14"
              height="14"
              viewBox="0 0 12 12"
              fill="var(--color-docuhealth-primary)"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.5 7.25C0.5 6.0858 1.11215 5.06455 2.03213 4.4906C2.28235 2.522 3.96343 1 6 1C8.03655 1 9.71765 2.522 9.96785 4.4906C10.8878 5.06455 11.5 6.0858 11.5 7.25C11.5 8.9608 10.1781 10.3629 8.5 10.4906L3.5 10.5C1.82189 10.3629 0.5 8.9608 0.5 7.25ZM8.42415 9.4934C9.59085 9.40465 10.5 8.42805 10.5 7.25C10.5 6.4635 10.0942 5.7481 9.43855 5.33905L9.0357 5.0877L8.97585 4.61669C8.78675 3.12902 7.5144 2 6 2C4.48558 2 3.21323 3.12902 3.02415 4.61669L2.96428 5.0877L2.56144 5.33905C1.90578 5.7481 1.5 6.4635 1.5 7.25C1.5 8.42805 2.40917 9.40465 3.57585 9.4934L3.6625 9.5H8.3375L8.42415 9.4934ZM6.5 6H8L6 8.5L4 6H5.5V4H6.5V6Z"
                fill="#FFF"
              />
            </svg>

            <p>Download PDF</p>
          </div>
        </div> */}
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
