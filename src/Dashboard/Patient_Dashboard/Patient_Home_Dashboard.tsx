import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { usePatientProfile } from "../../hooks/patients/usePatientProfile";
import { useIdCardStore } from "../../store/useIdCardStore";
import { useCreateIdCard } from "../../hooks/patients/useCreateIdCard";
import toast from "react-hot-toast";
import DynamicDate from "../../Components/DynamicDate/DynamicDate";
import { ChevronDown } from "lucide-react";
import NoticeDisplay from "../../Components/Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/NoticeDisplay/NoticeDisplay";
import MedicalRecords from "../../Components/Dashboard/Patient_Dashboard_Components/Home_Dashboard/MedicalRecords";
import MedicalRecordsDetail from "../../Components/Dashboard/Patient_Dashboard_Components/Home_Dashboard/MedicalRecordsDetail";
import Id_Card from "../../Components/Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/IdCard/Id_Card";
import { useHasActiveSubscription } from "../../hooks/patients/useHasActiveSubscription";
import { usePatientVitalSigns } from "../../hooks/patients/usePatientVitalSigns";
import RecentVitalSigns from "../../Components/Dashboard/Patient_Dashboard_Components/Home_Dashboard/Components/RecentVitalSigns";
import DrugRecordsOnHome from "../../Components/Dashboard/Patient_Dashboard_Components/Home_Dashboard/DrugRecordsOnHome";
import { MedicalRecord } from "../../types/patients/home";
import Button from "../../Components/ui/Button";

const Patient_Home_Dashboard = () => {
    const navigate = useNavigate();
  const options = ["Latest", "Oldest", "A-Z", "Z-A"];
  const recordTypeOptions = ["My Medical records", "My Drug Records"];
  const [isOpen, setIsOpen] = useState(false);
  const [isRecordTypeOpen, setIsRecordTypeOpen] = useState(false);
  const [recordType, setRecordType] = useState("My Medical records");
  const [selected, setSelected] = useState("Latest");
  const [viewDetailMedicalRecord, setViewDetailMedicalRecord] = useState(false);
  const [viewRecentVitals, setViewRecentVitals] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<MedicalRecord | null>(null);
  const [vitalPage, setVitalPage] = useState(1);

  const [noticeDisplay, setNoticeDisplay] = useState(false);

  const { data: profile } = usePatientProfile();

  const {
    onboardIDCard,
    setOnboardIDCard,
    idCardData,
    handleChange,
    isIDCreatedSuccessfully,
    setIsIDCreatedSuccessfully,
    handleSelection,
    selectedProfile,
  } = useIdCardStore();
  const { mutate: handleIDCardCreation, isPending: isCreatingID } = useCreateIdCard();
  const hasSubscription = useHasActiveSubscription();

  const { data: vitalSigns, isPending: loadingVitals } = usePatientVitalSigns(vitalPage);

useEffect(() => {
    // 1. Delay the initial appearance by 3 seconds (3000ms)
    const initialDelay = setTimeout(() => {
      setNoticeDisplay(true);
    }, 2000);


    const interval = setInterval(() => {
      setNoticeDisplay(true);
    }, 86400000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };

  const closeNoticeMessage = () => {
    setNoticeDisplay(false);
  };

  return (
    <>
      <div className="hidden text-sm sm:flex justify-between items-center">
        <div className="flex items-center gap-4 z-20">
          <DynamicDate />
          <div className="relative">
            <button
              onClick={() => setIsRecordTypeOpen(!isRecordTypeOpen)}
              className="flex items-center gap-2 font-medium transition cursor-pointer"
            >
              {recordType}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isRecordTypeOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isRecordTypeOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xs shadow-lg z-30">
                {recordTypeOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setRecordType(option);
                      setIsRecordTypeOpen(false);
                      setViewDetailMedicalRecord(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p>
              HIN : <span>{profile ? profile.hin : "loading.."}</span>
            </p>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 hover:bg-blue-50"
            >
              Sort by: {selected}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
            {isOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xs shadow-lg z-10">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                if (profile) {
                  if (!hasSubscription) {
                    toast.error("Please subscribe to access feature");
                    navigate("/user-subscriptions-dashboard");
                    return;
                  }
                  if (loadingVitals) {
                    toast.loading("Fetching your vitals...", { id: "vitals-loading" });
                    return;
                  }
                  toast.dismiss("vitals-loading");
                  setViewRecentVitals(true);
                }
              }}
            >
              View Recent Vitals
            </Button>
          </div>
          <div>
            <Button
              variant="primary"
              className="flex items-center gap-2"
              onClick={() => {
                if (profile) {
                  if (!hasSubscription) {
                    toast.error("Please subscribe to access feature");
                    navigate("/user-subscriptions-dashboard");
                    return;
                  }
                  if(profile.id_card_generated){
                      toast.error("ID Card is already generated !");
                      toast.success('Visit the settings page to view it.')
                      return
                  }
                  handleSelection(profile);
                } else {
                  console.log("no profile");
                  toast.error("We couldn't find a profile. Try again");
                }
              }}
            >
              Get Identity Card
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Responsiveness  */}
      <div className="text-sm flex flex-col items-start sm:hidden gap-2 z-20">
        <div className="flex items-center gap-4">
          <DynamicDate />
          <div className="relative">
            <button
              onClick={() => setIsRecordTypeOpen(!isRecordTypeOpen)}
              className="flex items-center gap-2 font-medium transition cursor-pointer"
            >
              {recordType}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isRecordTypeOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isRecordTypeOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xs shadow-lg z-30">
                {recordTypeOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setRecordType(option);
                      setIsRecordTypeOpen(false);
                      setViewDetailMedicalRecord(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <div>
            <p>
              HIN : <span># {profile ? profile.hin : "loading.."}</span>
            </p>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setIsOpen(!isOpen)}
              className="flex justify-center items-center gap-2 hover:bg-blue-50"
            >
              Sort by: {selected}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
            {isOpen && (
              <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-xs shadow-lg z-10">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Button
              variant="outline"
              fullWidth
              className="flex justify-center items-center gap-2"
               onClick={() => {
                if (profile) {
                  if (!hasSubscription) {
                    toast.error("Please subscribe to access feature");
                    navigate("/user-subscriptions-dashboard");
                    return;
                  }
                  if (loadingVitals) {
                    toast.loading("Fetching your vitals...", { id: "vitals-loading" });
                    return;
                  }
                  toast.dismiss("vitals-loading");
                  setViewRecentVitals(true);
                } else {
                  console.log("no profile");
                  toast.error("We couldn't find a profile. Try again");
                }
              }}
            >
              View Recent Vitals
            </Button>
          </div>
          <div>
            <Button
              variant="primary"
              fullWidth
              className="flex justify-center items-center gap-2"
               onClick={() => {
                if (profile) {
                  if (!hasSubscription) {
                    toast.error("Please subscribe to access feature");
                    navigate("/user-subscriptions-dashboard");
                    return;
                  }
                  if(profile.id_card_generated){
                      toast.error("ID Card is already generated !");
                      toast.success('Visit the settings page to view it.')
                      return
                  }
                  handleSelection(profile);
                } else {
                  console.log("no profile");
                  toast.error("We couldn't find a profile. Try again");
                }
              }}
            >
              Get Identity Card
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ Pass loading state */}
      {viewRecentVitals ? (
        <RecentVitalSigns
          vitalSigns={vitalSigns}
          setViewRecentVitals={setViewRecentVitals}
          currentPage={vitalPage}
          setCurrentPage={setVitalPage}
        />
      ) : recordType === "My Drug Records" ? (
        <DrugRecordsOnHome />
      ) : viewDetailMedicalRecord ? (
        <MedicalRecordsDetail
          selectedMedicalRecord={selectedMedicalRecord}
          setViewDetailMedicalRecord={setViewDetailMedicalRecord}
        />
      ) : (
        <MedicalRecords
          selected={selected}
          setViewDetailMedicalRecord={setViewDetailMedicalRecord}
          setSelectedMedicalRecord={setSelectedMedicalRecord}
        />
      )}

      <Id_Card
        onboardIDCard={onboardIDCard}
        setOnboardIDCard={setOnboardIDCard}
        idCardData={idCardData}
        handleChange={handleChange}
        handleIDCardCreation={handleIDCardCreation}
        isCreatingID={isCreatingID}
        isIDCreatedSuccessfully={isIDCreatedSuccessfully}
        setIsIDCreatedSuccessfully={setIsIDCreatedSuccessfully}
        selectedProfile={selectedProfile}
      />

      <NoticeDisplay
        noticeDisplay={noticeDisplay}
        closeNoticeMessage={closeNoticeMessage}
        handleSelection={handleSelection}
      />
    </>
  );
};

export default Patient_Home_Dashboard;
