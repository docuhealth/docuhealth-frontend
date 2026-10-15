import React, { useState } from "react";
import { X, Check, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../../ui/Modal";
import Input from "../../../ui/Input";
import Select from "../../../ui/Select";
import Button from "../../../ui/Button";
import { createLabScientist } from "../../../../queries/Hospital/lab/requests";
import { extractApiErrorMessage } from "../../../../utils/apiError";

const LAB_SPECIALIZATIONS = [
  { value: "Microbiology", label: "Microbiology" },
  { value: "Haematology", label: "Haematology" },
  { value: "Chemical Pathology", label: "Chemical Pathology" },
  { value: "Clinical Chemistry", label: "Clinical Chemistry" },
  { value: "Histopathology", label: "Histopathology" },
  { value: "Immunology", label: "Immunology" },
  { value: "Parasitology", label: "Parasitology" },
  { value: "Molecular Biology", label: "Molecular Biology" },
  { value: "General Laboratory Science", label: "General Laboratory Science" },
];

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

const AddLabScientistModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phone_num: "",
    gender: "female",
    specialization: "Microbiology",
    invitation_message: "Welcome to our laboratory team. You can now log into your dashboard to manage test orders and results.",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createMutation = useMutation({
    mutationFn: (payload) => createLabScientist(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospital-staffs"] });
      queryClient.invalidateQueries({ queryKey: ["hospital-staffs-lab-admin-check"] });
      queryClient.invalidateQueries({ queryKey: ["lab-health-personnel"] });
      queryClient.invalidateQueries({ queryKey: ["lab-audit-logs"] });
      setShowSuccess(true);
    },
    onError: (err) => {
      toast.error(extractApiErrorMessage(err, "Failed to create lab scientist account."));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.firstname.trim() || !form.lastname.trim() || !form.email.trim() || !form.password.trim() || !form.phone_num.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    const payload = {
      email: form.email.trim().toLowerCase(),
      password: form.password,
      profile: {
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        phone_num: form.phone_num.trim(),
        role: "lab_scientist",
        specialization: form.specialization,
        gender: form.gender,
      },
      invitation_message: form.invitation_message.trim() || "Welcome to the team",
      login_url: `${window.location.origin}/login`,
    };

    createMutation.mutate(payload);
  };

  const handleClose = () => {
    if (createMutation.isPending) return;
    setShowSuccess(false);
    setForm({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      phone_num: "",
      gender: "female",
      specialization: "Microbiology",
      invitation_message: "Welcome to our laboratory team. You can now log into your dashboard to manage test orders and results.",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeDisabled={createMutation.isPending}
      maxWidth={showSuccess ? "md" : "xl"}
      title={showSuccess ? "" : "Add New Lab Scientist"}
    >
      {showSuccess ? (
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
            <div className="w-14 h-14 rounded-full bg-[#22C55E] flex items-center justify-center shadow-sm">
              <Check className="w-8 h-8 text-white stroke-[3]" />
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2">
            Lab Scientist Account Created!
          </h3>
          <p className="text-xs text-gray-500 mb-6 max-w-xs">
            A welcome email with login instructions has been sent to{" "}
            <strong className="text-slate-700">{form.email}</strong>.
          </p>

          <button
            onClick={handleClose}
            className="w-full bg-[#22C55E] hover:bg-green-600 text-white font-semibold py-2.5 px-6 rounded-full transition-colors cursor-pointer text-sm"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-normal text-gray-500 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                placeholder="e.g. Amina"
                className="text-sm font-normal py-2.5 px-3.5"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-normal text-gray-500 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                placeholder="e.g. Yusuf"
                className="text-sm font-normal py-2.5 px-3.5"
                required
              />
            </div>
          </div>

          {/* Contact Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-normal text-gray-500 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="labscientist@hospital.com"
                className="text-sm font-normal py-2.5 px-3.5"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-normal text-gray-500 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                name="phone_num"
                type="tel"
                value={form.phone_num}
                onChange={handleChange}
                placeholder="08031234567"
                className="text-sm font-normal py-2.5 px-3.5"
                required
              />
            </div>
          </div>

          {/* Role / Gender Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-normal text-gray-500 mb-1">
                Area of Specialization <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.specialization}
                onChange={(val) => setForm((prev) => ({ ...prev, specialization: typeof val === "string" ? val : val?.value || val }))}
                options={LAB_SPECIALIZATIONS}
                placeholder="Select specialization"
              />
            </div>
            <div>
              <label className="block text-xs font-normal text-gray-500 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.gender}
                onChange={(val) => setForm((prev) => ({ ...prev, gender: typeof val === "string" ? val : val?.value || val }))}
                options={GENDER_OPTIONS}
                placeholder="Select gender"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-normal text-gray-500 mb-1">
              Account Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className="text-sm font-normal py-2.5 px-3.5 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Welcome Message */}
          <div>
            <label className="block text-xs font-normal text-gray-500 mb-1">
              Welcome / Invitation Message
            </label>
            <textarea
              name="invitation_message"
              rows={2}
              value={form.invitation_message}
              onChange={handleChange}
              placeholder="Included in welcome email..."
              className="w-full text-xs font-normal p-3 border border-gray-300 rounded-lg outline-none focus:border-docuhealth-primary text-slate-700 placeholder:text-gray-400 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={createMutation.isPending}
              className={`px-5 py-2.5 rounded-full border text-xs font-medium transition-colors ${
                createMutation.isPending
                  ? "border-gray-200 text-gray-300 cursor-not-allowed opacity-50"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
              }`}
            >
              Cancel
            </button>
            <Button
              type="submit"
              fullWidth={false}
              disabled={createMutation.isPending}
              className="px-8 py-2.5 rounded-full text-xs font-semibold flex items-center justify-center text-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Lab Scientist"
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AddLabScientistModal;
