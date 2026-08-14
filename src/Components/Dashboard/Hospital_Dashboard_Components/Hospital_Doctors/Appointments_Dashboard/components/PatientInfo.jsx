import React, { useState } from "react";
import PropTypes from "prop-types";
import { ArrowLeft, X } from "lucide-react";
import TabComponent from "./TabComponent";
import getTabs from "./TabDetails";
import { Image, FileText, Eye, ArrowDownToLine } from "lucide-react";
import formatRecordDate, {
  formatFullDateTime,
  getAge,
} from "../../../../Patient_Dashboard_Components/Home_Dashboard/Components/formatRecordDate";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchTestCategories, fetchLabTests } from "../../../../../../queries/Hospital/lab/requests";
import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import toast from "react-hot-toast";
import { renderListOrString, renderLabTests, renderDrugRecords } from "../../../../../../utils/soapNoteHelpers";

const DUMMY_PATIENT_INFO = {
  patient_info: {
    firstname: "Amiefa",
    lastname: "Obed",
    dob: "1990-05-14",
    email: "amiefa.obed@email.com",
    phone_num: "+234 801 234 5678",
    street: "12 Bode Thomas Street",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    plan_type: "HMO",
  },
};

const PatientInfo = ({ selectedPatientDetails, setSeePatientDetails, hideCreateOrder }) => {
  const [viewDetailMedicalRecord, setViewDetailMedicalRecord] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [soapCurrentPage, setSoapCurrentPage] = useState(1);

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isTestTypeDropdownOpen, setIsTestTypeDropdownOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({ category: "", test_type: [], note: "", ignore_duplicate_warning: false });
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const hin = selectedPatientDetails?.patient?.hin || selectedPatientDetails?.patient_hin;
  const pageSize = 6;

  const { data: patientFullInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ["patient-info", hin],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(`api/doctors/patient/info/${hin}`);
      return res.data;
    },
    enabled: !!hin,
    onError: () => toast.error("Error fetching patient's details"),
  });

  const { data: medRecordsData, isLoading: medLoading } = useQuery({
    queryKey: ["patient-med-records", hin, currentPage],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/doctors/patient/records/${hin}?page=${currentPage}&size=${pageSize}`
      );
      return res.data;
    },
    enabled: !!hin,
    keepPreviousData: true,
  });

  const { data: soapNotesData, isLoading: soapLoading } = useQuery({
    queryKey: ["patient-soap-notes", hin, soapCurrentPage],
    queryFn: async () => {
      const res = await axiosInstanceHos.get(
        `api/medical-records/soap-note/${hin}?page=${soapCurrentPage}&size=${pageSize}`
      );
      return res.data;
    },
    enabled: !!hin,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["lab-test-categories"],
    queryFn: fetchTestCategories,
    staleTime: Infinity,
    enabled: showOrderModal,
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.results ?? []);

  const { data: testTypesData, isLoading: isTestTypesLoading } = useQuery({
    queryKey: ["lab-tests", orderForm.category],
    queryFn: fetchLabTests,
    enabled: !!orderForm.category,
    staleTime: Infinity,
  });
  const fetchedTestTypes = Array.isArray(testTypesData) ? testTypesData : (testTypesData?.results ?? []);

  const { mutate: createOrder, isPending: isOrderPending } = useMutation({
    mutationFn: (payload) => {
      const requestPayload = {
        patient: selectedPatientDetails?.patient?.hin || selectedPatientDetails?.patient_hin,
        order_source: "staff_appointment_order",
        items: payload.test_type.map((testSqid) => ({
          test: testSqid,
          note: payload.note,
        })),
      };
      if (selectedPatientDetails?.sqid) {
        requestPayload.appointment = selectedPatientDetails.sqid;
      }
      if (payload.ignore_duplicate_warning) {
        requestPayload.ignore_duplicate_warning = true;
      }
      return axiosInstanceHos.post("api/lab/test-orders/create", requestPayload);
    },
    onSuccess: () => {
      setShowOrderModal(false);
      setOrderForm({ category: "", test_type: [], note: "", ignore_duplicate_warning: false });
      setDuplicateWarning(null);
      setShowSuccessModal(true);
    },
    onError: (err) => {
      if (err.response?.status === 400 && err.response?.data?.duplicate_warning) {
        setDuplicateWarning(err.response.data.duplicate_warning);
      } else {
        toast.error(err.response?.data?.message || "Failed to create order.");
      }
    },
  });

  const handleCreateOrder = () => {
    if (!orderForm.category || orderForm.test_type.length === 0) {
      toast.error("Please select a category and at least one test type.");
      return;
    }
    createOrder({ ...orderForm, ignore_duplicate_warning: false });
  };

  const handleOverrideSubmit = () => {
    createOrder({ ...orderForm, ignore_duplicate_warning: true });
  };

  return (
    <>
      {viewDetailMedicalRecord ? (
        <>
          <div className="bg-white my-5 border rounded-2xl pt-8 px-6 text-sm ">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-0  border-b pb-4 w-full">
              <div
                className="flex justify-start items-center gap-1 cursor-pointer"
                onClick={() => setViewDetailMedicalRecord(false)}
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

                <h2 className=" text-sm">After Visit Summary Overview</h2>
              </div>
              <div className=" flex flex-col sm:flex-row justify-end items-center gap-3 w-full sm:w-auto">
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
              </div>
            </div>

            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
              <p className="text-[12px] mb-4">
                {" "}
                Patient's name :{" "}
                <span className="font-medium text-sm">
                  {" "}
                  {selectedMedicalRecord?.patient_info.firstname}{" "}
                  {selectedMedicalRecord?.patient_info.lastname}
                </span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="">
                  <p className="text-[12px]">
                    {" "}
                    Patient's HIN :{" "}
                    <span className="font-medium ">
                      {" "}
                      {selectedMedicalRecord?.patient_info?.hin ||
                        selectedMedicalRecord?.subaccount}
                    </span>
                  </p>
                  <p className="text-[12px]">
                    {" "}
                    Patient's Age :{" "}
                    <span className="font-medium ">
                      {" "}
                      {getAge(selectedMedicalRecord?.patient_info?.dob) ||
                        "30 years old"}
                    </span>
                  </p>
                  <p className="text-[12px]">
                    {" "}
                    Patient's Gender :{" "}
                    <span className="font-medium ">
                      {" "}
                      {selectedMedicalRecord?.patient_info?.gender || "Male"}
                    </span>
                  </p>
                </div>
                <div className="">
                  <p className="text-[12px]">
                    {" "}
                    Patient's Doctor :{" "}
                    <span className="font-medium ">
                      {" "}
                      {selectedMedicalRecord?.staff_info 
                        ? `Dr. ${selectedMedicalRecord.staff_info.firstname} ${selectedMedicalRecord.staff_info.lastname}`
                        : selectedMedicalRecord?.doctor_info
                          ? `Dr. ${selectedMedicalRecord.doctor_info.firstname} ${selectedMedicalRecord.doctor_info.lastname}`
                          : "NIL"}
                    </span>
                  </p>
                  <p className="text-[12px]">
                    {" "}
                    Specialisation :{" "}
                    <span className="font-medium">
                      {" "}
                      {selectedMedicalRecord?.staff_info?.specialization ||
                        selectedMedicalRecord?.doctor_info?.specialization ||
                        "NIL"}
                    </span>
                  </p>
                </div>
                <div className="">
                  <p className="text-[12px]">
                    {" "}
                    Hospital :{" "}
                    <span className="font-medium ">
                      {" "}
                      {selectedMedicalRecord?.hospital_info?.name ||
                        "Test Clinic"}
                    </span>
                  </p>
                  <p className="text-[12px]">
                    {" "}
                    Hospital's Email :{" "}
                    <span className="font-medium ">
                      {" "}
                      {selectedMedicalRecord?.hospital_info?.email ||
                        "TestClinic@gmail.com"}
                    </span>
                  </p>
                </div>
                <div className="">
                  <p className="text-[12px]">
                    {" "}
                    Status :{" "}
                    <span className="font-medium ">
                      {" "}
                      {formatRecordDate(selectedMedicalRecord.created_at)}
                    </span>
                  </p>
                  <p className="text-[12px]">
                    {" "}
                    Date / Time Uploaded :{" "}
                    <span className="font-medium ">
                      {" "}
                      {formatFullDateTime(selectedMedicalRecord.created_at)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl ">
              <p className="font-medium mb-4"> Vital Signs</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[12px]">
                <div className=" bg-white border rounded-md p-3">
                  <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.1874 2.81468C13.7081 3.33538 13.7081 4.1796 13.1874 4.7003L11.3018 6.58591L9.41615 4.7003L11.3018 2.81468C11.8225 2.29398 12.6667 2.29398 13.1874 2.81468ZM14.1302 1.87187C13.0888 0.83047 11.4004 0.83047 10.359 1.87187L8.47335 3.75748L8.23762 3.52201C7.97728 3.26166 7.55522 3.26166 7.29482 3.52201C7.03448 3.78236 7.03448 4.20446 7.29482 4.46482L7.53055 4.70054L3.38742 8.84364C3.01516 9.21591 2.76141 9.69004 2.65816 10.2063L2.42427 11.3758C2.37265 11.6338 2.24578 11.8709 2.05964 12.057L1.40229 12.7144C1.14194 12.9748 1.14194 13.3969 1.40229 13.6572L2.3451 14.6C2.60545 14.8604 3.02756 14.8604 3.28791 14.6L3.94526 13.9427C4.13139 13.7566 4.36846 13.6297 4.62658 13.578L5.79602 13.3442C6.31226 13.2409 6.78642 12.9872 7.15868 12.6149L11.3018 8.47178L11.5375 8.70744C11.7978 8.96778 12.22 8.96778 12.4803 8.70744C12.7406 8.44711 12.7406 8.02498 12.4803 7.76464L12.2446 7.52898L14.1302 5.6431C15.1716 4.6017 15.1716 2.91326 14.1302 1.87187ZM8.47335 5.64335L10.359 7.52898L6.21585 11.6721C6.02972 11.8582 5.79265 11.9851 5.53453 12.0367L4.36509 12.2706C3.84885 12.3738 3.37472 12.6276 3.00245 12.9999C3.37472 12.6276 3.62846 12.1535 3.73171 11.6372L3.9656 10.4678C4.01722 10.2097 4.1441 9.97264 4.33023 9.78651L8.47335 5.64335Z"
                        fill="var(--color-docuhealth-primary)"
                      />
                    </svg>
                    Blood Pressure
                  </p>
                  <p className="font-medium">
                    {(selectedMedicalRecord?.vital_signs?.blood_pressure || selectedMedicalRecord?.vital_signs_info?.blood_pressure || 'NIL')} mmHg
                  </p>
                </div>
                <div className=" bg-white border rounded-md p-3">
                  <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.33203 3.33317C5.33203 1.86041 6.52594 0.666504 7.9987 0.666504C9.47143 0.666504 10.6654 1.86041 10.6654 3.33317V6.8363C11.8744 7.67957 12.6654 9.0807 12.6654 10.6665C12.6654 13.2438 10.576 15.3332 7.9987 15.3332C5.42137 15.3332 3.33203 13.2438 3.33203 10.6665C3.33203 9.0807 4.12304 7.67957 5.33203 6.8363V3.33317ZM6.09483 7.9299C5.20498 8.55057 4.66536 9.56197 4.66536 10.6665C4.66536 12.5074 6.15775 13.9998 7.9987 13.9998C9.83963 13.9998 11.332 12.5074 11.332 10.6665C11.332 9.56197 10.7924 8.55057 9.90256 7.9299L9.33203 7.5319V3.33317C9.33203 2.59679 8.7351 1.99984 7.9987 1.99984C7.2623 1.99984 6.66536 2.59679 6.66536 3.33317V7.5319L6.09483 7.9299ZM5.33203 10.6665H10.6654C10.6654 12.1392 9.47143 13.3332 7.9987 13.3332C6.52594 13.3332 5.33203 12.1392 5.33203 10.6665Z"
                        fill="var(--color-docuhealth-primary)"
                      />
                    </svg>
                    Temperature
                  </p>
                  <p className="font-medium">
                    {(selectedMedicalRecord?.vital_signs?.temp || selectedMedicalRecord?.vital_signs_info?.temp || 'NIL')} °C
                  </p>
                </div>
                <div className=" bg-white border rounded-md p-3">
                  <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.0013 2C13.0264 2 14.668 3.66667 14.668 6C14.668 10.6667 9.66797 13.3333 8.0013 14.3333C6.68304 13.5423 3.2793 11.7087 1.91393 8.66733L0.667969 8.66667V7.33333L1.47494 7.33393C1.38414 6.90887 1.33464 6.46434 1.33464 6C1.33464 3.66667 3.0013 2 5.0013 2C6.24128 2 7.33464 2.66667 8.0013 3.33333C8.66797 2.66667 9.7613 2 11.0013 2ZM11.0013 3.33333C10.284 3.33333 9.5075 3.71274 8.9441 4.27614L8.0013 5.21895L7.0585 4.27614C6.49509 3.71274 5.71857 3.33333 5.0013 3.33333C3.70734 3.33333 2.66797 4.43767 2.66797 6C2.66797 6.45695 2.7282 6.90107 2.84569 7.3336L4.29051 7.33333L5.66797 5.03757L7.66797 8.37087L8.2905 7.33333H11.3346V8.66667H9.04544L7.66797 10.9625L5.66797 7.62913L5.04543 8.66667L3.40656 8.66707C3.93282 9.58247 4.73 10.4454 5.76473 11.2686C6.26131 11.6637 6.79097 12.0323 7.3787 12.4025C7.5777 12.5279 7.77537 12.6486 8.0013 12.7835C8.22724 12.6486 8.4249 12.5279 8.6239 12.4025C9.21164 12.0323 9.7413 11.6637 10.2379 11.2686C12.2238 9.68867 13.3346 7.96233 13.3346 6C13.3346 4.42717 12.31 3.33333 11.0013 3.33333Z"
                        fill="var(--color-docuhealth-primary)"
                      />
                    </svg>
                    Weight
                  </p>
                  <p className="font-medium">
                    {(selectedMedicalRecord?.vital_signs?.weight || selectedMedicalRecord?.vital_signs_info?.weight || 'NIL')} Kg
                  </p>
                </div>
                <div className=" bg-white border rounded-md p-3">
                  <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.4938 3.17157C15.0022 4.68315 15.054 7.09133 13.6511 8.662L7.99863 14.3233L2.34628 8.662C0.943397 7.09133 0.995837 4.67934 2.5036 3.17157C4.01308 1.6621 6.42882 1.61125 7.99936 3.01902C9.56536 1.61333 11.9854 1.66 13.4938 3.17157ZM3.44641 4.11438C2.45325 5.10754 2.40339 6.6982 3.31865 7.7488L7.99863 12.4362L12.6788 7.7488C13.5944 6.6978 13.5447 5.11017 12.55 4.1134C11.5585 3.11986 9.96256 3.07204 8.9149 3.98917L6.11308 6.79127L5.17027 5.84843L7.05336 3.964L6.99883 3.91801C5.949 3.07465 4.41418 3.14662 3.44641 4.11438Z"
                        fill="var(--color-docuhealth-primary)"
                      />
                    </svg>
                    Respiratory rate
                  </p>
                  <p className="font-medium">
                    {(selectedMedicalRecord?.vital_signs?.resp_rate || selectedMedicalRecord?.vital_signs_info?.resp_rate || 'NIL')} / min
                  </p>
                </div>
                <div className=" bg-white border rounded-md p-3">
                  <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.0013 2C13.0264 2 14.668 3.66667 14.668 6C14.668 10.6667 9.66797 13.3333 8.0013 14.3333C6.68304 13.5423 3.2793 11.7087 1.91393 8.66733L0.667969 8.66667V7.33333L1.47494 7.33393C1.38414 6.90887 1.33464 6.46434 1.33464 6C1.33464 3.66667 3.0013 2 5.0013 2C6.24128 2 7.33464 2.66667 8.0013 3.33333C8.66797 2.66667 9.7613 2 11.0013 2ZM11.0013 3.33333C10.284 3.33333 9.5075 3.71274 8.9441 4.27614L8.0013 5.21895L7.0585 4.27614C6.49509 3.71274 5.71857 3.33333 5.0013 3.33333C3.70734 3.33333 2.66797 4.43767 2.66797 6C2.66797 6.45695 2.7282 6.90107 2.84569 7.3336L4.29051 7.33333L5.66797 5.03757L7.66797 8.37087L8.2905 7.33333H11.3346V8.66667H9.04544L7.66797 10.9625L5.66797 7.62913L5.04543 8.66667L3.40656 8.66707C3.93282 9.58247 4.73 10.4454 5.76473 11.2686C6.26131 11.6637 6.79097 12.0323 7.3787 12.4025C7.5777 12.5279 7.77537 12.6486 8.0013 12.7835C8.22724 12.6486 8.4249 12.5279 8.6239 12.4025C9.21164 12.0323 9.7413 11.6637 10.2379 11.2686C12.2238 9.68867 13.3346 7.96233 13.3346 6C13.3346 4.42717 12.31 3.33333 11.0013 3.33333Z"
                        fill="var(--color-docuhealth-primary)"
                      />
                    </svg>
                    Heart rate
                  </p>
                  <p className="font-medium">
                    {(selectedMedicalRecord?.vital_signs?.heart_rate || selectedMedicalRecord?.vital_signs_info?.heart_rate || 'NIL')} bpm
                  </p>
                </div>
                <div className=" bg-white border rounded-md p-3">
                  <p className="text-[12px] text-gray-400 flex items-center gap-1 pb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.3333 12.6667H12.6667V9.33333H6.66667V3.33333H3.33333V4.66667H4.66667V6H3.33333V7.33333H5.33333V8.66667H3.33333V10H4.66667V11.3333H3.33333V12.6667H4.66667V11.3333H6V12.6667H7.33333V10.6667H8.66667V12.6667H10V11.3333H11.3333V12.6667ZM8 8H13.3333C13.7015 8 14 8.29847 14 8.66667V13.3333C14 13.7015 13.7015 14 13.3333 14H2.66667C2.29848 14 2 13.7015 2 13.3333V2.66667C2 2.29848 2.29848 2 2.66667 2H7.33333C7.70153 2 8 2.29848 8 2.66667V8Z"
                        fill="var(--color-docuhealth-primary)"
                      />
                    </svg>
                    Height
                  </p>
                  <p className="font-medium">
                    {(selectedMedicalRecord?.vital_signs?.height || selectedMedicalRecord?.vital_signs_info?.height || 'NIL')} m
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
              <p className="font-medium mb-4">Clinical Summary</p>
              <div className="pb-1">
                <p className="text-[12px]">
                  {" "}
                  Chief complaint :{" "}
                  <span className="font-medium ">
                    {" "}
                    {selectedMedicalRecord.chief_complaint || "NIL"}
                  </span>
                </p>
              </div>
              <div className="text-[12px] pb-1">
                <p>History summary :</p>
                <ul className="list-disc list-outside pl-5 font-medium">
                  {(selectedMedicalRecord?.history || []).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="text-[12px] pb-1">
                <p>Diagnosis:</p>
                <ul className="list-disc list-outside pl-5 font-medium">
                  {(selectedMedicalRecord?.diagnosis || []).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="text-[12px] pb-1">
                <p>Treatment plan:</p>
                <ul className="list-disc list-outside pl-5 font-medium">
                  {(selectedMedicalRecord?.treatment_plan || []).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="text-[12px] pb-1">
                <p>Care instructions:</p>
                <ul className="list-disc list-outside pl-5 font-medium">
                  {(selectedMedicalRecord?.care_instructions || []).map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    ),
                  )}
                </ul>
              </div>
              <div className="text-[12px] pb-1">
                <p>Physical examinations:</p>
                <ul className="list-disc list-outside pl-5 font-medium">
                  {(selectedMedicalRecord?.physical_exam || []).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="text-[12px] ">
                {renderDrugRecords(selectedMedicalRecord?.drug_orders_info || selectedMedicalRecord?.drug_records)}
              </div>
              <div className="text-[12px] pb-1 mt-6">
                {renderLabTests(selectedMedicalRecord?.lab_tests_info || selectedMedicalRecord?.lab_tests)}
              </div>
            </div>
            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
              <p className="font-medium mb-4">Uploaded Documents / Images</p>
              <div>
                {(selectedMedicalRecord?.investigation_docs || selectedMedicalRecord?.attachments)?.length > 0 ? (
                  (selectedMedicalRecord?.investigation_docs || selectedMedicalRecord?.attachments).map((attachment, index) => {
                    const fileName =
                      attachment.filename || `Document_${index + 1}`;
                    const fileUrl = attachment.file || attachment.url; // Supporting both common keys
                    const fileSizeMB = attachment.size
                      ? (attachment.size / (1024 * 1024)).toFixed(1) + " MB"
                      : "0.5 MB"; // Fallback placeholder if size is missing
                    const fileDate = formatFullDateTime(
                      selectedMedicalRecord?.created_at,
                    );

                    // Determine file type
                    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
                      fileName,
                    );
                    const isPdf = /\.pdf$/i.test(fileName);
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
                              {fileDate}{fileDate && fileSizeMB ? " • " : ""}{fileSizeMB}
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
                  })
                ) : (
                  <p className="text-[12px] text-gray-500">NIL</p>
                )}
              </div>
            </div>

            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
              <p className="font-medium mb-4">Follow Up / Appointment</p>
              <div className="pb-1">
                <p className="text-[12px]">
                  {" "}
                  Status :{" "}
                  <span className="font-medium ">
                    {" "}
                    {formatRecordDate(
                      selectedMedicalRecord?.appointment?.scheduled_time,
                    ) || "NIL"}
                  </span>
                </p>
                <p className="text-[12px]">
                  {" "}
                  Date / Time :{" "}
                  <span className="font-medium ">
                    {" "}
                    {formatFullDateTime(
                      selectedMedicalRecord?.appointment?.scheduled_time,
                    ) || "NIL"}
                  </span>
                </p>
              </div>
            </div>
            <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-xl">
              <p className="font-medium mb-4">Referral :</p>
              <div className="pb-1">
                <p className="text-[12px]">
                  Status:{" "}
                  <span className="font-medium">
                    {selectedMedicalRecord?.referred_docuhealth_hosp ||
                    selectedMedicalRecord?.referred_hosp
                      ? "True"
                      : "False"}
                  </span>
                </p>

                <p className="text-[12px]">
                  Referred Hospital:{" "}
                  <span className="font-medium">
                    {selectedMedicalRecord?.referred_docuhealth_hosp
                      ? `${selectedMedicalRecord.referred_docuhealth_hosp} (DocuHealth)`
                      : selectedMedicalRecord?.referred_hosp || "NIL"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-white rounded-xl border mt-3 p-5 text-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-4 sm:gap-0">
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => setSeePatientDetails(false)}
              >
                <ArrowLeft className="w-4 h-4 text-gray-800" />
                <p>Patient details</p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                {/* <p className="text-sm font-medium text-gray-800">
                  Status:{" "}
                  <span className="text-amber-500 capitalize">
                    {selectedPatientDetails?.status || "Pending"}
                  </span>
                </p> */}
                {!hideCreateOrder && (
                  <button
                    onClick={() => setShowOrderModal(true)}
                    className="w-full sm:w-auto border border-docuhealth-primary text-docuhealth-primary text-sm rounded-full px-5 py-1.5 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Create a test order
                  </button>
                )}
              </div>
            </div>

            {loadingInfo ? (
              <div className="flex justify-center items-center gap-3 px-2 py-3">
                <p className="text-sm text-gray-500 pt-2">Loading patient data...</p>
              </div>
            ) : (
              <>
                <div className="py-5 border-b">
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-full bg-docuhealth-border-light flex items-center justify-center text-xl text-black shrink-0">
                      {`${patientFullInfo?.patient_info?.firstname?.[0] ?? ""}${patientFullInfo?.patient_info?.lastname?.[0] ?? ""}`.toUpperCase()}
                    </div>

                    <div className="flex flex-col items-start ml-3">
                      <p className="text-[16px] font-medium text-docuhealth-dark">
                        {patientFullInfo?.patient_info?.firstname}{" "}
                        {patientFullInfo?.patient_info?.lastname}
                      </p>
                      <p className="text-[14px] text-gray-500">
                        {patientFullInfo?.patient_info?.plan_type
                          ? `${patientFullInfo.patient_info.plan_type} patient`
                          : "patient"}
                      </p>
                    </div>
                  </div>
                </div>

            <div>
              <TabComponent
                tabs={getTabs({
                  medloading: medLoading,
                  soapNotesLoading: soapLoading,
                  patientMedRecords: medRecordsData?.results || [],
                  patientSoapNotes: soapNotesData?.results || [],
                  patientFullInfo,

                  count: medRecordsData?.count || 0,
                  currentPage,
                  totalPages: Math.ceil(
                    (medRecordsData?.count || 0) / pageSize,
                  ),

                  setCurrentPage,

                  soapCount: soapNotesData?.count || 0,
                  soapCurrentPage,
                  soapTotalPages: Math.ceil(
                    (soapNotesData?.count || 0) / pageSize,
                  ),

                  setSoapCurrentPage,

                  setSelectedMedicalRecord,
                  setViewDetailMedicalRecord,
                })}
              />
            </div>
            </>
            )}
          </div>
        </>
      )}

      {/* ── Create an Order Modal ── */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col gap-6">

            {/* Header */}
            <div className="relative flex items-start justify-center">
              <div className="text-center">
                <h3 className="text-[20px] font-semibold text-docuhealth-dark">Order Lab test</h3>
                <p className="text-sm text-gray-500 mt-1">Kindly order a lab test</p>
              </div>
              <button
                onClick={() => { setShowOrderModal(false); setOrderForm({ category: "", test_type: [], note: "", ignore_duplicate_warning: false }); setIsTestTypeDropdownOpen(false); setDuplicateWarning(null); }}
                className="absolute right-0 top-0 text-gray-800 hover:text-black transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-docuhealth-dark font-medium">Category</label>
              <div className="relative">
                <select
                  value={orderForm.category}
                  onChange={(e) => setOrderForm({ ...orderForm, category: e.target.value, test_type: [] })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 bg-white outline-none focus:border-docuhealth-primary transition-colors appearance-none"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.sqid || cat.id} value={cat.sqid || cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Test Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-docuhealth-dark font-medium">Test type</label>
              <div className="relative">
                <button
                  type="button"
                  disabled={!orderForm.category}
                  onClick={() => setIsTestTypeDropdownOpen((v) => !v)}
                  className={`w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-left flex justify-between items-center transition-colors ${!orderForm.category ? "opacity-60 cursor-not-allowed bg-gray-50" : "bg-white focus:border-docuhealth-primary"}`}
                >
                  <span className="truncate text-gray-700">
                    {isTestTypesLoading
                      ? "Loading..."
                      : orderForm.test_type.length > 0
                        ? orderForm.test_type.map((id) => fetchedTestTypes.find((t) => (t.sqid || t.name) === id)?.name || id).join(", ")
                        : "Select test type"}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isTestTypeDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isTestTypeDropdownOpen && fetchedTestTypes.length > 0 && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto overflow-x-hidden">
                    {fetchedTestTypes.map((test, index) => {
                      const id = test.sqid || test.name;
                      const checked = orderForm.test_type.includes(id);
                      return (
                        <label key={id} className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-docuhealth-dark ${index !== fetchedTestTypes.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setOrderForm((prev) => ({
                                ...prev,
                                test_type: checked
                                  ? prev.test_type.filter((t) => t !== id)
                                  : [...prev.test_type, id],
                              }));
                            }}
                            className="w-4 h-4 accent-blue-600 rounded border-gray-300"
                          />
                          {test.name}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Add note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-docuhealth-dark font-medium">Add note:</label>
              <textarea
                value={orderForm.note}
                onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })}
                placeholder="Please do note that this account will be on read-only-mode. This will change once the account is upgraded once the owner is 18 years old."
                className="border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500 bg-white outline-none focus:border-docuhealth-primary transition-colors resize-none h-28"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleCreateOrder}
              disabled={isOrderPending}
              className="w-full bg-docuhealth-primary text-white text-sm font-medium py-2.5 rounded-full transition-colors disabled:opacity-50 hover:bg-docuhealth-primary-variant"
            >
              {isOrderPending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : "Proceed"}
            </button>
          </div>
        </div>
      )}

      {/* ── Duplicate Warning Modal ── */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Duplicate Order Detected</h3>
              <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap text-left bg-orange-50 p-3 rounded-md">
                {duplicateWarning}
              </p>
              <p className="text-sm text-gray-600 font-medium">Are you sure you want to proceed?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDuplicateWarning(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideSubmit}
                disabled={isOrderPending}
                className="flex-1 px-4 py-2 bg-docuhealth-primary text-white rounded-lg hover:bg-docuhealth-dark-primary transition-colors disabled:opacity-50"
              >
                {isOrderPending ? "Proceeding..." : "Proceed Anyway"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-green-700 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <p className="text-base font-semibold text-gray-800 mb-6 leading-snug">
              You have successfully created/<br />accepted a patient&apos;s test request!
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-docuhealth-primary text-white text-sm font-semibold py-3 rounded-full hover:opacity-90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

PatientInfo.propTypes = {
  selectedPatientDetails: PropTypes.shape({
    status:  PropTypes.string,
    patient: PropTypes.shape({
      hin:       PropTypes.string,
      firstname: PropTypes.string,
      lastname:  PropTypes.string,
      dob:       PropTypes.string,
      email:     PropTypes.string,
      phone_num: PropTypes.string,
      street:    PropTypes.string,
      city:      PropTypes.string,
      state:     PropTypes.string,
      country:   PropTypes.string,
      gender:    PropTypes.string,
    }),
  }),
  setSeePatientDetails: PropTypes.func,
};

export default PatientInfo;
