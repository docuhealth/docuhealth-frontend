import React, { useState } from "react";
import Pagination2 from "../../../../Patient_Dashboard_Components/Pagination/Pagination2";
import formatRecordDate from "../../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import {
  formatFullDateTime,
  getAge,
} from "../../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { truncateWords } from "../../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import {
  CalendarIcon,
  User,
  UserIcon,
  Image,
  FileText,
  Eye,
  ArrowDownToLine,
} from "lucide-react";
import {
  formatFullDate,
  formatTime,
} from "../../../../Patient_Dashboard_Components/Patient_Appointments_Dashboard/Components/Date_Time_Formatter";
import toast from "react-hot-toast";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import {useMutation, useQueryClient } from "@tanstack/react-query";
import { renderListOrString, renderLabTests, renderDrugRecords } from "../../../../../../utils/soapNoteHelpers";
import PatientInfoCard from "../../../../../ui/PatientInfoCard";
import GeneralPatientInfoForm from "../../../../../ui/GeneralPatientInfoForm";
import VitalSignsCard from "../../../../../ui/VitalSignsCard";
import ClinicalSummaryCard from "../../../../../ui/ClinicalSummaryCard";
import Input from "../../../../../ui/Input";

const PatientInfo = ({ patientFullInfo }) => {
  console.log(patientFullInfo);
  return (
    <>
      <GeneralPatientInfoForm patient={patientFullInfo?.patient_info}>
          <Input label="Assigned doctor" readOnly value="NIL" />

          <Input label="Date of last visit" readOnly value="NIL" />
      </GeneralPatientInfoForm>

      <VitalSignsCard
        className="my-5 bg-docuhealth-light-gray rounded-lg border p-4"
        title={`Latest vital signs (Created : ${formatFullDateTime(patientFullInfo?.latest_vitals?.created_at)})`}
        vitalSigns={patientFullInfo?.latest_vitals}
      />
      <div className="my-5 bg-docuhealth-light-gray rounded-lg border p-4">
        <h2 className="font-medium">
          Ongoing Medication ({patientFullInfo?.ongoing_drugs?.length || 0})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[12px] mt-5">
          {patientFullInfo?.ongoing_drugs?.map((drug, index) => (
            <div key={index} className="border p-4 rounded-md bg-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.1861 2.81611C14.7481 4.3782 14.7481 6.91088 13.1861 8.47295L11.7713 9.88668L8.47199 13.187C6.90986 14.7491 4.37722 14.7491 2.81512 13.187C1.25303 11.6249 1.25303 9.09228 2.81512 7.53015L7.52919 2.81611C9.09126 1.25401 11.6239 1.25401 13.1861 2.81611ZM9.88619 9.88715L6.11496 6.11593L3.75794 8.47295C2.71654 9.51435 2.71654 11.2028 3.75794 12.2442C4.79933 13.2856 6.48777 13.2856 7.52919 12.2442L9.88619 9.88715Z"
                      fill="#EE1414"
                    />
                  </svg>
                  <p className="font-medium">{drug.name}</p>
                </div>

                <span className="bg-blue-100/50 text-docuhealth-primary px-3 py-1 rounded-full text-[12px]">
                  Ongoing
                </span>
              </div>

              <div className="flex justify-between mt-2">
                <p>Dosage:</p>
                <p className="text-right font-medium">
                  {drug.quantity ? `${drug.quantity} mg` : "NIL"}
                </p>
              </div>

              <div className="flex justify-between mt-2">
                <p>Frequency:</p>
                <p className="text-right font-medium">
                  {drug.frequency
                    ? `${drug.frequency.value}× ${drug.frequency.rate}`
                    : "NIL"}
                </p>
              </div>

              <div className="flex justify-between mt-2">
                <p>Duration:</p>
                <p className="text-right font-medium">
                  {drug.duration
                    ? `${drug.duration.value} ${drug.duration.rate}`
                    : "NIL"}
                </p>
              </div>

              <div className="flex justify-between mt-2">
                <p>Prescribed by:</p>
                <p className="text-right font-medium">
                  {patientFullInfo?.latest_vitals?.staff_info
                    ? `Dr. ${patientFullInfo.latest_vitals.staff_info.firstname} ${patientFullInfo.latest_vitals.staff_info.lastname}`
                    : "NIL"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const PatientMedicalRecord = ({
  patientMedRecords,
  count,
  currentPage,
  totalPages,
  setCurrentPage,
  setSelectedMedicalRecord,
  setViewDetailMedicalRecord,
  medloading,
}) => {
  if (medloading) {
    return (
      <div className="flex justify-center items-center h-full text-sm pt-10">
        Loading...
      </div>
    );
  }

  if (!patientMedRecords || patientMedRecords.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center  h-full">
        <svg
          width="200"
          height="200"
          viewBox="0 0 366 366"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_1501_46523)">
            <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
          </g>
          <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
          <path
            d="M183 233.5C148.482 233.5 120.5 205.518 120.5 171C120.5 136.482 148.482 108.5 183 108.5C217.518 108.5 245.5 136.482 245.5 171C245.5 205.518 217.518 233.5 183 233.5ZM183 221C210.614 221 233 198.614 233 171C233 143.386 210.614 121 183 121C155.386 121 133 143.386 133 171C133 198.614 155.386 221 183 221ZM176.75 139.75H189.25V152.25H176.75V139.75ZM176.75 164.75H189.25V202.25H176.75V164.75Z"
            fill="#929AA3"
          />
          <defs>
            <filter
              id="filter0_d_1501_46523"
              x="0"
              y="0"
              width="366"
              height="366"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="12" />
              <feGaussianBlur stdDeviation="12" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0.15 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1501_46523"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1501_46523"
                result="shape"
              />
            </filter>
          </defs>
        </svg>

        <h2 className="font-medium pb-1">No medical records!</h2>
        <div className="max-w-md text-center">
          <p className="text-[12px] text-gray-500">
            {" "}
            This patient does not have any medical records
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {Array.isArray(patientMedRecords) && patientMedRecords.length > 0 ? (
        <>
          <div className="my-4 text-[12px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {patientMedRecords.map((record) => (
              <div
                key={record.id}
                className="bg-docuhealth-bg-light border rounded-xl p-5"
              >
                <div className="flex justify-between items-center ">
                  <div className="flex items-center gap-1">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.50165 9.24984C9.88142 9.24984 11.8452 11.0312 12.1322 13.3332H2.87109C3.15814 11.0312 5.12187 9.24984 7.50165 9.24984ZM6.44401 10.5795C5.60773 10.8447 4.90335 11.4159 4.46914 12.1665H7.50165L6.44401 10.5795ZM8.55953 10.5797L7.50165 12.1665H10.5342C10.1 11.416 9.39574 10.8448 8.55953 10.5797ZM11.0017 1.6665V5.1665C11.0017 7.0995 9.43464 8.6665 7.50165 8.6665C5.56866 8.6665 4.00166 7.0995 4.00166 5.1665V1.6665H11.0017ZM5.16832 5.1665C5.16832 6.45515 6.21299 7.49984 7.50165 7.49984C8.79035 7.49984 9.83499 6.45515 9.83499 5.1665H5.16832ZM9.83499 2.83317H5.16832L5.16826 3.99984H9.83493L9.83499 2.83317Z"
                        fill="var(--color-docuhealth-dark)"
                      />
                    </svg>
                    <p className="font-medium">
                      {" "}
                      {record?.doctor_info
                        ? `${record.doctor_info.firstname} ${record.doctor_info.lastname}`
                        : "NIL"}
                    </p>
                  </div>
                  <div className="bg-docuhealth-light-green px-2 rounded-full">
                    <p className="text-docuhealth-green ">
                      {formatRecordDate(record.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 py-1">
                  <div>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.16536 2.25V3.41667H3.9987V5.75C3.9987 7.03864 5.04337 8.08333 6.33203 8.08333C7.62067 8.08333 8.66536 7.03864 8.66536 5.75V3.41667H7.4987V2.25H9.2487C9.57087 2.25 9.83203 2.51117 9.83203 2.83333V5.75C9.83203 7.48408 8.57092 8.92362 6.91583 9.20152L6.91536 10.125C6.91536 11.2526 7.82945 12.1667 8.95703 12.1667C9.83046 12.1667 10.5758 11.6182 10.8674 10.8469C10.2569 10.5742 9.83203 9.96172 9.83203 9.25C9.83203 8.28347 10.6155 7.5 11.582 7.5C12.5486 7.5 13.332 8.28347 13.332 9.25C13.332 10.0498 12.7955 10.7243 12.0627 10.9332C11.7046 12.3137 10.4499 13.3333 8.95703 13.3333C7.1851 13.3333 5.7487 11.8969 5.7487 10.125L5.74881 9.20164C4.09342 8.92397 2.83203 7.48431 2.83203 5.75V2.83333C2.83203 2.51117 3.0932 2.25 3.41536 2.25H5.16536ZM11.582 8.66667C11.2599 8.66667 10.9987 8.92782 10.9987 9.25C10.9987 9.57217 11.2599 9.83333 11.582 9.83333C11.9042 9.83333 12.1654 9.57217 12.1654 9.25C12.1654 8.92782 11.9042 8.66667 11.582 8.66667Z"
                        fill="var(--color-docuhealth-dark)"
                      />
                    </svg>
                  </div>
                  <p className="">Medical Doctor</p>
                </div>
                <div className="flex items-center gap-1 pb-1">
                  <div>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.16536 12.1665V8.6665H9.83203V12.1665H11.582V2.83317H3.41536V12.1665H5.16536ZM6.33203 12.1665H8.66536V9.83317H6.33203V12.1665ZM12.7487 12.1665H13.9154V13.3332H1.08203V12.1665H2.2487V2.24984C2.2487 1.92767 2.50987 1.6665 2.83203 1.6665H12.1654C12.4875 1.6665 12.7487 1.92767 12.7487 2.24984V12.1665ZM6.91536 5.1665V3.99984H8.08203V5.1665H9.2487V6.33317H8.08203V7.49984H6.91536V6.33317H5.7487V5.1665H6.91536Z"
                        fill="var(--color-docuhealth-dark)"
                      />
                    </svg>
                  </div>
                  <p className="">
                    {" "}
                    {record?.hospital_info
                      ? `${record.hospital_info.name}`
                      : "NIL"}
                  </p>
                </div>
                <div className="flex items-center gap-1 pb-3 border-b ">
                  <div>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.58464 2.25016V1.0835H5.7513V2.25016H9.2513V1.0835H10.418V2.25016H12.7513C13.0735 2.25016 13.3346 2.51133 13.3346 2.8335V5.75016H12.168V3.41683H10.418V4.5835H9.2513V3.41683H5.7513V4.5835H4.58464V3.41683H2.83464V11.5835H6.33464V12.7502H2.2513C1.92914 12.7502 1.66797 12.489 1.66797 12.1668V2.8335C1.66797 2.51133 1.92914 2.25016 2.2513 2.25016H4.58464ZM10.418 7.50016C9.12933 7.50016 8.08464 8.54485 8.08464 9.8335C8.08464 11.1221 9.12933 12.1668 10.418 12.1668C11.7066 12.1668 12.7513 11.1221 12.7513 9.8335C12.7513 8.54485 11.7066 7.50016 10.418 7.50016ZM6.91797 9.8335C6.91797 7.9005 8.48498 6.3335 10.418 6.3335C12.351 6.3335 13.918 7.9005 13.918 9.8335C13.918 11.7665 12.351 13.3335 10.418 13.3335C8.48498 13.3335 6.91797 11.7665 6.91797 9.8335ZM9.83463 8.0835V10.0751L11.1722 11.4126L11.9971 10.5877L11.0013 9.59188V8.0835H9.83463Z"
                        fill="var(--color-docuhealth-dark)"
                      />
                    </svg>
                  </div>
                  <p className="">{formatFullDateTime(record.created_at)}</p>
                </div>
                <div className="py-5">
                  <p>{truncateWords(record.chief_complaint, 500)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 ">
                  <button
                    className="bg-docuhealth-dark py-2 text-white rounded-full cursor-pointer"
                    onClick={() => {
                      setSelectedMedicalRecord(record); // ✅ single record
                      setViewDetailMedicalRecord(true);
                    }}
                  >
                    <p>View details</p>
                  </button>
                  <button className="flex justify-center items-center gap-1 py-2 border border-docuhealth-dark rounded-full cursor-pointer">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.5 5H9L6 8L3 5H5.5V1.5H6.5V5ZM2 9.5H10V6H11V10C11 10.2761 10.7761 10.5 10.5 10.5H1.5C1.22386 10.5 1 10.2761 1 10V6H2V9.5Z"
                        fill="var(--color-docuhealth-dark)"
                      />
                    </svg>

                    <p>Download</p>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination2
            count={count}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </>
      ) : (
        <p className="text-center">No medical records found.</p>
      )}
    </>
  );
};

const PatientSOAPNotes = ({
  soapNotesLoading,
  patientSoapNotes,
  soapCount,
  soapCurrentPage,
  soapTotalPages,
  setSoapCurrentPage
}) => {
  console.log(patientSoapNotes);

  if (soapNotesLoading) {
    return (
      <div className="flex justify-center items-center h-full text-sm pt-10">
        Loading...
      </div>
    );
  }

  if (!patientSoapNotes || patientSoapNotes.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center  h-full">
        <svg
          width="200"
          height="200"
          viewBox="0 0 366 366"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_d_1501_46523)">
            <circle cx="183" cy="171" r="159" fill="#DBDBDB" />
          </g>
          <circle cx="183" cy="171" r="132" fill="#F6F6F6" />
          <path
            d="M183 233.5C148.482 233.5 120.5 205.518 120.5 171C120.5 136.482 148.482 108.5 183 108.5C217.518 108.5 245.5 136.482 245.5 171C245.5 205.518 217.518 233.5 183 233.5ZM183 221C210.614 221 233 198.614 233 171C233 143.386 210.614 121 183 121C155.386 121 133 143.386 133 171C133 198.614 155.386 221 183 221ZM176.75 139.75H189.25V152.25H176.75V139.75ZM176.75 164.75H189.25V202.25H176.75V164.75Z"
            fill="#929AA3"
          />
          <defs>
            <filter
              id="filter0_d_1501_46523"
              x="0"
              y="0"
              width="366"
              height="366"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="12" />
              <feGaussianBlur stdDeviation="12" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0 0.927885 0 0 0 0.15 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow_1501_46523"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow_1501_46523"
                result="shape"
              />
            </filter>
          </defs>
        </svg>

        <h2 className="font-medium pb-1">No soap notes!</h2>
        <div className="max-w-md text-center">
          <p className="text-[12px] text-gray-500">
            {" "}
            This patient does not have any soap notes
          </p>
        </div>
      </div>
    );
  }

const [seePatientDetails, setSeePatientDetails] = useState(false);
const [selectedNoteId, setSelectedNoteId] = useState(null);

  const [createAdditionalNotes, setCreateAdditionalNotes] = useState(false);
  const [noteDescription, setNoteDescription] = useState("");

  const [openPopover, setOpenPopover] = useState(null);
  const togglePopover = (index) => {
    setOpenPopover(openPopover === index ? null : index);
  };

  const selectedPatientDetails = patientSoapNotes?.find(soapNote => soapNote.id === selectedNoteId);
  const queryClient = useQueryClient()



    const { mutate, isPending } = useMutation({
      mutationFn: (payload) =>
        axiosInstanceHos.post("api/medical-records/soap-note/additional-notes", payload),
      onSuccess: () => {
        toast.success("Additional Note created successfully !");

        setCreateAdditionalNotes(false);
        setNoteDescription ('')

        const hin  = selectedPatientDetails.patient_info.hin

        queryClient.invalidateQueries({
          queryKey: ["patient-med-records", hin],
        });
        queryClient.invalidateQueries({
          queryKey: ["patient-soap-notes", hin],
        });

      },
      onError: (error) => {
        console.error("Upload error:", error);
        toast.error(
          error.response?.data?.message || "Failed to create additional note",
        );
      },
    });

  const handleCreateAdditionalNote = () => {
    if(!noteDescription) {
      toast.error('Please enter a note.')
    }

    const payload = {
      soap_note : selectedPatientDetails.id, 
      note : noteDescription
    }
    
    mutate(payload)
  }


  return (
    <div>
      {seePatientDetails ? (
        <div className="text-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-0  border-b pb-4 w-full">
            <button
              type="button"
              className="flex justify-start items-center gap-1 cursor-pointer"
              onClick={() => setSeePatientDetails(false)}
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

              <span className=" text-sm">SOAP Note Overview</span>
            </button>
            <div className=" flex flex-col sm:flex-row justify-end items-center gap-3 w-full sm:w-auto">
              <button type="button" className="flex justify-center items-center gap-1 border border-docuhealth-primary py-1.5 px-4 rounded-full w-full sm:w-auto text-docuhealth-primary cursor-pointer" onClick={() => setCreateAdditionalNotes(true)}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                    stroke="var(--color-docuhealth-primary)"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="var(--color-docuhealth-primary)"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M12 18V12"
                    stroke="var(--color-docuhealth-primary)"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M9 15H15"
                    stroke="var(--color-docuhealth-primary)"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>

                <span>Create additional notes</span>
              </button>
            </div>
          </div>
          <PatientInfoCard
            className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg"
            selectedMedicalRecord={selectedPatientDetails}
          />

          <VitalSignsCard
            className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg"
            vitalSigns={selectedPatientDetails?.vital_signs_info}
          />

          {/* Clinical Summary */}
          <ClinicalSummaryCard
            historyOfComplaint={selectedPatientDetails?.history_of_complain}
            pastMedHistory={selectedPatientDetails?.past_med_history}
            familyHistory={selectedPatientDetails?.family_history}
            socialHistory={selectedPatientDetails?.social_history}
            otherHistory={selectedPatientDetails?.other_history}
            generalExam={selectedPatientDetails?.general_exam}
            systemicExam={selectedPatientDetails?.systemic_exam}
            reviewOfSystems={selectedPatientDetails?.review}
            primaryDiagnosis={selectedPatientDetails?.primary_diagnosis}
            differentialDiagnosis={selectedPatientDetails?.differential_diagnosis}
            investigations={selectedPatientDetails?.investigations}
            bedsideTests={selectedPatientDetails?.bedside_tests}
            drugHistoryAllergies={selectedPatientDetails?.drug_history_allergies}
            problemsList={selectedPatientDetails?.problems_list}
            patientEducation={selectedPatientDetails?.patient_education}
            additionalNotes={selectedPatientDetails?.additional_notes}
          />

          {/* 6. Uploaded Documents / Images */}
          <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
            <p className="font-medium mb-4 text-docuhealth-dark">
              Uploaded Documents / Images
            </p>
            <div>
              {selectedPatientDetails?.investigation_docs?.length > 0 ? (
                selectedPatientDetails.investigation_docs.map(
                  (attachment, index) => {
                    // Correctly mapping your payload fields
                    const fileName =
                      attachment.filename || `Document_${index + 1}`;
                    const fileUrl = attachment.file || attachment.url; // Supporting both common keys
                    const fileSizeMB = attachment.size
                      ? (attachment.size / (1024 * 1024)).toFixed(1) + " MB"
                      : "0.5 MB"; // Fallback placeholder if size is missing
                    const fileDate = formatFullDateTime(
                      selectedPatientDetails.created_at,
                    );

                    const isImage =
                      /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) ||
                      attachment.file_type?.includes("image");
                    const isPdf =
                      /\.pdf$/i.test(fileName) ||
                      attachment.file_type?.includes("pdf");
                    const Icon = isImage ? Image : isPdf ? FileText : FileText;

                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row justify-between items-start gap-5 sm:gap-0 sm:items-center bg-white border rounded-lg px-4 py-3 mb-3 "
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-[12px]">
                          <div className="p-2 bg-docuhealth-primary/10 rounded-md">
                            <Icon className="text-docuhealth-primary" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {fileName}
                            </p>
                            <p className="text-gray-500">
                              {fileDate} • {fileSizeMB}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 text-[12px] w-full sm:w-auto">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1 border border-docuhealth-primary text-docuhealth-primary rounded-full font-medium hover:bg-blue-50 transition py-1 px-3 w-full sm:w-28"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </a>
                          <a
                            href={fileUrl}
                            download
                            className="flex items-center justify-center gap-1 bg-docuhealth-primary text-white rounded-full font-medium hover:bg-docuhealth-dark-primary transition py-1 px-3 w-full sm:w-28"
                          >
                            <ArrowDownToLine className="w-3 h-3" />
                            Download
                          </a>
                        </div>
                      </div>
                    );
                  },
                )
              ) : (
                <p className="text-[12px] text-gray-500">NIL</p>
              )}
            </div>
          </div>

          {/* Drug Records */}
          {renderDrugRecords(selectedPatientDetails?.drug_orders_info || selectedPatientDetails?.drug_records)}

          {/* Care Instructions */}
          <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
            <p className="font-medium mb-4 text-docuhealth-dark">Care Instructions</p>
            <div className="text-[12px] text-gray-700">
              {renderListOrString(selectedPatientDetails?.care_instructions)}
            </div>
          </div>

          {/* Treatment Plan */}
          <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
            <p className="font-medium mb-4 text-docuhealth-dark">Treatment Plan</p>
            <div className="text-[12px] text-gray-700">
              {renderListOrString(selectedPatientDetails?.treatment_plan)}
            </div>
          </div>

          {renderLabTests(selectedPatientDetails?.lab_tests_info)}

          {/* 7. Follow Up / Appointment — appointment_info was removed from
              the SOAP note response; only render this if it's actually
              present (older notes created before the check-in migration). */}
          {selectedPatientDetails?.appointment_info && (
            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
              <p className="font-medium mb-4 text-docuhealth-dark">
                Follow Up / Appointment
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p className="text-[12px] text-gray-500">
                  Type:{" "}
                  <span className="font-medium text-gray-900 capitalize">
                    {selectedPatientDetails.appointment_info.type || "NIL"}
                  </span>
                </p>
                <p className="text-[12px] text-gray-500">
                  Scheduled:{" "}
                  <span className="font-medium text-gray-900">
                    {selectedPatientDetails.appointment_info.scheduled_time
                      ? formatFullDateTime(
                        selectedPatientDetails.appointment_info.scheduled_time,
                      )
                      : "NIL"}
                  </span>
                </p>
                {selectedPatientDetails.appointment_info.note && (
                  <p className="text-[12px] text-gray-500 col-span-2 mt-1">
                    Note:{" "}
                    <span className="font-medium text-gray-900 italic">
                      "{selectedPatientDetails.appointment_info.note}"
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 8. Referral Status */}
          <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
            <p className="font-medium mb-4 text-docuhealth-dark">
              Referral Information
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-[12px] text-gray-500">Referral Status:</p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${selectedPatientDetails?.referred_hosp ||
                    selectedPatientDetails?.referred_docuhealth_hosp
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                    }`}
                >
                  {selectedPatientDetails?.referred_hosp ||
                    selectedPatientDetails?.referred_docuhealth_hosp
                    ? "Active"
                    : "None"}
                </span>
              </div>

              <p className="text-[12px] text-gray-500">
                Referred Hospital:{" "}
                <span className="font-medium text-gray-900">
                  {selectedPatientDetails?.referred_docuhealth_hosp
                    ? `${selectedPatientDetails.referred_docuhealth_hosp} (DocuHealth Provider)`
                    : selectedPatientDetails?.referred_hosp || "NIL"}
                </span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {Array.isArray(patientSoapNotes) && patientSoapNotes.length > 0 ? (
            <>
              <div className="text-[12px] my-4">
                <div className="hidden lg:block">
                  {patientSoapNotes.map((soapNote, index) => (
                    <div
                      key={soapNote.id}
                      className="mb-4 p-4 border rounded-md flex flex-wrap gap-4 lg:gap-10 "
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-md">
                          <CalendarIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-semibold">
                            Date / Time
                          </p>
                          <p className="text-sm font-medium">
                            {formatFullDate(soapNote?.created_at)} /{" "}
                            {formatTime(soapNote?.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-md">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-semibold">
                            Patient
                          </p>
                          <p className="text-sm font-medium">
                            {soapNote?.patient_info?.firstname}{" "}
                            {soapNote?.patient_info?.lastname}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-md">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-semibold">
                            Appointed Doctor
                          </p>
                          <p className="text-sm font-medium">
                            Dr. {soapNote?.staff_info?.firstname}{" "}
                            {soapNote?.staff_info?.lastname}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between relative flex-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-md">
                            <FileText className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-semibold">
                              Chief Complaint
                            </p>
                            <p className="text-sm font-medium truncate max-w-[150px]">
                              {soapNote?.chief_complaint || "NIL"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          aria-label="SOAP note actions"
                          aria-haspopup="true"
                          aria-expanded={openPopover === index}
                          onClick={() => {
                            togglePopover(index);
                          setSelectedNoteId(soapNote.id);
                          }}
                          className={` hidden h-8 w-9 lg:flex justify-center items-center rounded-full cursor-pointer
        ${openPopover === index ? "bg-slate-300" : "hover:bg-gray-200"}
    `}
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                          </svg>
                        </button>

                        {openPopover === index && (
                          <div className="absolute top-10 right-0 mt-2 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
                            <button
                              type="button"
                              className="w-full text-left text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                              onClick={() => {
                                setSelectedNoteId(soapNote.id);
                                setSeePatientDetails(true);
                                setOpenPopover(null);
                              }}
                            >
                              See full SOAP Note
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="block lg:hidden space-y-4 px-1">
                {patientSoapNotes.map((soapNote, index) => (
                  <div
                    key={soapNote.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          Scheduled
                        </p>
                        <p className="text-sm font-medium">
                          {formatFullDate(soapNote?.created_at)} /{" "}
                          {formatTime(soapNote?.created_at)}
                        </p>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => {
                            togglePopover(index);
                      setSelectedNoteId(soapNote.id);
                          }}
                          className={`h-9 w-9 flex items-center justify-center rounded-full ${openPopover === index ? "bg-slate-200" : "bg-gray-50"}`}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M14 8C14 7.45 13.55 7 13 7C12.45 7 12 7.45 12 8C12 8.55 12.45 9 13 9C13.55 9 14 8.55 14 8ZM4 8C4 7.45 3.55 7 3 7C2.45 7 2 7.45 2 8C2 8.55 2.45 9 3 9C3.55 9 4 8.55 4 8ZM9 8C9 7.45 8.55 7 8 7C7.45 7 7 7.45 7 8C7 8.55 7.45 9 8 9C8.55 9 9 8.55 9 8Z"
                              fill="#1A263E"
                            />
                          </svg>
                        </button>
                        {openPopover === index && (
                          <div className="absolute top-10 right-0 mt-2 bg-white border shadow-sm rounded-xs p-2 w-52 z-30">
                            <button
                              type="button"
                              className="w-full text-left text-[12px] text-gray-700 hover:bg-gray-200 p-2 rounded-sm cursor-pointer"
                              onClick={() => {
                          setSelectedNoteId(soapNote.id);
                                setSeePatientDetails(true);
                                setOpenPopover(null);
                              }}
                            >
                              See full SOAP Note
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-100">
                          {soapNote?.patient_info?.firstname[0]}
                          {soapNote?.patient_info?.lastname[0]}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">
                            Patient
                          </p>
                          <p className="text-sm font-semibold text-slate-800">
                            {soapNote?.patient_info?.firstname}{" "}
                            {soapNote?.patient_info?.lastname}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">
                            {soapNote?.staff_info?.role}
                          </p>
                          <p className="text-[13px] text-slate-600">
                            Dr. {soapNote?.staff_info?.firstname}{" "}
                            {soapNote?.staff_info?.lastname}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">
                            Chief Complaint
                          </p>
                          <p className="text-[13px] text-slate-600 truncate italic">
                            " {soapNote?.chief_complaint || "NIL"}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination2
                count={soapCount}
                currentPage={soapCurrentPage}
                totalPages={soapTotalPages}
                setCurrentPage={setSoapCurrentPage}
              />
            </>
          ) : (
            <p className="text-center">No soap notes found.</p>
          )}
        </>
      )}

      {createAdditionalNotes && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 text-sm">
            <div className="bg-white rounded-xs shadow-lg p-6 max-w-md w-full relative max-h-[80vh] overflow-y-auto mx-3">
              <div className="flex justify-between items-center gap-2 pb-4">
                <div className="flex justify-center items-center">
                  <p className="font-medium text-sm">
                    Create Additional Notes
                  </p>
                </div>
                <div>
                  <i
                    class="bx bx-x text-xl cursor-pointer"
                    onClick={() => {
                      setCreateAdditionalNotes(false);
                    }}
                  ></i>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-600 mb-1">
                  Note Description
                </label>
                <textarea
                  rows="5"
                  className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-docuhealth-primary focus:border-docuhealth-primary resize-none transition-all placeholder:text-gray-400"
                  placeholder="Enter patient observations, medical history updates, or specific care instructions..."
                  value={noteDescription} // Ensure you have this state defined
                  onChange={(e) => setNoteDescription(e.target.value)}
                ></textarea>

                <div className="flex justify-end mt-1">
                  <p className="text-[10px] text-gray-400">
                    {noteDescription?.length || 0} characters
                  </p>
                </div>

                <button
                  className={`w-full mt-4 ${isPending ? 'border border-gray-400 bg-gray-400 text-white cursor-not-allowed' : 'bg-docuhealth-primary text-white '} py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors`}
                  onClick={handleCreateAdditionalNote}
                  disabled={isPending}
                >
                   {isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Note...
                  </div>
                ) : (
                  "Save Note"
                )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const getTabs = ({
  medloading,
  soapNotesLoading,
  patientMedRecords,
  patientFullInfo,
  count,
  currentPage,
  totalPages,
  setCurrentPage, // Use the setter here
  setSelectedMedicalRecord,
  setViewDetailMedicalRecord,
  patientSoapNotes,
  soapCount,
  soapCurrentPage,
  soapTotalPages,
  setSoapCurrentPage,
}) => [
    {
      title: "Patient Info",
      content: <PatientInfo patientFullInfo={patientFullInfo} />,
    },
    {
      title: "Med Records",
      content: (
        <PatientMedicalRecord
          medloading={medloading}
          patientMedRecords={patientMedRecords}
          count={count}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          setSelectedMedicalRecord={setSelectedMedicalRecord}
          setViewDetailMedicalRecord={setViewDetailMedicalRecord}
        />
      ),
    },
    {
      title: "SOAP Notes",
      content: (
        <PatientSOAPNotes
          soapNotesLoading={soapNotesLoading}
          patientSoapNotes={patientSoapNotes}
          soapCount={soapCount}
          soapCurrentPage={soapCurrentPage}
          soapTotalPages={soapTotalPages}
          setSoapCurrentPage={setSoapCurrentPage}
        />
      ),
    },
  ];

export default getTabs;
