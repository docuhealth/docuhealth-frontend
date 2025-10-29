import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/Patient Context/AppContext";
import { IdCardContext } from "../../context/Patient Context/IdCardContext";
import toast from "react-hot-toast";
import DynamicDate from "../../Components/Dynamic Date/DynamicDate";
import { ChevronDown } from "lucide-react";
import NoticeDisplay from "../../Components/Dashboard/Patient_Dashboard_Components/Home Dashboard/Components/NoticeDisplay/NoticeDisplay";
import MedicalRecords from "../../Components/Dashboard/Patient_Dashboard_Components/Home Dashboard/MedicalRecords";
import MedicalRecordsDetail from "../../Components/Dashboard/Patient_Dashboard_Components/Home Dashboard/MedicalRecordsDetail";
import Id_Card from "../../Components/Dashboard/Patient_Dashboard_Components/Home Dashboard/Components/Id Card/Id_Card";

const Patient_Home_Dashboard = () => {
  const options = ["Latest", "Oldest", "A-Z", "Z-A"];
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Latest");
  const [viewDetailMedicalRecord, setViewDetailMedicalRecord] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);

  const [noticeDisplay, setNoticeDisplay] = useState(false);

  const {profile} = useContext(AppContext);

  const {
    onboardIDCard,
    setOnboardIDCard,
    idCardData,
    handleChange,
    handleIDCardCreation,
    isIDCreatedSuccessfully,
    setIsIDCreatedSuccessfully,
    handleSelection,
    selectedProfile,
  } = useContext(IdCardContext);

  useEffect(() => {
    // Show notice immediately when the dashboard loads
    setNoticeDisplay(true);

    const interval = setInterval(() => {
      setNoticeDisplay(true);
    }, 86400000);

    return () => clearInterval(interval);
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
  };

  const closeNoticeMessage = () => {
    setNoticeDisplay(false);
  };

  return (
    <>
      <div className="hidden text-sm sm:flex justify-between items-center">
        <div>
          <DynamicDate />
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p>
              HIN : <span># {profile ? profile.hin : "loading.."}</span>
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-6 py-2 border border-[#3E4095] text-[#3E4095] font-medium rounded-full hover:bg-blue-50 transition"
            >
              Sort by: {selected}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-sm shadow-lg z-10">
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
            <button
              className="flex items-center gap-2 px-6 py-2 bg-[#3E4095] text-white font-medium rounded-full transition"
              onClick={() => handleSelection(profile)}
            >
              Get Identity Card
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Responsiveness  */}
      <div className="text-sm flex flex-col items-start sm:hidden gap-1">
        <div>
          <DynamicDate />
        </div>
        <div className="flex flex-col gap-3 w-full">
          <div>
            <p>
              HIN : <span># {profile ? profile.hin : "loading.."}</span>
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex justify-center items-center gap-2 px-6 py-2 border border-[#3E4095] text-[#3E4095] font-medium rounded-full hover:bg-blue-50 transition w-full"
            >
              Sort by: {selected}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-sm shadow-lg z-10">
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
            <button
              className="flex justify-center items-center gap-2 px-6 py-2 bg-[#3E4095] text-white font-medium rounded-full transition w-full "
              onClick={() => setOnboardIDCard(true)}
            >
              Get Identity Card
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Pass loading state */}
      {viewDetailMedicalRecord ? (
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
        isIDCreatedSuccessfully={isIDCreatedSuccessfully}
        setIsIDCreatedSuccessfully={setIsIDCreatedSuccessfully}
        selectedProfile = {selectedProfile}
      />

      <NoticeDisplay
        noticeDisplay={noticeDisplay}
        closeNoticeMessage={closeNoticeMessage}
        handleSelection ={handleSelection}
      />
    </>
  );
};

export default Patient_Home_Dashboard;
