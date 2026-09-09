import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Modal from "../../../../ui/Modal";
import Button from "../../../../ui/Button";
import Input from "../../../../ui/Input";
import { fetchWardBeds, updateWard } from "../../../../../queries/Hospital/fetchWards";
import { Bed } from "lucide-react";

const ManageWardModal = ({ ward, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const wardSqid = ward?.sqid || ward?.id;

  const totalBedsInitial = ward?.beds?.length || 0;
  const freeBeds = ward?.available_beds || 0;
  const occupiedBeds = totalBedsInitial - freeBeds;

  const [formData, setFormData] = useState({
    name: ward?.name || "",
    total_beds: totalBedsInitial.toString(),
  });
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (ward) {
      setFormData({
        name: ward.name || "",
        total_beds: (ward.beds?.length || 0).toString(),
      });
      setValidationError("");
    }
  }, [ward]);

  const { data: bedsData, isLoading: isLoadingBeds } = useQuery({
    queryKey: ["ward-beds", wardSqid],
    queryFn: fetchWardBeds,
    enabled: !!wardSqid && isOpen,
  });

  const updateWardMutation = useMutation({
    mutationFn: (payload) => updateWard({ ward_sqid: wardSqid, ...payload }),
    onSuccess: () => {
      toast.success("Ward updated successfully!");
      queryClient.invalidateQueries(["hospital-wards"]);
      queryClient.invalidateQueries(["ward-beds", wardSqid]);
      onClose();
    },
    onError: (err) => {
      console.error("Error updating ward:", err);
      toast.error(err.response?.data?.message || "Failed to update ward");
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "total_beds") {
      const newTotal = parseInt(value, 10);
      if (!isNaN(newTotal) && newTotal < occupiedBeds) {
        setValidationError(`Total beds cannot be less than the currently occupied beds (${occupiedBeds}).`);
      } else {
        setValidationError("");
      }
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const newTotal = parseInt(formData.total_beds, 10);
    if (!isNaN(newTotal) && newTotal < occupiedBeds) {
      setValidationError(`Total beds cannot be less than the currently occupied beds (${occupiedBeds}).`);
      return;
    }
    
    updateWardMutation.mutate({
      name: formData.name,
      total_beds: newTotal,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Ward: ${ward?.name || ""}`} maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Edit Ward Form */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-4">Edit Ward Details</h4>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Ward Name"
              type="text"
              required
              placeholder="e.g. Emergency"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            
            <Input
              label="Total Beds"
              type="number"
              required
              min={occupiedBeds > 0 ? occupiedBeds : 1}
              placeholder="Enter total capacity"
              value={formData.total_beds}
              onChange={(e) => handleChange("total_beds", e.target.value)}
              error={validationError}
            />

            <div className="pt-2">
              <Button
                type="submit"
                loading={updateWardMutation.isPending}
                loadingText="Updating..."
                disabled={!!validationError || updateWardMutation.isPending}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side: Bed Listing */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-full max-h-[400px] flex flex-col">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
            <span>Bed Listing</span>
            <span className="text-xs bg-indigo-100 text-docuhealth-primary px-2 py-1 rounded-full">
              {bedsData?.length || ward?.beds?.length || 0} Beds
            </span>
          </h4>
          
          <div className="overflow-y-auto flex-1 pr-2 space-y-2">
            {isLoadingBeds ? (
              <div className="text-center py-6 text-sm text-gray-500">Loading beds...</div>
            ) : bedsData && bedsData.length > 0 ? (
              bedsData.map((bed) => (
                <div key={bed.sqid || bed.id} className="bg-white p-3 rounded-md border flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-md">
                      <Bed className="w-4 h-4 text-docuhealth-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Bed {bed.bed_number}</p>
                      <p className="text-xs text-gray-400">ID: {bed.sqid || bed.id}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-md uppercase ${
                    bed.status === "available" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}>
                    {bed.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-gray-500">
                No beds found for this ward.
              </div>
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default ManageWardModal;
