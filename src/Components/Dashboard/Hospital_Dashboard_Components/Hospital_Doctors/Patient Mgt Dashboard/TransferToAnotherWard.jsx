import React, { useState, useEffect, useContext } from "react";
import { DoctorAppContext } from "../../../../../context/Hospital Context/Doctors/DoctorAppContext";
import axiosInstanceHos from "../../../../../utils/axiosInstanceHos";
import {toast} from "react-hot-toast";

const TransferToAnotherWard = ({ setRequestAdmission, selectedPatientDetails }) => {

      const { profile, wards } = useContext(DoctorAppContext);
    
      const [wardOptions, setWardOptions] = useState([]);
      const [availableBeds, setAvailableBeds] = useState([]);
      const [loading, setLoading] = useState(false);

        const [form, setForm] = useState({
          ward: "",
          bed: "",
          patient_hin: selectedPatientDetails
            ? selectedPatientDetails?.patient?.hin
            : "",
          staff_id: profile ? profile.staff_id : "",
        });

          useEffect(() => {
    if (Array.isArray(wards)) {
      setWardOptions(wards);
      console.log(selectedPatientDetails);
    }
  }, [wards]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === "ward") {
      const selected = wardOptions.find((w) => w.id === Number(value));

      if (selected) {
        const beds = selected.beds.filter((b) => b.status === "available");
        setAvailableBeds(beds);
      } else {
        setAvailableBeds([]);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axiosInstanceHos.post("api/doctors/admissions/reques", form);

      console.log(res)
      toast.success("Transfer request successful");
      setLoading(false);
      setRequestAdmission(false);
    } catch (err) {
      console.error("Error submitting transfer request:", err);
      toast.error("Error submitting transfer request");
      setLoading(false);
    } finally {
      setLoading(false);
      setRequestAdmission(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3 text-sm">
        <div className="bg-white rounded-md shadow-lg p-6 max-w-md w-full relative">
          <div className="flex justify-end">
            <button
              onClick={() => setRequestAdmission(false)}
              className="text-gray-500 hover:text-black  "
            >
              <i className="bx bx-x text-2xl cursor-pointer"></i>
            </button>
          </div>
          <div className="flex flex-col justify-center items-center pb-5">
            <p className="pt-0.5 font-medium ">Request for patient transfer</p>
            <p className="pt-1 text-[12px]">
              Select the most suitable ward for the patient
            </p>
          </div>

          <select
            value={form.ward}
            onChange={(e) => handleChange("ward", e.target.value)}
            className="border p-2 rounded-lg outline-none text-sm w-full"
          >
            <option value="">Assign to ward</option>
            {wardOptions.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ward
              </option>
            ))}
          </select>

          {form.ward && (
            <select
              value={form.bed}
              onChange={(e) => handleChange("bed", e.target.value)}
              className="border p-2 rounded-lg outline-none text-sm w-full mt-3"
            >
              <option value="">Select available bed</option>
              {availableBeds.length > 0 ? (
                availableBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bed {b.bed_number}
                  </option>
                ))
              ) : (
                <option disabled>No available beds</option>
              )}
            </select>
          )}

          <button className={`py-2  text-white  ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#3E4095] cursor-pointer"
                } rounded-full mt-4  w-full`} 
          disabled={loading || !form.ward || !form.bed}
          onClick={()=> {
            handleSubmit()
          }}>
               {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Transferring patient...
                  </div>
                ) : (
                  "Proceed"
                )}
          </button>
        </div>
      </div>
    </>
  )
}

export default TransferToAnotherWard