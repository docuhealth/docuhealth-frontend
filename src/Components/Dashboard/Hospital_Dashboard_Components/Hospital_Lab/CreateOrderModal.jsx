import { useState } from "react";
import { X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchTestCategories, fetchLabTests } from "../../../../queries/Hospital/lab/requests";
import axiosInstanceHos from "../../../../utils/axiosInstanceHos";
import SuccessModal from "./SuccessModal";

const CreateOrderModal = ({ isOpen, onClose, patientHin }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTestTypeDropdownOpen, setIsTestTypeDropdownOpen] = useState(false);
  const [form, setForm] = useState({ category: "", test_type: [], date: "", time: "" });

  const { data: categoriesData } = useQuery({
    queryKey: ["lab-test-categories"],
    queryFn: fetchTestCategories,
    staleTime: Infinity,
    enabled: isOpen,
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.results ?? []);

  const { data: testTypesData, isLoading: isTestTypesLoading } = useQuery({
    queryKey: ["lab-tests", form.category],
    queryFn: fetchLabTests,
    enabled: !!form.category,
    staleTime: Infinity,
  });
  const fetchedTestTypes = Array.isArray(testTypesData) ? testTypesData : (testTypesData?.results ?? []);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload) => {
      const promises = payload.test_type.map((testSqid) =>
        axiosInstanceHos.post("api/lab/test-orders/create", {
          test: testSqid,
          patient: patientHin,
          note: `Scheduled: ${payload.date} ${payload.time}`,
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      setForm({ category: "", test_type: [], date: "", time: "" });
      setShowSuccess(true);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create order.");
    },
  });

  const handleSubmit = () => {
    if (!form.category || form.test_type.length === 0 || !form.date || !form.time) {
      toast.error("Please fill in all fields.");
      return;
    }
    mutate(form);
  };

  const handleClose = () => {
    setForm({ category: "", test_type: [], date: "", time: "" });
    setIsTestTypeDropdownOpen(false);
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
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
            onClick={handleClose}
            className="w-full bg-green-700 text-white text-sm font-semibold py-3 rounded-full hover:bg-green-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">

        {/* Header */}
        <div className="relative flex items-start justify-center">
          <div className="text-center">
            <h3 className="text-base font-semibold text-[#1B2B40]">Patient&apos;s Lab test Request</h3>
            <p className="text-sm text-gray-400 mt-1">Kindly fill up to proceed!</p>
          </div>
          <button
            onClick={handleClose}
            className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-600">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value, test_type: [] })}
            className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white outline-none focus:border-[#3E4095] transition-colors appearance-none"
          >
            <option value="" disabled>Select category</option>
            {categories.map((cat) => (
              <option key={cat.sqid || cat.id} value={cat.sqid || cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Test Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-gray-600">Test type</label>
          <div className="relative">
            <button
              type="button"
              disabled={!form.category}
              onClick={() => setIsTestTypeDropdownOpen((v) => !v)}
              className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-left flex justify-between items-center transition-colors ${!form.category ? "opacity-50 cursor-not-allowed bg-gray-50" : "bg-white"}`}
            >
              <span className="truncate text-gray-700">
                {isTestTypesLoading
                  ? "Loading..."
                  : form.test_type.length > 0
                    ? form.test_type.map((id) => fetchedTestTypes.find((t) => (t.sqid || t.name) === id)?.name || id).join(", ")
                    : "Select test type"}
              </span>
              <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isTestTypeDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isTestTypeDropdownOpen && fetchedTestTypes.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                {fetchedTestTypes.map((test) => {
                  const id = test.sqid || test.name;
                  const checked = form.test_type.includes(id);
                  return (
                    <label key={id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setForm((prev) => ({
                            ...prev,
                            test_type: checked
                              ? prev.test_type.filter((t) => t !== id)
                              : [...prev.test_type, id],
                          }))
                        }
                        className="accent-[#3E4095]"
                      />
                      {test.name}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Date + Time */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm text-gray-600">Request date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white outline-none focus:border-[#3E4095] transition-colors w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm text-gray-600">Request Time</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white outline-none focus:border-[#3E4095] transition-colors w-full"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full bg-[#3E4095] text-white text-sm font-semibold py-3.5 rounded-full transition-colors disabled:opacity-50 hover:bg-[#2e307a]"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </span>
          ) : "Create test order"}
        </button>
      </div>
    </div>
  );
};

export default CreateOrderModal;
