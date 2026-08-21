import { useState } from "react";
import { X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchTestCategories, fetchLabTests, createLabTestOrder } from "../../../../queries/Hospital/lab/requests";
import axiosInstanceHos from "../../../../lib/axios/hospital";
import Button from "../../../ui/Button";
import Modal from "../../../ui/Modal";

const CreateOrderModal = ({ isOpen, onClose, patientHin }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTestTypeDropdownOpen, setIsTestTypeDropdownOpen] = useState(false);
  const [form, setForm] = useState({ category: "", test_type: [], note: "" });

  const [duplicateWarning, setDuplicateWarning] = useState(null);

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
      const requestPayload = {
        patient: patientHin,
        items_data: payload.test_type.map((testSqid) => ({
          test: testSqid,
          note: payload.note,
        })),
      };
      if (payload.ignore_duplicate_warning) {
        requestPayload.ignore_duplicate_warning = true;
      }
      // Note: the `appointment` field has been removed from the lab order
      // serializer — this modal is only ever given a bare patientHin by
      // its caller, so there's nothing here to link an order to.
      return createLabTestOrder(requestPayload);
    },
    onSuccess: () => {
      setForm({ category: "", test_type: [], note: "", ignore_duplicate_warning: false });
      setDuplicateWarning(null);
      setShowSuccess(true);
    },
    onError: (err) => {
      if (err.response?.status === 400 && err.response?.data?.duplicate_warning) {
        setDuplicateWarning(err.response.data.duplicate_warning);
      } else {
        toast.error(err.response?.data?.message || "Failed to create order.");
      }
    },
  });

  const handleSubmit = () => {
    if (!form.category || form.test_type.length === 0) {
      toast.error("Please select a category and at least one test type.");
      return;
    }
    mutate({ ...form, ignore_duplicate_warning: false });
  };

  const handleOverrideSubmit = () => {
    mutate({ ...form, ignore_duplicate_warning: true });
  };

  const handleClose = () => {
    setForm({ category: "", test_type: [], note: "", ignore_duplicate_warning: false });
    setIsTestTypeDropdownOpen(false);
    setShowSuccess(false);
    setDuplicateWarning(null);
    onClose();
  };

  let modalTitle = "Order Lab test";
  if (showSuccess) modalTitle = "";
  if (duplicateWarning) modalTitle = "Duplicate Order Detected";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle}>
      {showSuccess ? (
        <div className="flex flex-col items-center text-center py-4">
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
          <Button onClick={handleClose} fullWidth>
            Done
          </Button>
        </div>
      ) : duplicateWarning ? (
        <div className="flex flex-col gap-6 py-2">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap text-left bg-orange-50 p-3 rounded-md">
              {duplicateWarning}
            </p>
            <p className="text-sm text-gray-600 font-medium">Are you sure you want to proceed?</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Button onClick={() => setDuplicateWarning(null)} variant="outline" fullWidth>
                Cancel
              </Button>
            </div>
            <div className="flex-1">
              <Button onClick={handleOverrideSubmit} disabled={isPending} loading={isPending} loadingText="Proceeding..." fullWidth>
                Proceed Anyway
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-gray-500 -mt-4 mb-2">Kindly order a lab test</p>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-docuhealth-dark font-medium">Category</label>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value, test_type: [] })}
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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-docuhealth-dark font-medium">Test type</label>
            <div className="relative">
              <button
                type="button"
                disabled={!form.category}
                onClick={() => setIsTestTypeDropdownOpen((v) => !v)}
                className={`w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-left flex justify-between items-center transition-colors ${!form.category ? "opacity-60 cursor-not-allowed bg-gray-50" : "bg-white focus:border-docuhealth-primary"}`}
              >
                <span className="truncate text-gray-700">
                  {isTestTypesLoading
                    ? "Loading..."
                    : form.test_type.length > 0
                      ? form.test_type.map((id) => fetchedTestTypes.find((t) => (t.sqid || t.name) === id)?.name || id).join(", ")
                      : "Select test type"}
                </span>
                <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isTestTypeDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isTestTypeDropdownOpen && fetchedTestTypes.length > 0 && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto overflow-x-hidden">
                  {fetchedTestTypes.map((test, index) => {
                    const id = test.sqid || test.name;
                    const checked = form.test_type.includes(id);
                    return (
                      <label key={id} className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-docuhealth-dark ${index !== fetchedTestTypes.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setForm((prev) => ({
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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-docuhealth-dark font-medium">Add note:</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Please do note that this account will be on read-only-mode. This will change once the account is upgraded once the owner is 18 years old."
              className="border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500 bg-white outline-none focus:border-docuhealth-primary transition-colors resize-none h-28"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            loading={isPending}
            loadingText="Creating..."
            fullWidth
          >
            Proceed
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default CreateOrderModal;
