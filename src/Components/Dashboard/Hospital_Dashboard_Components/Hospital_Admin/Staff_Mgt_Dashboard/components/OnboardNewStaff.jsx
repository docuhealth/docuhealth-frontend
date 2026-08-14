import React, { useState, useEffect, useContext } from "react";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HosAppContext } from "../../../../../../context/HospitalContext/Admin/HosAppContext";
import { HosWardContext } from "../../../../../../context/HospitalContext/HosWardContext";

import axiosInstanceHos from "../../../../../../lib/axios/hospital";
import toast from "react-hot-toast";

// Backend error responses show up in a few different shapes:
// - { detail: "..." } (FastAPI)
// - { message: "..." } (some newer endpoints)
// - { field_name: ["..."] } (DRF-style field validation errors)
const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (!data) return "Something went wrong.";
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;

  const firstFieldError = Object.values(data).find(
    (value) => Array.isArray(value) && typeof value[0] === "string",
  );
  if (firstFieldError) return firstFieldError[0];

  return "Something went wrong.";
};

const OnboardNewStaff = ({ setCreateNewStaff }) => {
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    gender: "",
    role: "",
    personnel: "",
    specialization: "",
    ward: "",
    email: "",
    password: "",
  });

  const { profile } = useContext(HosAppContext);
  const { wards } = useContext(HosWardContext);

  console.log(wards);

  const [passwordRequirements, setPasswordRequirements] = useState({});
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0 });

  const personnelOptions = ["doctor", "nurse", "receptionist", "lab_scientist", "pharmacist"];

  // Personnel types that are not assigned to a ward during staff creation.
  const noWardRoles = ["receptionist", "lab_scientist", "pharmacist"];

  const doctorSpecializations = [
    "Surgeon",
    "General Dentist",
    "Gynecologist",
    "Obstetrician",
    "Pediatrician",
    "Cardiologist",
    "Endocrinologist",
    "General Practitioner",
    "Neurologist",
    "Dermatologist",
    "Orthopedic",
    "Radiologist",
    "Anesthesiologist",
    "Histopathologist",
    "Oncopathologist",
    "Interventional Pathologist",
    "Surgical Pathologist",
    "Forensic Pathologist",
    "Gastrointestinal (GIT) Pathologist",
    "Family Physician",
  ];

  const nurseSpecializations = [
    "General Nurse / Registered Nurse (RN)",
    "Pediatric Nurse",
    "Geriatric Nurse",
    "Neonatal Nurse",
    "Obstetric / Midwife Nurse",
    "Mental Health / Psychiatric Nurse",
    "Oncology Nurse",
    "Cardiac / Critical Care Nurse",
    "Emergency / Trauma Nurse",
    "Community Health Nurse",
    "Home Health Nurse",
    "Surgical / Operating Room (OR) Nurse",
    "Nurse Anesthetist",
    "Nurse Educator",
    "Nurse Researcher",
    "Infection Control Nurse",
    "Hospice / Palliative Care Nurse",
  ];

  const labScientistSpecializations = [
    "N/A",
    "Hematology and Blood Transfusion",
    "Chemical Pathology",
    "Medical Microbiology",
    "Immunology and Immunochemistry",
    "Histopathology and Cytopathology",
    "Molecular Diagnostics",
    "Forensic Laboratory Science",
  ];

  const pharmacistSpecializations = [
    "N/A",
    "General Pharmacist",
    "Clinical Pharmacist",
    "Oncology Pharmacist",
    "Pediatric Pharmacist",
    "Nuclear Pharmacist",
    "Informatics Pharmacist",
  ];

  const specializationOptions =
    form.personnel === "doctor"
      ? doctorSpecializations
      : form.personnel === "nurse"
        ? nurseSpecializations
        : form.personnel === "lab_scientist"
          ? labScientistSpecializations
          : form.personnel === "pharmacist"
            ? pharmacistSpecializations
            : [];

  const gender = ["male", "female"];

  const [wardOptions, setWardOptions] = useState([]);

  useEffect(() => {
    if (Array.isArray(wards)) {
      setWardOptions(wards);
    }
  }, [wards]);

  // Auto-generate password on step 2
  useEffect(() => {
    if (step === 2) {
      const generated = generatePassword();
      handleChange("password", generated);
      validatePassword(generated);
      setPasswordStrength(getPasswordStrength(generated));
    }
  }, [step]);

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }
    return pass;
  };

  const validatePassword = (password) => {
    const requirements = {
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      hasMinLength: password.length >= 8,
    };

    setPasswordRequirements(requirements);
    const allRequirementsMet = Object.values(requirements).every(Boolean);
    setIsPasswordValid(allRequirementsMet);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

    if (score <= 1)
      return { strength: score, label: "Very Weak", color: "bg-red-500" };
    if (score <= 2)
      return { strength: score, label: "Weak", color: "bg-orange-500" };
    if (score <= 3)
      return { strength: score, label: "Fair", color: "bg-yellow-500" };
    if (score <= 4)
      return { strength: score, label: "Good", color: "bg-docuhealth-primary" };
    return { strength: score, label: "Strong", color: "bg-green-500" };
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "personnel" && { specialization: "", ward: "" }),
    }));
  };

  const invitationHTML = `
        <p>Hi ${form.firstname + " " + form.lastname},</p>
        <p>Welcome onboard, you can log into your private dashboard using the login details below:</p>
        <p>Email: <strong>${form.email}</strong></p>
        <p>Password: <strong>${form.password}</strong></p>
        <p>You can reset your password anytime after login.</p>
        <p>Regards,<br/>${profile?.profile?.hospital_profile?.name || ""}</p>
    `;

  const handleNextStep = () => {
    if (
      !form.firstname.trim() ||
      !form.lastname.trim() ||
      !form.phone.trim() ||
      !form.personnel.trim() ||
      !form.gender.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const isReceptionist = form.personnel.toLowerCase() === "receptionist";
    const isNoWardRole = noWardRoles.includes(form.personnel.toLowerCase());

    // Specialization required for anyone with a specialization list (i.e. not receptionist)
    if (!isReceptionist && !form.specialization.trim()) {
      toast.error("Please select an area of specialization.");
      return;
    }

    // Ward required only for roles that are assigned to a ward
    if (!isNoWardRole && !form.ward.trim()) {
      toast.error("Please assign a ward.");
      return;
    }

    setStep(2);
  };

  const createStaffMutation = useMutation({
    mutationFn: (payload) =>
      axiosInstanceHos.post("api/hospitals/team-member", payload),
    onSuccess: () => {
      toast.success("Team member added successfully");

      // 🔹 THIS INVALIDATES THE STAFF LIST
      queryClient.invalidateQueries(["hospital-staffs"]);

      // Reset and Close
      setForm({
        firstname: "",
        lastname: "",
        phone: "",
        gender: "",
        role: "",
        personnel: "",
        specialization: "",
        ward: "",
        email: "",
        password: "",
      });
      setStep(1);
      setCreateNewStaff(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email) return toast.error("Enter an email address");

    const payload = {
      email: form.email,
      password: form.password,
      profile: {
        firstname: form.firstname,
        lastname: form.lastname,
        phone_num: form.phone,
        role: form.personnel,
        gender: form.gender,
        staff_id: "NIG_101", // Consider generating this dynamically if needed
        email: form.email,
        ...(form.specialization && { specialization: form.specialization }),
        ...(form.ward && { ward: form.ward }),
      },
      login_url: "https://hospital.docuhealthservices.net/login",
      invitation_message: invitationHTML,
    };

    createStaffMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-md shadow-lg p-6 max-w-xl w-full relative">
        <div className="mb-5">
          <p className="text-sm">Step {step} of 2</p>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
            <div
              className={`bg-docuhealth-primary h-2 rounded-full transition-all duration-500 ease-in-out`}
              style={{ width: step === 1 ? "50%" : "100%" }}
            ></div>
          </div>
        </div>
        {step === 1 && (
          <div className="mx-1 sm:mx-5">
            <div className="flex items-center justify-between mb-3 ">
              <h2 className=" text-sm font-medium">Add a new team member</h2>
              <i
                onClick={() => {
                  setCreateNewStaff(false);
                }}
                className="bx bx-x text-xl cursor-pointer bg-gray-100 rounded-full"
              ></i>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="First name"
                value={form.firstname}
                onChange={(e) => handleChange("firstname", e.target.value)}
                className="border p-2 rounded-lg outline-none text-sm focus:border-docuhealth-primary"
              />
              <input
                placeholder="Last name"
                value={form.lastname}
                onChange={(e) => handleChange("lastname", e.target.value)}
                className="border p-2 rounded-lg outline-none text-sm focus:border-docuhealth-primary"
              />

              <input
                placeholder="Phone number"
                type="number"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="border p-2 rounded-lg outline-none text-sm focus:border-docuhealth-primary"
              />

              <select
                value={form.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="border p-2 rounded-lg outline-none text-sm  focus:border-docuhealth-primary"
              >
                <option value="">Gender</option>
                {gender.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              {/* Personnel Dropdown */}
              <select
                value={form.personnel}
                onChange={(e) => handleChange("personnel", e.target.value)}
                className="border p-2 rounded-lg outline-none text-sm col-span-2 focus:border-docuhealth-primary"
              >
                <option value="">Healthcare personnel</option>
                {personnelOptions.map((p) => (
                  <option key={p} value={p}>
                    {p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>

              {/* Specialization dropdown */}
              <select
                disabled={form.personnel === "receptionist" || !form.personnel}
                value={form.specialization}
                onChange={(e) => handleChange("specialization", e.target.value)}
                className={`border p-2 rounded-lg outline-none text-sm col-span-2 ${
                  form.personnel === "receptionist" ? "bg-gray-100" : ""
                }`}
              >
                <option value="">Area of specialization</option>
                {specializationOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Ward dropdown */}
              <select
                disabled={noWardRoles.includes(form.personnel)}
                value={form.ward}
                onChange={(e) => handleChange("ward", e.target.value)}
                className={`border p-2 rounded-lg outline-none text-sm col-span-2 focus:border-docuhealth-primary ${
                  noWardRoles.includes(form.personnel) ? "bg-gray-100" : ""
                }`}
              >
                <option value="">Assign to ward</option>
                {wardOptions.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name + " ward"}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleNextStep()}
              className="mt-5 bg-docuhealth-primary text-white px-4 py-2 rounded-full text-sm w-full cursor-pointer"
            >
              Proceed
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mx-1 sm:mx-5">
            <div className="flex items-center justify-between mb-3 ">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => {
                    setStep(step - 1);
                  }}
                  className="cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </div>

                <h2 className=" text-sm font-medium">Add a new team member</h2>
              </div>

              <i
                onClick={() => {
                  setCreateNewStaff(false);
                }}
                class="bx bx-x text-xl cursor-pointer bg-gray-100 rounded-full"
              ></i>
            </div>

            <label className="font-medium text-sm">Invitation message</label>
            <textarea
              className="w-full rounded-lg outline-none p-3 my-2 h-40 text-sm focus:border-docuhealth-primary hide-scrollbar border max-h-[200px]"
              value={invitationHTML}
              readOnly
            />

            <input
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="border p-2 text-sm rounded-lg w-full mt-4 outline-none focus:border-docuhealth-primary"
            />

            <div className="mt-4">
              <label className="font-medium text-sm">Generated password</label>
              <input
                value={form.password}
                readOnly
                className="border p-2 rounded-lg focus:border-docuhealth-primary w-full mt-2 text-sm outline-none"
              />
            </div>

            <button
              className={`mt-5 ${createStaffMutation.isPending ? "bg-gray-400 cursor-not-allowed" : "bg-docuhealth-primary cursor-pointer"}  text-white px-4 py-2 rounded-full w-full text-sm `}
              disabled={createStaffMutation.isPending}
              onClick={handleSubmit}
            >
              {createStaffMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding to team...
                </div>
              ) : (
                "Add to team"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardNewStaff;
